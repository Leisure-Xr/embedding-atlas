// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import { createClassComponent } from "svelte/legacy";

import Component from "./EmbeddingView.svelte";

import type { Point, Rectangle, ViewportState } from "../utils.js";
import type { EmbeddingViewConfig } from "./embedding_view_config.js";
import type { ThemeConfig } from "./theme.js";
import type { Cache, CustomComponent, DataPoint, Label, LabelContent, OverlayProxy } from "./types.js";

export interface EmbeddingViewProps {
  /** 数据。 */
  data: {
    /** X 坐标数组，必须是 `Float32Array`。 */
    x: Float32Array<ArrayBuffer>;
    /** Y 坐标数组，必须是 `Float32Array`。 */
    y: Float32Array<ArrayBuffer>;
    /** 类别索引数组，必须是 `Uint8Array`。 */
    category?: Uint8Array<ArrayBuffer> | null;
  };

  /** 类别颜色。
   *  类别 `i` 会使用该列表中的第 `i` 个颜色。
   *  未指定时使用默认颜色。 */
  categoryColors?: string[] | null;

  /** 要显示在嵌入视图上的标签。
   *  每个标签必须包含 `x`、`y` 和 `text` 属性，
   *  可选包含 `level` 和 `priority`。 */
  labels?: Label[] | null;

  /** 视图宽度。 */
  width?: number | null;

  /** 视图高度。 */
  height?: number | null;

  /** 视图像素比。 */
  pixelRatio?: number | null;

  /** 配置视图主题。 */
  theme?: ThemeConfig | null;

  /** 配置嵌入视图。 */
  config?: EmbeddingViewConfig | null;

  /** viewport 状态。
   *  可用它在多个视图之间共享 viewport 状态。
   *  如果为 undefined 或 `null`，视图会使用默认 viewport 状态。
   *  使用 `onViewportState` 监听 viewport 状态变化。 */
  viewportState?: ViewportState | null;

  /** 当前 tooltip。
   *  tooltip 是包含以下字段的对象：`x`、`y`、`category`、`text`、`identifier`。
   *  使用 `onTooltip` 监听 tooltip 变化。 */
  tooltip?: DataPoint | null;

  /** 当前单点或多点选择。
   *  点击点会触发选择（shift/cmd+click 会切换点的选中状态）。
   *  selection 是对象数组，每个对象包含以下字段：`x`、`y`、`category`、`text`、`identifier`。
   *  使用 `onSelection` 监听 selection 变化。 */
  selection?: DataPoint[] | null;

  /** 表示范围选择的矩形或多边形（点列表）。
   *  如果值为点列表，则会解释为套索选择，
   *  即以该点列表作为顶点的闭合多边形。 */
  rangeSelection?: Rectangle | null;

  /** `viewportState` 变化时调用的回调。 */
  onViewportState?: ((value: ViewportState) => void) | null;

  /** `tooltip` 变化时调用的回调。 */
  onTooltip?: ((value: DataPoint | null) => void) | null;

  /** `selection` 变化时调用的回调。 */
  onSelection?: ((value: DataPoint[] | null) => void) | null;

  /** `rangeSelection` 变化时调用的回调。 */
  onRangeSelection?: ((value: Rectangle | Point[] | null) => void) | null;

  /** 返回给定 (x, y) 位置附近数据点的 async 函数。
   *  `unitDistance` 参数表示数据域中单个像素对应的距离。
   *  可用它确定选择点时的距离阈值。 */
  querySelection?: ((x: number, y: number, unitDistance: number) => Promise<DataPoint | null>) | null;

  /** 为聚类列表返回标签的 async 函数。
   *  每个聚类由一组近似覆盖该区域的矩形表示。 */
  queryClusterLabels?: ((clusters: Rectangle[][]) => Promise<(LabelContent | null)[]>) | null;

  /** 用于绘制 tooltip 内容的自定义 renderer。 */
  customTooltip?: CustomComponent<HTMLDivElement, { tooltip: DataPoint }> | null;

  /** 用于在嵌入视图上方绘制 overlay 的自定义 renderer。 */
  customOverlay?: CustomComponent<HTMLDivElement, { proxy: OverlayProxy }> | null;

  /** 中间结果缓存。 */
  cache?: Cache | null;
}

export class EmbeddingView {
  private component: any;
  private currentProps: EmbeddingViewProps;

  constructor(target: HTMLElement, props: EmbeddingViewProps) {
    this.currentProps = { ...props };
    this.component = createClassComponent({ component: Component, target: target, props: props });
  }

  update(props: Partial<EmbeddingViewProps>) {
    let updates: Partial<EmbeddingViewProps> = {};
    for (let key in props) {
      if ((props as any)[key] !== (this.currentProps as any)[key]) {
        (updates as any)[key] = (props as any)[key];
        (this.currentProps as any)[key] = (props as any)[key];
      }
    }
    this.component.$set(updates);
  }

  destroy() {
    this.component.$destroy();
  }
}
