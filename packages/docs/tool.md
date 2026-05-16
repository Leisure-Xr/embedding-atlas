# 命令行工具

Python 包包含一个命令行工具，可帮助你快速探索带元数据的大型文本数据集。

<img style="border-radius: 4px" class="light-only" src="/assets/embedding-atlas-light.png">
<img style="border-radius: 4px" class="dark-only" src="/assets/embedding-atlas-dark.png">

## 安装

```bash
pip install embedding-atlas
```

然后启动命令行工具：

```bash
embedding-atlas [OPTIONS] INPUTS...
```

::: tip
为避免包安装问题，建议使用 [uv 包管理器](https://docs.astral.sh/uv/) 安装 Embedding Atlas 及其依赖。uv 允许你用单条命令启动命令行工具：

```bash
uvx embedding-atlas
```

在 Windows 上，可以在 [Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/install) 中安装该包，也可以直接在 Windows 上安装。要使用 NVIDIA GPU，需要安装支持 CUDA 的 PyTorch 版本，更多详情见[这里](https://pytorch.org/get-started/locally/)。
:::

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

## 可视化嵌入

该脚本会为指定列中的文本、图像或音频数据计算嵌入向量。默认情况下，文本使用 [SentenceTransformers](https://sbert.net/)，图像和音频使用 [HuggingFace Transformers](https://huggingface.co/docs/transformers/)。你也可以通过 `--embedder litellm` 使用 [LiteLLM](https://docs.litellm.ai/) 生成基于 API 的嵌入。使用 `--model` 选项可指定嵌入模型；如未指定，将使用默认模型。当前默认值为：文本使用 `all-MiniLM-L6-v2`，图像使用 `google/vit-base-patch16-224`，音频使用 `laion/clap-htsat-fused`，但这些默认值可能在未来版本中变化。

嵌入向量计算完成后，脚本会使用 [UMAP](https://umap-learn.readthedocs.io/en/latest/index.html) 将高维向量投影到 2D。

::: tip
如果你事先知道文本数据所在的列，也可以使用 `--text` 选项指定要使用的列，例如：

```bash
embedding-atlas path_to_dataset.parquet --text text_column
```

类似地，可以为图像数据提供 `--image` 选项，为音频数据提供 `--audio` 选项，或为预计算嵌入向量提供 `--vector` 选项。
:::

如果你已经预计算了嵌入投影（例如运行自己的嵌入模型并用 UMAP 进行投影），可以将其存储为 `projection_x` 和 `projection_y` 这样的两列，并通过 `--x` 和 `--y` 选项传给 `embedding-atlas`：

```bash
embedding-atlas path_to_dataset.parquet --x projection_x --y projection_y
```

你也可以传入 `--neighbors` 选项来指定预计算最近邻的列名。
`neighbors` 列的值应采用以下格式：`{"ids": [id1, id2, ...], "distances": [d1, d2, ...]}`。
ID 应为从零开始的行索引。
如果指定了此列，你就可以在工具中查看所选点的最近邻。

脚本完成后会打印类似 `http://localhost:5055/` 的 URL。在 Web 浏览器中打开该 URL 即可查看嵌入。

## 可复现性

为了获得可复现的嵌入可视化，建议预先计算嵌入向量及其 UMAP 投影，并将它们与数据集一起存储。这可以保证一致性，因为默认嵌入模型可能随时间变化，不同设备上的浮点精度可能不同，而且 UMAP 的默认随机初始化和并行机制都会引入随机性（见[这里](https://umap-learn.readthedocs.io/en/latest/reproducibility.html)）。

`embedding_atlas` 包提供了用于计算嵌入投影的实用函数：

```python
from embedding_atlas.projection import compute_projection

df = compute_projection(df, inputs="text_column", modality="text",
    x="projection_x", y="projection_y", neighbors="neighbors"
)
```

::: tip
`compute_projection` 不能在正在运行的异步事件循环（例如 Jupyter 笔记本）中调用。请改用 `async_compute_projection`：

```python
from embedding_atlas.projection import async_compute_projection

df = await async_compute_projection(df, inputs="text_column", modality="text",
    x="projection_x", y="projection_y", neighbors="neighbors"
)
```

`async_compute_projection` 接受与 `compute_projection` 相同的参数。
:::

## MCP 支持

命令行工具支持 Model Context Protocol (MCP)。可以使用 `--mcp` 选项启用。运行时，它会暴露一个 MCP 服务器，允许 AI 代理查询数据模式、运行 SQL 查询、创建和修改图表、调整布局并截取屏幕截图。

## 用法

```
Usage: embedding-atlas [OPTIONS] INPUTS...
```

### 命令行选项

<!-- @doc(python-cli): embedding_atlas.cli:main -->
