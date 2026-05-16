# Copyright (c) 2025 Apple Inc. Licensed under MIT License.

"""命令行界面。"""

import importlib
import json
import logging
import pathlib
import socket
from pathlib import Path

import click
import inquirer
import numpy as np
import pandas as pd
import uvicorn

from .cache import sha256_hexdigest
from .data_source import DataSource
from .options import make_embedding_atlas_props
from .server import make_server
from .utils import (
    apply_logging_config,
    load_huggingface_data,
    load_pandas_data,
    logger,
)
from .version import __version__


class JSONParamType(click.ParamType):
    """接受 JSON 字符串或 JSON 文件路径。"""

    name = "JSON"

    def convert(self, value, param, ctx):
        if value is None:
            return None
        try:
            if value.strip().startswith("{"):
                return json.loads(value)
            with open(value) as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            self.fail(f"无效的 JSON：{e}", param, ctx)
        except (FileNotFoundError, OSError) as e:
            self.fail(f"无法读取文件：{e}", param, ctx)


def find_column_name(existing_names, candidate):
    if candidate not in existing_names:
        return candidate
    else:
        index = 1
        while True:
            s = f"{candidate}_{index}"
            if s not in existing_names:
                return s
            index += 1


def determine_and_load_data(filename: str, splits: list[str] | None = None):
    suffix = Path(filename).suffix.lower()
    hf_prefix = "hf://datasets/"

    # 如果给出完整 URL，则覆盖 Hugging Face 数据路径前缀。
    if filename.startswith(hf_prefix):
        filename = filename.split(hf_prefix)[-1]

    # Hugging Face 数据。
    if (len(filename.split("/")) <= 2) and (suffix == ""):
        df = load_huggingface_data(filename, splits)
    else:
        df = load_pandas_data(filename)

    return df


def query_dataframe(query: str, data: pd.DataFrame) -> pd.DataFrame:
    import duckdb

    _ = data  # used in query
    return duckdb.sql(query).df()


def load_datasets(
    inputs: list[str],
    splits: list[str] | None = None,
    query: str | None = None,
    sample: int | None = None,
) -> pd.DataFrame:
    existing_column_names = set()
    dataframes = []
    for fn in inputs:
        print("正在从 " + fn + " 加载数据")
        df = determine_and_load_data(fn, splits=splits)
        dataframes.append(df)
        for c in df.columns:
            existing_column_names.add(c)

    file_name_column = find_column_name(existing_column_names, "FILE_NAME")
    for df, fn in zip(dataframes, inputs):
        df[file_name_column] = fn

    df = pd.concat(dataframes)

    if query is not None:
        df = query_dataframe(query, df)

    if sample:
        df = df.sample(n=sample, axis=0, random_state=np.random.RandomState(42))

    return df


def prompt_for_column(df: pd.DataFrame, message: str) -> str | None:
    question = [
        inquirer.List(
            "arg",
            message=message,
            choices=sorted(["(none)"] + [str(c) for c in df.columns]),
        ),
    ]
    r = inquirer.prompt(question)
    if r is None:
        return None
    text = r["arg"]  # type: ignore
    if text == "(none)":
        text = None
    return text


def find_available_port(start_port: int, max_attempts: int = 10, host="localhost"):
    """从 start_port 开始查找下一个可用端口。"""
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex((host, port)) != 0:
                return port
    raise RuntimeError("在给定范围内未找到可用端口")


def import_modules(names: list[str]):
    """导入给定模块列表。"""
    for name in names:
        importlib.import_module(name)


@click.command()
@click.argument("inputs", nargs=-1, required=True)
@click.option("--text", default=None, help="包含文本数据的列。")
@click.option("--image", default=None, help="包含图像数据的列。")
@click.option("--audio", default=None, help="包含音频数据的列。")
@click.option(
    "--vector", default=None, help="包含预先计算好的向量 embeddings 的列。"
)
@click.option(
    "--split",
    default=[],
    multiple=True,
    help="要从 Hugging Face datasets 加载的数据集 split 名称。可多次指定以加载多个 split。",
)
@click.option(
    "--enable-projection/--disable-projection",
    "enable_projection",
    default=True,
    help="从文本/图像/向量数据计算 embedding 投影。若禁用且没有预计算投影，embedding 视图将不可用。",
)
@click.option(
    "--model",
    default=None,
    help="用于生成 embeddings 的模型名称（例如 'all-MiniLM-L6-v2'）。",
)
@click.option(
    "--trust-remote-code",
    is_flag=True,
    default=False,
    help="从 Hugging Face Hub 加载模型时允许执行远程代码。",
)
@click.option(
    "--batch-size",
    type=int,
    default=None,
    help="处理 embeddings 的 batch size（默认：文本 32，图像 16）。值越大占用内存越多，但可能更快。",
)
@click.option(
    "--embedder",
    type=str,
    default=None,
    help="Embedding 后端：'sentence-transformers'（文本默认）、'transformers'（图像/音频默认）或 'litellm'（基于 API）。",
)
@click.option(
    "--api-key",
    type=str,
    default=None,
    help="litellm embedding 提供方的 API key。",
)
@click.option(
    "--api-base",
    type=str,
    default=None,
    help="litellm embedding 提供方的 API endpoint。",
)
@click.option(
    "--dimensions",
    type=int,
    default=None,
    help="输出 embeddings 的维度数（仅 litellm；OpenAI text-embedding-3+ 支持）。",
)
@click.option(
    "--max-concurrency",
    type=int,
    default=None,
    help="并发 embedding batches 的最大数量。对 Ollama 等本地服务器建议设为 1，以避免内存问题。",
)
@click.option(
    "--x",
    "x_column",
    help="包含 embedding 视图预计算 X 坐标的列。",
)
@click.option(
    "--y",
    "y_column",
    help="包含 embedding 视图预计算 Y 坐标的列。",
)
@click.option(
    "--neighbors",
    "neighbors_column",
    help='包含预计算 nearest neighbors 的列，格式为：{"ids": [n1, n2, ...], "distances": [d1, d2, ...]}。IDs 应为从 0 开始的行索引。',
)
@click.option(
    "--pagerank",
    "pagerank_column",
    default=None,
    is_flag=False,
    flag_value="__compute__",
    help="从 neighbor graph 计算 PageRank 分数，或指定包含预计算分数的列。指定 --image 时会自动计算。",
)
@click.option(
    "--query",
    default=None,
    type=str,
    help="使用给定 SQL 查询的结果作为输入数据。在查询中可用 'data' 引用原始数据。",
)
@click.option(
    "--sample",
    default=None,
    type=int,
    help="从数据集中随机抽样的数量。适用于大型数据集。若指定 query，则在 query 之后抽样。",
)
@click.option(
    "--umap-n-neighbors",
    type=int,
    help="UMAP 降维时考虑的 neighbors 数量（默认：15）。",
)
@click.option(
    "--umap-min-dist",
    type=float,
    help="UMAP 的 min_dist 参数。",
)
@click.option(
    "--umap-metric",
    default="cosine",
    help="UMAP 计算使用的距离 metric（默认：'cosine'）。",
)
@click.option(
    "--umap-random-state", type=int, help="用于复现 UMAP 结果的随机种子。"
)
@click.option(
    "--duckdb",
    type=str,
    default="server",
    help="DuckDB 连接模式：'wasm'（在浏览器中运行）、'server'（在此服务器上运行）或 URI（例如 'ws://localhost:3000'）。",
)
@click.option(
    "--host",
    default="localhost",
    help="Web 服务器的 host 地址（默认：localhost）。",
)
@click.option(
    "--port", default=5055, help="Web 服务器的端口号（默认：5055）。"
)
@click.option(
    "--auto-port/--no-auto-port",
    "enable_auto_port",
    default=True,
    help="如果指定端口已被占用，自动查找可用端口。",
)
@click.option(
    "--cors",
    default=None,
    is_flag=False,
    flag_value="",
    help="允许跨源请求。使用 --cors 允许所有来源，或使用 --cors http://example.com 指定域名（也可使用逗号分隔的域名列表）。",
)
@click.option(
    "--static", type=str, help="前端静态文件目录的自定义路径。"
)
@click.option(
    "--export-application",
    type=str,
    help="将可视化导出为独立 Web 应用到指定路径。"
    "使用 .zip 扩展名会导出 ZIP 归档；其他路径会导出为文件夹。",
)
@click.option(
    "--export-metadata",
    type=JSONParamType(),
    default=None,
    help="要合并到导出 metadata.json 中的自定义 metadata。"
    '传入 JSON 字符串（例如 \'{"database": {"datasetUrl": "https://..."}}\'）'
    "或 JSON 文件路径。",
)
@click.option(
    "--with",
    "with_modules",
    default=[],
    multiple=True,
    help="加载数据前导入给定 Python 模块。例如，可用它导入 fsspec filesystems。可多次指定以导入多个模块。",
)
@click.option(
    "--point-size",
    type=float,
    default=None,
    help="embedding 视图中的点大小（默认：根据密度自动计算）。",
)
@click.option(
    "--stop-words",
    type=str,
    default=None,
    help="包含 stop words 的文件路径，用于从文本 embedding 中排除这些词。该文件应为包含 'word' 列的表。",
)
@click.option(
    "--labels",
    type=str,
    default=None,
    help="包含 embedding 视图 labels 的文件路径。该文件应为包含 'x'、'y'、'text' 列的表，并可选包含 'level' 和 'priority'。",
)
@click.option(
    "--mcp/--no-mcp",
    "enable_mcp",
    default=False,
    help="启用 MCP (Model Context Protocol) server endpoints，以便外部工具集成。",
)
@click.version_option(version=__version__, package_name="embedding_atlas")
def main(
    inputs,
    text: str | None,
    image: str | None,
    audio: str | None,
    vector: str | None,
    split: list[str] | None,
    enable_projection: bool,
    model: str | None,
    trust_remote_code: bool,
    batch_size: int | None,
    embedder: str | None,
    api_key: str | None,
    api_base: str | None,
    dimensions: int | None,
    max_concurrency: int | None,
    x_column: str | None,
    y_column: str | None,
    neighbors_column: str | None,
    pagerank_column: str | None,
    query: str | None,
    sample: int | None,
    umap_n_neighbors: int | None,
    umap_min_dist: float | None,
    umap_metric: str | None,
    umap_random_state: int | None,
    static: str | None,
    duckdb: str,
    host: str,
    port: int,
    enable_auto_port: bool,
    cors: str | None,
    export_application: str | None,
    export_metadata: dict | None,
    with_modules: list[str] | None,
    point_size: float | None,
    stop_words: str | None,
    labels: str | None,
    enable_mcp: bool,
):
    apply_logging_config()

    if with_modules is not None:
        import_modules(with_modules)

    df = load_datasets(inputs, splits=split, query=query, sample=sample)

    print(df)

    if enable_projection and (x_column is None or y_column is None):
        # No x, y column selected, first see if text/image/vectors column is specified, if not, ask for it
        if text is None and image is None and audio is None and vector is None:
            selected_column = prompt_for_column(
                df, "请选择要运行 embedding 的列"
            )
        else:
            selected_column = None
        umap_args = {}
        if umap_min_dist is not None:
            umap_args["min_dist"] = umap_min_dist
        if umap_n_neighbors is not None:
            umap_args["n_neighbors"] = umap_n_neighbors
        if umap_random_state is not None:
            umap_args["random_state"] = umap_random_state
        if umap_metric is not None:
            umap_args["metric"] = umap_metric
        # Run embedding and projection
        if (
            text is not None
            or image is not None
            or audio is not None
            or vector is not None
            or selected_column is not None
        ):
            from .projection import compute_projection

            x_column = find_column_name(df.columns, "projection_x")
            y_column = find_column_name(df.columns, "projection_y")
            if neighbors_column is None:
                neighbors_column = find_column_name(df.columns, "__neighbors")
                new_neighbors_column = neighbors_column
            else:
                # If neighbors_column is already specified, don't overwrite it.
                new_neighbors_column = None

            # Determine modality and input column
            if vector is not None:
                modality = "vector"
                input_column = vector
            elif image is not None:
                modality = "image"
                input_column = image
            elif audio is not None:
                modality = "audio"
                input_column = audio
            elif text is not None:
                modality = "text"
                input_column = text
            elif selected_column is not None:
                modality = "auto"
                input_column = selected_column
            else:
                raise RuntimeError("不可达代码")

            # Build embedder_args from CLI options
            embedder_args = {}
            if trust_remote_code:
                embedder_args["trust_remote_code"] = True
            if api_key is not None:
                embedder_args["api_key"] = api_key
            if api_base is not None:
                embedder_args["api_base"] = api_base
            if dimensions is not None:
                embedder_args["dimensions"] = dimensions
            # Pass embedder directly; compute_projection handles defaults and validation
            df = compute_projection(
                df,
                inputs=input_column,
                modality=modality,
                x=x_column,
                y=y_column,
                neighbors=new_neighbors_column,
                embedder=embedder,
                model=model,
                batch_size=batch_size,
                max_concurrency=max_concurrency,
                embedder_args=embedder_args or None,
                umap_args=umap_args or None,
            )

    id_column = find_column_name(df.columns, "__row_index__")
    df[id_column] = range(df.shape[0])

    stop_words_resolved = None
    if stop_words is not None:
        stop_words_df = load_pandas_data(stop_words)
        stop_words_resolved = stop_words_df["word"].to_list()

    labels_resolved = None
    if labels is not None:
        labels_df = load_pandas_data(labels)
        labels_resolved = labels_df.to_dict("records")

    # Compute PageRank from neighbor graph when requested or when --image is specified
    should_compute_pagerank = (pagerank_column == "__compute__") or (
        image is not None and pagerank_column is None
    )
    if (
        should_compute_pagerank
        and neighbors_column is not None
        and neighbors_column in df.columns
    ):
        from embedding_atlas.pagerank import compute_pagerank_column

        logger.info("正在从 neighbor graph 计算 PageRank 分数...")
        pagerank_column = find_column_name(df.columns, "pagerank")
        df[pagerank_column] = compute_pagerank_column(df, neighbors=neighbors_column)
    elif pagerank_column == "__compute__":
        logger.warning("无法计算 PageRank：没有可用的 neighbor 数据。")
        pagerank_column = None

    props = make_embedding_atlas_props(
        row_id=id_column,
        x=x_column,
        y=y_column,
        neighbors=neighbors_column,
        importance=pagerank_column,
        text=text,
        image=image,
        point_size=point_size,
        stop_words=stop_words_resolved,
        labels=labels_resolved,
    )

    metadata = {
        "props": props,
    }

    identifier = sha256_hexdigest([__version__, inputs, metadata], scope="DataSource")
    dataset = DataSource(identifier, df, metadata)

    if static is None:
        static = str((pathlib.Path(__file__).parent / "static").resolve())

    if export_application is not None:
        if export_application.endswith(".zip"):
            with open(export_application, "wb") as f:
                f.write(dataset.make_archive(static, export_metadata))
        else:
            dataset.export_to_folder(static, export_application, export_metadata)
        exit(0)

    # Parse CORS configuration
    cors_config = False
    if cors is not None:
        if cors == "":
            # --cors flag without value means allow all origins
            cors_config = True
        else:
            # --cors=domain1.com,domain2.com means specific domains
            cors_config = [
                domain.strip() for domain in cors.split(",") if domain.strip()
            ]

    app = make_server(
        dataset, static_path=static, duckdb_uri=duckdb, mcp=enable_mcp, cors=cors_config
    )

    if enable_auto_port:
        new_port = find_available_port(port, max_attempts=10, host=host)
        if new_port != port:
            logger.info(f"端口 {port} 不可用，改用 {new_port}")
    else:
        new_port = port

    print()
    print(click.style("-" * 79, dim=True))
    print()
    print(
        f"  {click.style('🚀 Embedding Atlas', fg='green', bold=True)}  {click.style('v' + __version__, fg='green')}"
    )
    print()
    print(f"  ➜ URL: {click.style(f'http://{host}:{new_port}', fg='cyan', bold=True)}")
    print(
        click.style(
            "  ➜ 网络：使用 --host 对外暴露，使用 --cors 启用跨源请求",
            dim=True,
        )
    )
    if enable_mcp:
        print(
            f"  ➜ MCP server：{click.style(f'http://{host}:{new_port}/mcp', fg='blue')}"
        )
    else:
        print(click.style("  ➜ MCP server：使用 --mcp 启用", dim=True))
    print(click.style("  ➜ 按 CTRL+C 退出", dim=True))
    print()
    print(click.style("-" * 79, dim=True))

    uvicorn.run(
        app, port=new_port, host=host, access_log=False, log_level=logging.ERROR
    )


if __name__ == "__main__":
    main()
