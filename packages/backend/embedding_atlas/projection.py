# Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import asyncio
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path
from typing import IO

import narwhals as nw
import numpy as np
from narwhals.typing import IntoDataFrameT

from .cache import async_file_cache_value
from .embedding import create_embedder
from .utils import logger

DEFAULT_MAX_CONCURRENCY = 8


def compute_projection(
    data_frame: IntoDataFrameT,
    *,
    inputs: str,
    modality: str = "auto",
    x: str = "projection_x",
    y: str = "projection_y",
    neighbors: str | None = "neighbors",
    embedder: str | Callable | None = None,
    model: str | None = None,
    batch_size: int | None = None,
    max_concurrency: int | None = None,
    embedder_args: dict | None = None,
    umap_args: dict | None = None,
    cache_root: str | Path | None = None,
) -> IntoDataFrameT:
    """
    为 DataFrame 中的一列计算嵌入，并生成 2D 投影。

    这是统一入口，会自动检测输入数据的模态（文本、图像、音频或向量），
    并委派给相应的投影流程。

    注意：该函数不能在正在运行的 async event loop（例如 Jupyter notebook）中调用。
    请改用 ``async_compute_projection``。

    Args:
        data_frame: 包含待处理数据的 DataFrame。接受任何兼容 narwhals 的表，
            例如 pandas、Polars、cuDF、Modin 等。
        inputs: 包含待嵌入/投影数据的列名。
        modality: ``inputs`` 列中的数据类型。可为 'text'、'image'、'audio'、
            'vector' 或 'auto'（自动检测）。
        x: 存储 UMAP X 坐标的列名。
        y: 存储 UMAP Y 坐标的列名。
        neighbors: 存储最近邻索引的列名。设置为 None 可跳过。
        embedder: 要使用的 embedding 后端。可以是：
            - 字符串：'sentence-transformers'、'transformers' 或 'litellm'，
              用于选择内置 embedder。
            - 具有以下签名的 async callable：
              ``async def(batch: list[Any], *, model, embedder_args) -> np.ndarray``
              用于自定义 embedder。该函数接收规范化后的条目列表（文本为字符串，
              图像/音频为 ``{"bytes": bytes}`` 字典），并必须返回形状为
              ``(batch_size, embedding_dim)`` 的 ndarray。
            - None（默认）：文本自动选择 'sentence-transformers'，
              图像/音频自动选择 'transformers'。
        model: embedding 模型名称。
        batch_size: 处理时的 batch size。
        max_concurrency: 并发 batch 的最大数量。
        embedder_args: 传给 embedder 的参数（例如 api_key、api_base）。
        umap_args: 传给 UMAP 算法的参数。
        cache_root: 缓存结果的根目录。

    Returns:
        新 DataFrame，类型与输入相同，并新增投影列。
    """
    return asyncio.run(
        async_compute_projection(
            data_frame,
            inputs=inputs,
            modality=modality,
            x=x,
            y=y,
            neighbors=neighbors,
            embedder=embedder,
            model=model,
            batch_size=batch_size,
            max_concurrency=max_concurrency,
            embedder_args=embedder_args,
            umap_args=umap_args,
            cache_root=cache_root,
        )
    )


async def async_compute_projection(
    data_frame: IntoDataFrameT,
    *,
    inputs: str,
    modality: str = "auto",
    x: str = "projection_x",
    y: str = "projection_y",
    neighbors: str | None = "neighbors",
    embedder: str | Callable | None = None,
    model: str | None = None,
    batch_size: int | None = None,
    max_concurrency: int | None = None,
    embedder_args: dict | None = None,
    umap_args: dict | None = None,
    cache_root: str | Path | None = None,
) -> IntoDataFrameT:
    """
    ``compute_projection`` 的 async 版本。

    在正在运行的 async event loop（例如 Jupyter notebook）中调用时请使用它::

        df = await async_compute_projection(df, inputs="text")

    完整参数说明见 ``compute_projection``。
    """
    nw_frame = nw.from_native(data_frame, eager_only=True)
    series = nw_frame[inputs]
    embedder_args = embedder_args or {}
    umap_args = umap_args or {}

    # 1. 推断模态。
    if modality == "auto":
        modality = _infer_modality(series)
        logger.info("自动检测到 modality：%s", modality)

    # 2. 将输入转换为规范格式。
    if modality == "text":
        canonical = _to_canonical_text(series)
    elif modality in ("image", "audio"):
        canonical = _to_canonical_binary(series)
    elif modality == "vector":
        canonical = _to_canonical_vector(series)
    else:
        raise ValueError(
            f"未知 modality：{modality}。必须是以下之一：text、image、audio、vector、auto。"
            f"（Unknown modality: {modality}）"
        )

    # 3. 解析 embedder（向量模态不需要）。
    embedder_max_concurrency: int | None = None
    if modality == "vector":
        embedder_name = None
    else:
        if callable(embedder):
            embedder_name = getattr(embedder, "__name__", type(embedder).__name__)
        else:
            if embedder is None:
                embedder = _default_embedder(modality)
            elif embedder == "sentence_transformers":
                embedder = "sentence-transformers"

            if embedder in ("sentence-transformers", "transformers"):
                embedder_max_concurrency = 1

            embedder_name = embedder

    if max_concurrency is None:
        max_concurrency = DEFAULT_MAX_CONCURRENCY
    if embedder_max_concurrency is not None:
        max_concurrency = min(embedder_max_concurrency, max_concurrency)

    cache_key = {
        "version": 1,
        "inputs": canonical,
        "modality": modality,
        "embedder": embedder_name,
        "model": model,
        "umap_args": umap_args,
        "embedder_args": _caching_embedder_args(embedder_args),
    }

    async def run() -> Projection:
        if modality == "vector":
            embedding = np.array(canonical).astype(np.float32)
        else:
            if callable(embedder):
                embed_fn = embedder
            elif embedder is not None:
                embed_fn = create_embedder(
                    embedder,
                    modality=modality,
                    model=model,
                    embedder_args=embedder_args,
                )
            else:
                raise RuntimeError("unreachable")
            embedding = await _run_embedding(
                embed_fn,
                canonical,
                model=model,
                embedder_args=embedder_args,
                batch_size=batch_size,
                max_concurrency=max_concurrency,
            )

        return _run_umap(embedding, umap_args=umap_args)

    proj = await async_file_cache_value(
        cache_key,
        run,
        scope="compute_projection",
        serializer=Projection.serialize,
        deserializer=Projection.deserialize,
        callback=lambda cache_path: print(
            "正在使用缓存的 projection：" + str(cache_path)
        ),
        cache_root=cache_root,
    )

    # 创建包含原始列的新 data frame，并添加投影列。
    backend = nw.get_native_namespace(nw_frame)
    new_columns = [
        nw.new_series(x, proj.projection[:, 0].tolist(), nw.Float64, backend=backend),
        nw.new_series(y, proj.projection[:, 1].tolist(), nw.Float64, backend=backend),
    ]
    if neighbors is not None:
        new_columns.append(
            nw.new_series(
                neighbors,
                [
                    {"distances": b, "ids": a}
                    for a, b in zip(proj.knn_indices, proj.knn_distances)
                ],
                backend=backend,
            )
        )
    return nw.to_native(nw_frame.with_columns(new_columns))


def _detect_binary_modality(data: bytes) -> str:
    """根据 magic bytes 检测二进制数据是图像还是音频。"""
    # 图像格式。
    if data[:8] == b"\x89PNG\r\n\x1a\n":  # PNG
        return "image"
    if data[:2] == b"\xff\xd8":  # JPEG
        return "image"
    if data[:4] == b"GIF8":  # GIF87a / GIF89a
        return "image"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":  # WebP
        return "image"
    if data[:4] == b"\x00\x00\x01\x00":  # ICO
        return "image"
    if data[:2] in (b"BM",):  # BMP
        return "image"
    if data[:4] in (b"II\x2a\x00", b"MM\x00\x2a"):  # TIFF
        return "image"

    # 音频格式。
    if data[:4] == b"RIFF" and data[8:12] == b"WAVE":  # WAV
        return "audio"
    if data[:4] == b"fLaC":  # FLAC
        return "audio"
    if data[:4] == b"OggS":  # OGG (Vorbis/Opus)
        return "audio"
    if data[:3] == b"ID3" or data[:2] == b"\xff\xfb":  # MP3 (ID3 tag or sync frame)
        return "audio"
    if len(data) >= 12 and data[4:8] == b"ftyp":  # MP4/M4A container
        return "audio"
    if data[:4] == b".snd":  # AU
        return "audio"
    if data[:4] in (b"FORM",) and data[8:12] == b"AIFF":  # AIFF
        return "audio"

    # 无法识别的二进制数据默认按图像处理。
    return "image"


def _infer_modality(series: nw.Series) -> str:
    """通过检查 series 中第一个非 null 值推断模态。"""
    non_null = series.drop_nulls()
    if len(non_null) == 0:
        return "text"
    sample = non_null[0]

    # 检查向量：list[float] 或一维 ndarray。
    if isinstance(sample, np.ndarray) and sample.ndim == 1:
        return "vector"
    if (
        isinstance(sample, list)
        and len(sample) > 0
        and isinstance(sample[0], (int, float))
    ):
        return "vector"

    # 检查图像/音频：bytes 或 {"bytes": ...}。
    if isinstance(sample, bytes):
        return _detect_binary_modality(sample)
    if isinstance(sample, dict) and "bytes" in sample:
        raw = sample["bytes"]
        if isinstance(raw, list):
            raw = bytes(raw)
        return _detect_binary_modality(raw)

    # 默认按文本处理。
    return "text"


def _to_canonical_text(series: nw.Series) -> list[str]:
    """将 series 转换为规范文本格式：list[str]，null 值转为 'null'。"""
    return series.fill_null("null").cast(nw.String).to_list()


def _to_canonical_binary(series: nw.Series) -> list[dict]:
    """将 series 转换为规范图像/音频格式：list[{"bytes": bytes}]。"""
    result = []
    for value in series.to_list():
        if isinstance(value, bytes):
            result.append({"bytes": value})
        elif isinstance(value, dict) and "bytes" in value:
            raw = value["bytes"]
            if isinstance(raw, list):
                raw = bytes(raw)
            result.append({"bytes": raw})
        else:
            raise ValueError(
                f"无法将类型为 {type(value)} 的值转换为 image/audio 格式。"
                f"（Cannot convert value of type {type(value)} to image/audio format）"
            )
    return result


def _to_canonical_vector(series: nw.Series) -> list[np.ndarray]:
    """将 series 转换为规范向量格式：list[ndarray[float32]]。"""
    result = []
    for value in series.to_list():
        if isinstance(value, np.ndarray):
            result.append(value.astype(np.float32))
        else:
            result.append(np.array(value, dtype=np.float32))
    return result


@dataclass
class Projection:
    # 形状为 (N, embedding_dim) 的数组，表示高维嵌入。
    projection: np.ndarray

    knn_indices: np.ndarray
    knn_distances: np.ndarray

    @staticmethod
    def serialize(value: "Projection", fd: IO[bytes]) -> None:
        np.savez(
            fd,
            projection=value.projection,
            knn_indices=value.knn_indices,
            knn_distances=value.knn_distances,
        )

    @staticmethod
    def deserialize(fd: IO[bytes]) -> "Projection":
        d = np.load(fd, allow_pickle=False)
        return Projection(
            projection=d["projection"],
            knn_indices=d["knn_indices"],
            knn_distances=d["knn_distances"],
        )


def _run_umap(
    hidden_vectors: np.ndarray,
    *,
    umap_args: dict | None = None,
) -> Projection:
    if umap_args is None:
        umap_args = {}

    logger.info("正在为形状为 %s 的输入运行 UMAP...", str(hidden_vectors.shape))  # type: ignore

    import umap
    from umap.umap_ import nearest_neighbors

    metric = umap_args.get("metric", "cosine")
    n_neighbors = umap_args.get("n_neighbors", 15)

    knn = nearest_neighbors(
        hidden_vectors,
        n_neighbors=n_neighbors,
        metric=metric,
        metric_kwds=None,
        angular=False,
        random_state=umap_args.get("random_state"),
    )

    kwargs = {k: v for k, v in umap_args.items() if k != "metric"}
    proj = umap.UMAP(**kwargs, precomputed_knn=knn, metric=metric)
    result: np.ndarray = proj.fit_transform(hidden_vectors)  # type: ignore

    return Projection(projection=result, knn_indices=knn[0], knn_distances=knn[1])


async def _run_embedding(
    fn: Callable,
    data: list,
    *,
    model: str | None,
    embedder_args: dict,
    batch_size: int | None,
    max_concurrency: int | None,
) -> np.ndarray:
    """按 batch 在 *data* 上运行 embedder 函数，并返回拼接后的结果。"""
    batch_size = batch_size or 32
    batches = [data[i : i + batch_size] for i in range(0, len(data), batch_size)]

    logger.info(
        "正在为 %d 个条目运行 embedding，共 %d 个 batch（batch_size=%d）...",
        len(data),
        len(batches),
        batch_size,
    )

    from .async_map import async_map

    results = await async_map(
        batches,
        lambda b: fn(b, model=model, embedder_args=embedder_args),
        concurrency=max_concurrency or 1,
        max_retry=10,
        description="正在 embedding",
    )
    return np.concatenate(results, axis=0)


def _default_embedder(modality: str):
    if modality == "text":
        return "sentence-transformers"
    else:
        return "transformers"


def _caching_embedder_args(embedder_args: dict) -> dict:
    IGNORED_KEYS = ["api_key", "api_base"]
    return {
        key: value for key, value in embedder_args.items() if key not in IGNORED_KEYS
    }
