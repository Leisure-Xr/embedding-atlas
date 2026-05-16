# Streamlit 组件

Python 包还提供了一个 Streamlit 组件，可用于在 Streamlit 应用中使用 Embedding Atlas。

## 安装

```bash
pip install embedding-atlas
```

## 示例

```python
from embedding_atlas.streamlit import embedding_atlas
from embedding_atlas.projection import compute_projection

# 计算文本嵌入以及嵌入投影
# 注意：在异步环境中（例如 Jupyter 笔记本），请改用 async_compute_projection。
df = compute_projection(df, inputs="description", modality="text",
    x="projection_x", y="projection_y", neighbors="neighbors"
)

# 为给定数据框创建 Embedding Atlas 组件
value = embedding_atlas(
    df, text="description",
    x="projection_x", y="projection_y", neighbors="neighbors",
    show_table=True
)
```

返回值是一个包含 `predicate` 字符串的 `dict`。
`predicate` 是组件当前选区对应的 SQL 表达式。
你可以使用 DuckDB 通过该谓词查询数据框：

```python
import duckdb

predicate = value.get("predicate")
if predicate is not None:
    # 使用 SQL 谓词查询数据框
    selection = duckdb.query_df(
        df, "dataframe", "SELECT * FROM dataframe WHERE " + predicate
    )
    # 显示选区
    st.dataframe(selection)
```

请注意，也可以在没有投影的情况下使用该组件：

```python
value = embedding_atlas(df)
```

没有 `x` 和 `y` 时，组件会回退到仅包含表格和图表的模式。

## 参考

```python
from embedding_atlas.streamlit import embedding_atlas
```

下面是 `embedding_atlas` 函数的选项和返回值：

<!-- @doc(python-docstring): embedding_atlas.streamlit:embedding_atlas -->
