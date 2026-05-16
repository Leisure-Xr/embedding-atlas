# Copyright (c) 2025 Apple Inc. Licensed under MIT License.

"""用于 notebook 的 Embedding Atlas widget。"""

import pathlib
from typing import Any, Unpack

import duckdb
import narwhals as nw
from narwhals.typing import IntoDataFrame

from .options import EmbeddingAtlasOptions, make_embedding_atlas_props
from .utils import arrow_to_bytes

try:
    import anywidget
    from traitlets import traitlets
except ImportError:
    print(
        "⚠️ 此 widget 依赖 anywidget。请运行 `pip install anywidget` 后重试。"
    )
    raise


class EmbeddingAtlasWidget(anywidget.AnyWidget):
    """用于 notebook 的 Embedding Atlas widget。"""

    _esm = pathlib.Path(__file__).parent / "widget_static" / "anywidget" / "index.js"

    # 传给 embedding atlas 组件的 props，仅内部使用。
    _props = traitlets.Dict({}).tag(sync=True)

    # embedding atlas 组件的状态，仅内部使用。
    _state = traitlets.Any(None).tag(sync=True)
    _predicate = traitlets.Any(None).tag(sync=True)

    def __init__(
        self,
        data_frame: IntoDataFrame,
        *,
        connection: duckdb.DuckDBPyConnection | None = None,
        **options: Unpack[EmbeddingAtlasOptions],
    ):
        """
        创建 Embedding Atlas widget。

        Args:
            data_frame:
                要注册到 DuckDB 的 DataFrame/Arrow 对象。

            row_id:
                行 ID 的列名（未指定时会自动添加一列行 ID）。

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
                指定 ``priority`` 可控制标签优先级。多个标签重叠时，
                优先级更高的标签更容易显示。

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

            connection (DuckDBPyConnection, optional):
                DuckDB 连接。默认使用 duckdb.connect()。
        """

        _ = data_frame  # used by DuckDB

        table_name = "embedding_atlas"
        row_id_column = options.get("row_id", "__row_index__")

        props = make_embedding_atlas_props(
            **(options | {"table": table_name, "row_id": row_id_column}),
        )

        if connection is None:
            connection = duckdb.connect()

        connection.execute(
            f"CREATE TEMPORARY TABLE {table_name} AS SELECT * FROM data_frame"
        )

        if options.get("row_id") is None:
            # 如果 row_id_column 不存在，则创建它。
            connection.execute(
                f"""
                CREATE TEMPORARY SEQUENCE row_id_sequence MINVALUE 0 START 0;
                ALTER TABLE {table_name} ADD COLUMN IF NOT EXISTS {row_id_column} INTEGER DEFAULT nextval('row_id_sequence');
                """
            )

        super().__init__()

        self._props = props

        self._connection: duckdb.DuckDBPyConnection = connection
        self._table_name = table_name
        self._native_namespace = nw.get_native_namespace(data_frame)
        self.on_msg(self._handle_custom_msg)

    def selection(self, format: str = "dataframe") -> Any:
        """
        返回 widget 中的当前选区。

        Args:
            format: 返回选区的格式，可为 'dataframe'、'arrow' 或 'predicate'。
        """
        if self._predicate is not None:
            result = self._connection.sql(
                f"SELECT * FROM {self._table_name} WHERE {self._predicate}"
            )
        else:
            result = self._connection.sql(f"SELECT * FROM {self._table_name}")
        if format == "dataframe":
            reader = result.fetch_arrow_reader()
            return nw.to_native(nw.from_arrow(reader, backend=self._native_namespace))
        elif format == "arrow":
            return result.fetch_arrow_reader()
        else:
            raise ValueError(
                "无效 format，支持的选项为 'dataframe'、'arrow' 和 'predicate'"
            )

    def _handle_custom_msg(self, content: dict, buffers: list):
        uuid = content["uuid"]
        sql = content["sql"]
        command = content["type"]

        try:
            if command == "arrow":
                result = self._connection.sql(sql).fetch_arrow_reader()
                buf = arrow_to_bytes(result)
                self.send({"type": "arrow", "uuid": uuid}, buffers=[buf])
            elif command == "exec":
                self._connection.execute(sql)
                self.send({"type": "exec", "uuid": uuid})
            elif command == "json":
                result = self._connection.sql(sql).to_df()
                json = result.to_dict(orient="records")
                self.send({"type": "json", "uuid": uuid, "result": json})
            else:
                raise ValueError(f"未知 command：{command}")
        except Exception as e:
            self.send({"error": str(e), "uuid": uuid})
