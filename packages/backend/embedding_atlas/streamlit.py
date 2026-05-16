# Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import os
from typing import Unpack

import streamlit.components.v1 as components

from .options import EmbeddingAtlasOptions, make_embedding_atlas_props

parent_dir = os.path.dirname(os.path.abspath(__file__))
build_dir = os.path.join(parent_dir, "widget_static/streamlit")
_embedding_atlas = components.declare_component("embedding_atlas", path=build_dir)


def embedding_atlas(
    data_frame,
    *,
    key=None,
    **options: Unpack[EmbeddingAtlasOptions],
) -> dict:
    """
    在 Streamlit 中创建 Embedding Atlas widget。

    Args:
        data_frame:
            要可视化的数据表。

        x:
            嵌入视图中 X 轴坐标的列名。

        y:
            嵌入视图中 Y 轴坐标的列名。

        text:
            文本数据的列名。

        neighbors:
            包含每个点预计算 K 近邻的列名。该列中的每个值都应为以下格式的字典：
            ``{ "ids": [id1, id2, ...], "distances": [distance1, distance2, ...] }``.

            - ``"ids"`` 应为近邻行 ID 数组（如果指定了 ``row_id``，则匹配
              ``row_id`` 中的值；否则使用从 0 开始的行索引），并按距离排序。
            - ``"distances"`` 应包含与每个近邻对应的距离。

        labels:
            嵌入视图的标签。设置为字符串 ``"automatic"`` 可自动生成标签，
            设置为 ``"disabled"`` 可关闭自动标签。自动标签会通过聚类 2D 密度分布，
            并使用 TF-IDF 排名选择代表性关键词来生成。
            也可以传入标签列表。每个标签必须包含 ``x``、``y`` 坐标以及作为标签内容的
            ``text``。还可以指定整数 ``level``，大致控制标签出现的缩放层级；
            指定 ``priority`` 可控制标签优先级。多个标签重叠时，优先级更高的标签更容易显示。

        stop_words:
            自动标签生成时使用的停用词。

        point_size:
            覆盖嵌入视图的默认点大小。

        show_table:
            widget 打开时是否显示数据表。

        show_charts:
            widget 打开时是否显示图表。

        show_embedding:
            widget 打开时是否显示嵌入视图。

        key:
            Streamlit widget 的 key。

    Returns:
        包含以下键的 ``dict``：

        - predicate: widget 当前选区对应的 SQL predicate。
    """

    props = make_embedding_atlas_props(**options)

    return _embedding_atlas(data_frame=data_frame, props=props, key=key, default={})
