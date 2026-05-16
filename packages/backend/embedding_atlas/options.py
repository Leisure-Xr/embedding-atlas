# Copyright (c) 2025 Apple Inc. Licensed under MIT License.

from typing import TypedDict, Unpack


class EmbeddingAtlasOptions(TypedDict, total=False):
    """
    row_id:
        行 ID 的列名（未指定时会自动添加一列行 ID）。

    x:
        嵌入视图中 X 轴坐标的列名。

    y:
        嵌入视图中 Y 轴坐标的列名。

    text:
        文本数据的列名。

    image:
        图像数据的列名。

    importance:
        重要性分数（例如 PageRank）的列名。与 ``image`` 一起使用时，
        会用来为聚类标签选择代表性图像。对应前端 API 中的 ``importance``。

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

    initial_state:
        Embedding Atlas 的初始状态。
    """

    table: str | None
    row_id: str | None
    x: str | None
    y: str | None
    text: str | None
    image: str | None
    importance: str | None
    neighbors: str | None

    point_size: float | None

    labels: list[dict] | None
    stop_words: list[str] | None

    show_table: bool | None
    show_charts: bool | None
    show_embedding: bool | None

    initial_state: dict | None


def make_embedding_atlas_props(**options: Unpack[EmbeddingAtlasOptions]) -> dict:
    """
    将输入选项转换为 EmbeddingAtlas 视图的 props。
    """
    # 校验 options 中的键。
    allowed_options = (
        EmbeddingAtlasOptions.__optional_keys__
        | EmbeddingAtlasOptions.__required_keys__
    )
    invalid_options = options.keys() - allowed_options

    if len(invalid_options) > 0:
        raise ValueError(
            f"Embedding Atlas widget 不允许使用以下选项：{','.join(invalid_options)}。允许的选项为：{', '.join(allowed_options)}"
        )

    props: dict = {}

    def set_prop(key: str, value):
        """当 value 不为 None 时设置 key 对应的 prop。key 可以是用于嵌套属性的点分路径。"""
        if value is not None:
            parts = key.split(".")
            d = props
            for part in parts[:-1]:
                if part not in d:
                    d[part] = {}
                d = d[part]
            d[parts[-1]] = value

    # 数据。
    set_prop("data.table", options.get("table"))
    set_prop("data.id", options.get("row_id"))
    if options.get("x") is not None and options.get("y") is not None:
        set_prop("data.projection", {"x": options.get("x"), "y": options.get("y")})
    set_prop("data.text", options.get("text"))
    set_prop("data.image", options.get("image"))
    set_prop("data.importance", options.get("importance"))
    set_prop("data.neighbors", options.get("neighbors"))

    # 嵌入视图。
    set_prop("embeddingViewConfig.pointSize", options.get("point_size"))
    set_prop("embeddingViewLabels", options.get("labels"))
    set_prop("embeddingViewConfig.autoLabelStopWords", options.get("stop_words"))

    # 初始状态。
    set_prop("initialState", options.get("initial_state"))

    # 布局。
    set_prop("initialState.layoutStates.list.showTable", options.get("show_table"))
    set_prop("initialState.layoutStates.list.showCharts", options.get("show_charts"))
    set_prop(
        "initialState.layoutStates.list.showEmbedding", options.get("show_embedding")
    )

    return props
