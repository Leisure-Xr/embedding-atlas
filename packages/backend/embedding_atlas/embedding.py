# Copyright (c) 2025 Apple Inc. Licensed under MIT License.

from collections.abc import Callable
from io import BytesIO
from typing import Any

import numpy as np

from .utils import logger


def create_embedder(
    name: str, *, modality: str, model: str | None, embedder_args: dict
) -> Callable:
    """按名称创建内置 embedder 函数。"""
    factories = {
        "sentence-transformers": _create_sentence_transformers_embedder,
        "transformers": _create_transformers_embedder,
        "litellm": _create_litellm_embedder,
    }
    if name not in factories:
        raise ValueError(
            f"未知 embedder：{name}。必须是以下之一：{list(factories.keys())}。"
            f"（Unknown embedder: {name}）"
        )
    return factories[name](modality=modality, model=model, embedder_args=embedder_args)


def _create_sentence_transformers_embedder(
    *, modality: str, model: str | None, embedder_args: dict
) -> Callable:
    """返回由 SentenceTransformers 支持的 async embedder（仅文本）。"""
    if modality != "text":
        raise NotImplementedError(
            "sentence-transformers embedder 仅支持文本 embedding"
            "（only supports text embedding）"
        )

    from sentence_transformers import SentenceTransformer

    model_name = model or "all-MiniLM-L6-v2"
    default_args = {"trust_remote_code": False}
    merged = {**default_args, **embedder_args}
    logger.info("正在加载模型 %s...", model_name)
    st_model = SentenceTransformer(model_name, **merged)

    async def _embed(
        batch: list[str], *, model: str | None, embedder_args: dict
    ) -> np.ndarray:
        return st_model.encode(batch, show_progress_bar=False, batch_size=len(batch))

    return _embed


def _create_transformers_embedder(
    *, modality: str, model: str | None, embedder_args: dict
) -> Callable:
    """返回由 HuggingFace transformers pipeline 支持的 async embedder。"""
    dispatch = {
        "text": _create_transformers_text_embedder,
        "image": _create_transformers_image_embedder,
        "audio": _create_transformers_audio_embedder,
    }
    if modality not in dispatch:
        raise NotImplementedError(
            f"transformers embedder 不支持 {modality} embeddings"
        )
    return dispatch[modality](model=model, embedder_args=embedder_args)


def _create_transformers_text_embedder(
    *, model: str | None, embedder_args: dict
) -> Callable:
    """返回由 HuggingFace feature-extraction pipeline 支持的 async embedder。"""
    from transformers import pipeline

    model_name = model or "sentence-transformers/all-MiniLM-L6-v2"
    logger.info("正在为模型 %s 加载 transformers pipeline...", model_name)
    pipe = pipeline("feature-extraction", model=model_name, **embedder_args)

    async def _embed(
        batch: list[Any], *, model: str | None, embedder_args: dict
    ) -> np.ndarray:
        outputs = pipe(batch)
        embeddings = []
        for output in outputs:
            arr = np.array(output)
            if arr.ndim > 1:
                arr = arr.mean(axis=tuple(range(arr.ndim - 1)))
            embeddings.append(arr)
        return np.stack(embeddings).astype(np.float32)

    return _embed


def _create_transformers_image_embedder(
    *, model: str | None, embedder_args: dict
) -> Callable:
    """返回由 HuggingFace image-feature-extraction pipeline 支持的 async embedder。"""
    from transformers import pipeline

    model_name = model or "google/vit-base-patch16-224"
    logger.info("正在为模型 %s 加载 transformers pipeline...", model_name)
    pipe = pipeline("image-feature-extraction", model=model_name, **embedder_args)

    async def _embed(
        batch: list[Any], *, model: str | None, embedder_args: dict
    ) -> np.ndarray:
        from PIL import Image

        images = [Image.open(BytesIO(item["bytes"])).convert("RGB") for item in batch]
        outputs = pipe(images)  # type: ignore
        embeddings = []
        for output in outputs:
            arr = np.array(output)
            if arr.ndim > 1:
                arr = arr.mean(axis=tuple(range(arr.ndim - 1)))
            embeddings.append(arr)
        return np.stack(embeddings).astype(np.float32)

    return _embed


def _create_transformers_audio_embedder(
    *, model: str | None, embedder_args: dict
) -> Callable:
    """返回由 CLAP 支持、用于音频数据的 async embedder。"""
    try:
        import soundfile as sf
    except ImportError:
        raise ImportError(
            "音频 embedding 需要安装 `soundfile` 包。"
            "请运行 `pip install soundfile` 后重试。"
        ) from None

    import torch
    from transformers import ClapModel, ClapProcessor

    model_name = model or "laion/clap-htsat-fused"
    logger.info("正在加载 CLAP 模型 %s...", model_name)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    clap_model = ClapModel.from_pretrained(model_name, **embedder_args).to(device)  # type: ignore
    clap_processor = ClapProcessor.from_pretrained(model_name)

    target_sr = clap_processor.feature_extractor.sampling_rate  # type: ignore

    async def _embed(
        batch: list[Any], *, model: str | None, embedder_args: dict
    ) -> np.ndarray:
        from scipy.signal import resample

        waveforms = []
        for item in batch:
            audio_bytes = item["bytes"]
            data, sr = sf.read(BytesIO(audio_bytes))
            # 将立体声转换为单声道。
            if data.ndim > 1:
                data = data.mean(axis=1)
            # 必要时重采样到目标采样率。
            if sr != target_sr:
                num_samples = int(len(data) * target_sr / sr)
                data = resample(data, num_samples)
            waveforms.append(data)

        inputs = clap_processor(
            audio=waveforms,
            sampling_rate=target_sr,  # type: ignore
            return_tensors="pt",  # type: ignore
            padding=True,  # type: ignore
        ).to(device)

        with torch.no_grad():
            audio_embeds = clap_model.get_audio_features(**inputs)

        if hasattr(audio_embeds, "pooler_output"):
            audio_embeds = audio_embeds.pooler_output  # type: ignore
        return audio_embeds.cpu().float().numpy()  # type: ignore

    return _embed


def _create_litellm_embedder(
    *, modality: str, model: str | None, embedder_args: dict
) -> Callable:
    """返回由 LiteLLM 支持的 async embedder。"""

    if model is None:
        raise ValueError("使用 litellm embedder 时必须指定 model")

    async def _embed(
        batch: list[Any], *, model: str | None, embedder_args: dict
    ) -> np.ndarray:
        from litellm import aembedding

        if model is None:
            raise ValueError("使用 litellm embedder 时必须指定 model")

        if modality == "image":
            import base64

            embeddings = []
            for item in batch:
                b64 = base64.b64encode(item["bytes"]).decode("ascii")
                response = await aembedding(
                    input=[f"data:image/png;base64,{b64}"],
                    model=model,
                    **embedder_args,
                )
                embeddings.append(response.data[0]["embedding"])
            return np.array(embeddings)
        else:
            response = await aembedding(
                input=batch,
                model=model,
                **embedder_args,
            )
            return np.array([item["embedding"] for item in response.data])

    return _embed
