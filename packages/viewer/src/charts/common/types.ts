// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import type { ScaleType } from "../spec/spec.js";

export { type ScaleType };

export interface ScaleConfig {
  /** 比例尺类型。 */
  type: ScaleType;

  /** 数据定义域。 */
  domain: any[];

  /** 特殊值。全部以字符串表示。 */
  specialValues?: string[];

  /** symlog 函数常量。 */
  constant?: number;

  /**
   * 比例尺值域。目前不适用于 x 和 y 比例尺。
   * 对于大小比例尺，应为 [min, max] 大小。
   * 对于名义颜色比例尺，应为颜色列表。
   * 对于定量颜色比例尺，应为预定义插值方案，或用于插值的颜色列表。
   */
  range?: (string | number)[] | string;

  /**
   * 如果为 true，会在 0 处引入不连续性：值 0 映射到色带的自然底部
   * （根据方案接近白色或黑色），而正值会重新映射到稍高的位置，
   * 使最小计数也能与空单元背景清晰区分。用于基于计数的颜色编码。
   */
  discontinuityAtZero?: boolean;
}

export interface AxisConfig {
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

export interface Extents {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface Label {
  text: string;
  fontFamily: string;
  fontSize: number;
  padding: number;
  value: any;
  level: number;
  orientation: "horizontal" | "vertical";
  size: { width: number; height: number };
}

export interface GridLine {
  value: any;
  level: number;
}

export interface Tick {
  value: any;
  level: number;
}

export interface ConcreteScale<Output> {
  type: ScaleType;

  domain: any[];
  specialValues: string[];

  apply(value: any): Output;
}

export type LinearPosition = [number, number];

export interface IntermediatePositionScale {
  labels: Label[];
  gridLines: GridLine[];
  ticks: Tick[];

  base: {
    rangeBands: [LinearPosition, LinearPosition][];
    apply(value: any): LinearPosition;
    applyBand(value: any): [LinearPosition, LinearPosition];
    invert(position: number, range: [number, number], type?: "string" | "number"): any;
  };

  concrete(range: [number, number]): ConcretePositionScale;
}

export interface ConcretePositionScale extends ConcreteScale<number> {
  domain: any[];
  specialValues: string[];

  range: [number, number];
  rangeBands: [number, number][];

  apply(value: any): number;
  applyBand(value: any): [number, number];
  invert(position: number, type?: "string" | "number"): any;
}

export type XYSelectionValue = string | [number, number];

export interface PlotLayout {
  width?: number;
  height?: number;
  plotWidth?: number;
  plotHeight?: number;
  plotAspectRatio?: number;
}

export interface XYFrameProxy {
  plotWidth: number;
  plotHeight: number;
  scale: {
    x?: ConcretePositionScale;
    y?: ConcretePositionScale;
    color?: ConcreteScale<string>;
    size?: ConcreteScale<number>;
  };
}
