// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import type { XYSelectionValue } from "../common/types.js";

/** 标记类型。 */
export type MarkType = "bar" | "rect" | "line" | "area" | "point" | "rule";

/** 数据表中的字段，可以是列名或 SQL 表达式。 */
export type SQLField = string | { sql: string };

/** 表名，或生成表的 SQL 表达式。 */
export type SQLTable = string | { sql: string };

/** 数据值（数据域中的值，可通过比例尺映射到视觉域）。 */
export type DataValue = string | number | [number, number];

/** 编码通道。 */
export type Channel = "x" | "y" | "color" | "size";

/** 标记属性。 */
export type Attribute = "x" | "y" | "x1" | "x2" | "y1" | "y2" | "color" | "size" | "group";

export type AggregateFn =
  | "count"
  | "distinct"
  | "min"
  | "max"
  | "mean"
  | "average"
  | "median"
  | "stdev"
  | "stdevp"
  | "variance"
  | "variancep"
  | "sum"
  | "product"
  | "quantile"
  | "ecdf-value"
  | "ecdf-rank";

/** 线或面积图的插值方法。 */
export type Interpolate =
  | "linear"
  | "cardinal"
  | "catmull-rom"
  | "natural"
  | "monotone"
  | "basis"
  | "step"
  | "step-before"
  | "step-after";

/** 编码。 */
export type Encoding =
  | {
      /** 要编码的数据字段。 */
      field: SQLField;

      bin?: {
        /** 期望的分箱数量。 */
        desiredCount?: number;
      };
    }
  | {
      /** 聚合类型。 */
      aggregate: AggregateFn | { sql: string };

      /** 用于聚合的数据字段。 */
      field?: SQLField;

      /** 用于 "quantile" 聚合的分位数值（0-1）。 */
      quantile?: number;

      /** 按 x 或 y 归一化数值。 */
      normalize?: "x" | "y";
    }
  | {
      /** 要编码的数据值。 */
      value: DataValue;
    };

/** 标记宽度和高度使用的尺寸。 */
export type Dimension = { gap: number; clampToRatio?: number } | { ratio: number } | number;

/** 标记样式。 */
export interface MarkStyle {
  /** 填充颜色。如果为 `null`，则禁用填充。默认值基于标记类型。 */
  fillColor?: string | null;
  /** 填充不透明度。 */
  fillOpacity?: number;

  /** 描边颜色。如果为 `null`，则禁用描边。默认值基于标记类型。 */
  strokeColor?: string | null;
  /** 描边宽度。 */
  strokeWidth?: number;
  /** 描边不透明度。 */
  strokeOpacity?: number;
  /** 描边端点样式。 */
  strokeCap?: "butt" | "round" | "square";
  /** 描边连接样式。 */
  strokeJoin?: "round" | "miter" | "bevel";

  /** 绘制顺序，默认为 `fill stroke`，即先填充后描边。 */
  paintOrder?: "fill stroke" | "stroke fill";

  /** 不透明度。 */
  opacity?: number;
}

export interface Layer {
  /** 数据源，默认使用主数据表。 */
  from?: SQLTable;

  /** 筛选数据。使用 $filter 引用共享筛选器（交叉筛选）。 */
  filter?: "$filter";

  /** 标记类型。 */
  mark: MarkType;

  /** 标记样式。 */
  style?: MarkStyle;

  /**
   * 表示图层顺序的 z-index。默认值为 0。
   * 如果值为负数，标记会绘制在网格线下方。
   */
  zIndex?: number;

  /** 条形标记的方向。 */
  orientation?: "vertical" | "horizontal";

  /** 线和面积标记的插值方法。 */
  interpolate?: Interpolate;

  /** 条形 / 矩形标记的宽度。 */
  width?: Dimension;

  /** 条形 / 矩形标记的高度。 */
  height?: Dimension;

  /** 点标记的大小（面积），默认为 100。 */
  size?: number;

  /** 编码。 */
  encoding?: Partial<Record<Attribute, Encoding>>;
}

/** 比例尺类型。 */
export type ScaleType = "linear" | "log" | "symlog" | "band" | "time";

/** 比例尺。 */
export interface Scale {
  /** 定量比例尺的比例尺类型。 */
  type?: ScaleType;

  /** 比例尺定义域。 */
  domain?: DataValue[];

  /** 特殊值。全部以字符串表示。 */
  specialValues?: string[];

  /** symlog 常量。 */
  constant?: number;

  /**
   * 比例尺值域。目前不适用于 x 和 y 比例尺。
   * 对于大小比例尺，应为 [min, max] 大小。
   * 对于名义颜色比例尺，应为颜色列表。
   * 对于定量颜色比例尺，应为预定义插值方案，或用于插值的颜色列表。
   */
  range?: (string | number)[] | string;

  /**
   * 当 0 表示“无数据”且需要与较小正值在视觉上区分时使用。
   * 为 true 时，0 会与连续比例尺分开渲染，使最小的非零值也清晰可辨。
   * 对于定义域包含 0 的颜色比例尺，默认值为 true。
   */
  discontinuityAtZero?: boolean;
}

export interface Axis {
  /** 坐标轴标题。 */
  title?: string;

  /** 刻度、网格线和标签使用的值。 */
  values?: any[];

  /** 期望的刻度数量。默认为 5。 */
  desiredTickCount?: number;

  /** 将比例尺扩展到刻度范围。默认为 true。 */
  extendScaleToTicks?: boolean;

  /** 标签间距。 */
  labelPadding?: number;

  /** 标签字体族。 */
  labelFontFamily?: string;

  /** 标签字号。 */
  labelFontSize?: number;

  /** 标签最大宽度。 */
  labelMaxWidth?: number;
}

/** 图表选区。 */
export interface Selection {
  encoding: "x" | "y" | "xy";
}

/** 用于编辑图表的控件。 */
export type Widget =
  | {
      type: "scale.type";
      channel: Channel;
    }
  | {
      type: "encoding.normalize";
      layer: number | number[];
      attribute: Attribute;
      options: ("x" | "y")[];
    };

/** 图表 specification。 */
export interface ChartSpec {
  /** 图表标题。 */
  title?: string;

  /** 尺寸配置。 */
  plotSize?: {
    /** 绘图区宽度。 */
    width?: number;

    /** 绘图区高度。 */
    height?: number;

    /** 绘图区宽高比。 */
    aspectRatio?: number;
  };

  /** 图层。 */
  layers?: Layer[];

  /** 比例尺配置。 */
  scale?: Partial<Record<Channel, Scale>>;

  /** 坐标轴配置。 */
  axis?: Partial<Record<"x" | "y", Axis>>;

  /** 选区。 */
  selection?: Record<string, Selection>;

  /** 控件。 */
  widgets?: Widget[];
}

/** 图表状态。将选区键映射到选区状态的字典。 */
export interface ChartState {
  [key: string]: {
    /** 选区的 x 值。 */
    x?: XYSelectionValue;
    /** 选区的 y 值。 */
    y?: XYSelectionValue;
  };
}
