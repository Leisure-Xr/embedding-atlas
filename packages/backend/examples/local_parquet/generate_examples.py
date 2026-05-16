# Copyright (c) 2025 Apple Inc. Licensed under MIT License.

"""Generate the local parquet example files.

This script downloads two small Hugging Face samples, computes text embeddings,
projects them to 2D, and writes parquet files with precomputed neighbors.
Run it from the repository root:

    uv run python packages/backend/examples/local_parquet/generate_examples.py
"""

from pathlib import Path

from datasets import load_dataset

from embedding_atlas.projection import compute_projection


OUTPUT_DIR = Path(__file__).parent
SAMPLE_SIZE = 120
SEED = 42


def write_dataset(
    *,
    name: str,
    hf_name: str,
    split: str,
    text_column: str,
    columns: list[str],
) -> None:
    dataset = load_dataset(hf_name, split=split)
    df = dataset.to_pandas()
    df = df[columns].dropna(subset=[text_column]).copy()
    df[text_column] = df[text_column].astype(str)
    df = df[df[text_column].str.len() > 0]
    df = df.sample(n=min(SAMPLE_SIZE, len(df)), random_state=SEED).reset_index(
        drop=True
    )
    df["source_dataset"] = hf_name
    df["source_split"] = split

    df = compute_projection(
        df,
        inputs=text_column,
        modality="text",
        x="projection_x",
        y="projection_y",
        neighbors="neighbors",
        model="all-MiniLM-L6-v2",
        umap_args={"random_state": SEED},
    )

    df.to_parquet(OUTPUT_DIR / f"{name}.parquet", index=False)


def main() -> None:
    write_dataset(
        name="wine_reviews_sample",
        hf_name="james-burton/wine_reviews",
        split="validation",
        text_column="description",
        columns=[
            "country",
            "description",
            "points",
            "price",
            "province",
            "variety",
        ],
    )

    write_dataset(
        name="medmcqa_sample",
        hf_name="openlifescienceai/medmcqa",
        split="validation",
        text_column="question",
        columns=[
            "question",
            "opa",
            "opb",
            "opc",
            "opd",
            "cop",
            "choice_type",
            "subject_name",
            "topic_name",
        ],
    )


if __name__ == "__main__":
    main()
