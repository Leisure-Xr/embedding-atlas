import duckdb
import pandas as pd
import streamlit as st
from datasets import load_dataset
from embedding_atlas.projection import compute_projection
from embedding_atlas.streamlit import embedding_atlas


@st.cache_data
def load_data():
    ds = load_dataset("james-burton/wine_reviews", split="validation")
    return pd.DataFrame(ds)


def main():
    # Embedding Atlas 在宽屏模式下显示效果更好
    st.set_page_config(layout="wide")

    st.title("Embedding Atlas + Streamlit")

    # 加载示例数据
    st.write("加载示例数据集")
    df = load_data()

    # 计算文本 embedding 及其投影
    df = compute_projection(
        df,
        inputs="description",
        modality="text",
        x="projection_x",
        y="projection_y",
        neighbors="neighbors",
    )

    # 在 Streamlit 中创建 Embedding Atlas widget
    value = embedding_atlas(
        df,
        text="description",
        x="projection_x",
        y="projection_y",
        neighbors="neighbors",
        show_table=True,
    )

    # 在 Streamlit data frame 中显示选中的行
    st.write("选中的行：")
    predicate = value.get("predicate")
    if value is not None and predicate is not None:
        subset = duckdb.query_df(
            df, "dataframe", "SELECT * FROM dataframe WHERE " + predicate
        )
        st.dataframe(subset)
    else:
        st.write("没有选择")


if __name__ == "__main__":
    main()
