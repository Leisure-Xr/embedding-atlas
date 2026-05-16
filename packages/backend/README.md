# Embedding Atlas

一个 Python 包，提供用于可视化带嵌入数据集的命令行工具。它还包含 Python Notebook（例如 Jupyter）小组件和 Streamlit 小组件。

- 文档： https://apple.github.io/embedding-atlas
- GitHub: https://github.com/apple/embedding-atlas

## 安装

```bash
pip install embedding-atlas
```

然后启动命令行工具：

```bash
embedding-atlas [OPTIONS] INPUTS...
```

## 加载数据

你可以通过两种方式加载数据：本地加载或从 Hugging Face 加载。

### 加载本地数据

要开始使用自己的数据，请运行：

```bash
embedding-atlas path_to_dataset.parquet
```

### 加载 Hugging Face 数据

你也可以改为从 Hugging Face 加载数据集：

```bash
embedding-atlas huggingface_org/dataset_name
```

## 可视化嵌入投影

要可视化嵌入投影，请预先计算 X 和 Y 坐标，并使用 `--x` 和 `--y` 指定列名，例如：

```bash
embedding-atlas path_to_dataset.parquet --x projection_x --y projection_y
```

你可以使用 [SentenceTransformers](https://sbert.net/) 库从文本数据计算高维嵌入，然后使用 [UMAP](https://umap-learn.readthedocs.io/en/latest/index.html) 库计算 2D 投影。

### 使用预计算向量

如果你已经有预计算的嵌入向量（但没有 2D 投影），可以使用 `--vector` 指定包含向量的列：

```bash
embedding-atlas path_to_dataset.parquet --vector embedding_vectors
```

这会对已有向量应用 UMAP 降维，而不会重新计算嵌入。向量应在数据集中以列表或 numpy 数组形式存储。

你还可以为预计算的最近邻指定一列：

```bash
embedding-atlas path_to_dataset.parquet --x projection_x --y projection_y --neighbors neighbors
```

`neighbors` 列的值应采用以下格式：`{"ids": [id1, id2, ...], "distances": [d1, d2, ...]}`。
如果指定了此列，你就可以在工具中查看所选点的最近邻。

## 本地开发

使用 `./start.sh` 启动带葡萄酒评论数据集的 Embedding Atlas，使用 `./start_image.sh` 启动 MNIST 数据集。

如果你已经有包含 `projection_x`、`projection_y` 和 `neighbors` 的本地 Parquet 数据，
可以参考 [`examples/local_parquet`](examples/local_parquet/) 中的两个 Hugging Face 示例数据集和启动命令。
