# Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import logging
from pathlib import Path
from typing import Any

import inquirer
import narwhals as nw
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from narwhals.typing import IntoDataFrame

logger = logging.getLogger("embedding-atlas")


def load_pandas_data(url: str) -> pd.DataFrame:
    suffix = Path(url).suffix.lower()

    if suffix == ".parquet":
        df = pd.read_parquet(url)
    elif suffix == ".json" or suffix == ".ndjson":
        df = pd.read_json(url)
    elif suffix == ".jsonl":
        df = pd.read_json(url, lines=True)
    else:
        df = pd.read_csv(url)
    return df


def load_huggingface_data(filename: str, splits: list[str] | None) -> pd.DataFrame:
    try:
        from datasets import load_dataset
    except ImportError:
        print(
            "⚠️ 加载 Hugging Face datasets 需要安装 `datasets` 包。请运行 `pip install datasets` 后重试。"
        )
        exit(-1)

    ds: Any = load_dataset(filename)

    if splits is None or len(splits) == 0:
        ds_split_options = []
        for key in ds.keys():
            option = (f"{key} ({ds[key].num_rows} rows)", key)
            ds_split_options.append(option)
        split_question = [
            inquirer.Checkbox(
                "split",
                message=f"请选择要为数据集 [{filename}] 加载哪些 data splits",
                choices=sorted(ds_split_options),
            ),
        ]
        splits = inquirer.prompt(split_question)["split"]  # type: ignore

    if splits is None or len(splits) == 0:
        raise ValueError("必须至少选择一个 split")

    dfs = []
    for split in splits:
        df = ds[split].to_pandas()
        df["split"] = split
        dfs.append(df)
    df = pd.concat(dfs, ignore_index=True)
    return df


def arrow_to_bytes(arrow: pa.RecordBatchReader):
    sink = pa.BufferOutputStream()
    with pa.ipc.new_stream(sink, arrow.schema) as writer:
        for batch in arrow:
            writer.write_batch(batch)
    return sink.getvalue().to_pybytes()


def to_parquet_bytes(df: IntoDataFrame) -> bytes:
    arrow_table = nw.from_native(df, eager_only=True).to_arrow()
    sink = pa.BufferOutputStream()
    pq.write_table(arrow_table, sink)
    return sink.getvalue().to_pybytes()


def apply_logging_config():
    logging.basicConfig(
        level=logging.INFO,
        format="%(levelname)s: (%(name)s) %(message)s",
    )

    logging.getLogger("httpx").setLevel(logging.WARNING)
