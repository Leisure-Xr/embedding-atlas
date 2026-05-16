# Python Notebook 小组件

Python 包还提供了一个 Python 笔记本小组件，可用于在笔记本中使用 Embedding Atlas。该小组件使用 [AnyWidget](https://anywidget.dev)，并支持 Jupyter、Marimo、Colab、VSCode 等环境。

## 安装

```bash
pip install embedding-atlas
```

## 示例

```python
from embedding_atlas.widget import EmbeddingAtlasWidget

# 创建不带投影的 Embedding Atlas 小组件
# 该小组件只显示表格和图表，不显示嵌入视图。
EmbeddingAtlasWidget(df)

# 计算文本嵌入以及嵌入投影
from embedding_atlas.projection import compute_projection

df = compute_projection(df, inputs="description", modality="text",
    x="projection_x", y="projection_y", neighbors="neighbors"
)

# 在异步环境中（例如 Jupyter 笔记本），请改用 async_compute_projection：
# from embedding_atlas.projection import async_compute_projection
# df = await async_compute_projection(df, inputs="description", modality="text",
#     x="projection_x", y="projection_y", neighbors="neighbors"
# )

# 使用预计算投影创建 Embedding Atlas 小组件
widget = EmbeddingAtlasWidget(df, text="description",
    x="projection_x", y="projection_y", neighbors="neighbors"
)

# 显示小组件
widget
```

该小组件会将 Embedding Atlas UI 嵌入到你的笔记本中。你可以在小组件中进行选择，然后使用：

```python
df = widget.selection()
```

将选区取回为数据框。

## 参考

```python
from embedding_atlas.widget import EmbeddingAtlasWidget
```

下面是该小组件的构造函数选项：

<!-- @doc(python-docstring): embedding_atlas.widget:EmbeddingAtlasWidget.__init__ -->
