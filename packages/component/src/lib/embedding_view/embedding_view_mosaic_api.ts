// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import type { Coordinator, Selection } from "@uwdata/mosaic-core";
import { createClassComponent } from "svelte/legacy";

import Component from "./EmbeddingViewMosaic.svelte";

import type { Point, Rectangle, ViewportState } from "../utils.js";
import type { EmbeddingViewConfig } from "./embedding_view_config.js";
import type { ThemeConfig } from "./theme.js";
import type { Cache, CustomComponent, DataField, DataPoint, DataPointID, Label, OverlayProxy } from "./types.js";

export interface EmbeddingViewMosaicProps {
  /** Mosaic coordinator。
   *  未指定时，会使用 Mosaic `coordinator()` 方法返回的默认 coordinator。 */
  coordinator?: Coordinator;

  /** 数据表名称。 */
  table: string;

  /** x 列名。 */
  x: string;

  /** y 列名。 */
  y: string;

  /** 类别列名。
   *  类别应表示为从 0 开始的整数。
   *  如果类别以字符串表示，应先将其转换为从 0 开始的整数。 */
  category?: string | null;

  /** 文本列名。
   *  指定后，默认 tooltip 会显示文本内容。
   *  文本内容也会用于自动生成标签。 */
  text?: string | null;

  /** 图像列名。
   *  与 `importance` 一起指定时，聚类标签会显示每个区域中重要性最高的图像。 */
  image?: string | null;

  /** 重要性分数列名（例如 PageRank、中心性）。
   *  与 `image` 一起用于为聚类标签选择代表性图像。 */
  importance?: string | null;

  /** 标识符（即 id）列名。
   *  指定后，`selection` 对象会包含 `identifier` 属性，可用于识别点。 */
  identifier?: string | null;

  /** tooltip 数据元素的附加字段。
   *  每个字段可以指定为列名或 SQL 表达式。 */
  additionalFields?: Record<string, DataField> | null;

  /** 类别颜色。
   *  类别 `i` 会使用该列表中的第 `i` 个颜色。
   *  未指定时使用默认颜色。 */
  categoryColors?: string[] | null;

  /** 用于筛选该视图内容的 Mosaic `Selection` 对象。 */
  filter?: Selection | null;

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
   *  tooltip 是包含以下字段的对象：`x`、`y`、`category`、
   *  `text`, `identifier`.
   *
   *  可以传入数据点标识符（`DataPointID`）、`DataPoint` 对象或 Mosaic `Selection`。
   *  如果指定 id 或 `DataPoint` 对象，需要使用 `onTooltip` 监听 tooltip 变化；
   *  如果使用 Mosaic `Selection`，触发 tooltip 时会更新该 selection。
   */
  tooltip?: Selection | DataPoint | DataPointID | null;

  /** 当前单点或多点选择。
   *
   *  可以传入 `DataPointID` 或 `DataPoint` 对象数组，也可以传入 Mosaic `Selection`。
   *  如果指定 `DataPointID[]` 或 `DataPoint[]`，需要使用 `onSelection` 监听选择变化；
   *  如果使用 Mosaic `Selection`，该 selection 会使用相应谓词更新。 */
  selection?: Selection | DataPoint[] | DataPointID[] | null;

  /** 用于捕获组件范围选择的 Mosaic `Selection` 对象。 */
  rangeSelection?: Selection | null;

  /** 驱动范围选择的矩形或多边形。设置它会改变当前范围选择，
   *  也会影响传入 `rangeSelection` 的 selection。
   *  使用 `onRangeSelection` 监听该矩形的变化。 */
  rangeSelectionValue?: Rectangle | Point[] | null;

  /** `viewportState` 变化时调用的回调。 */
  onViewportState?: ((value: ViewportState) => void) | null;

  /** `tooltip` 变化时调用的回调。 */
  onTooltip?: ((value: DataPoint | null) => void) | null;

  /** `selection` 变化时调用的回调。 */
  onSelection?: ((value: DataPoint[] | null) => void) | null;

  /** `rangeSelection` 变化时调用的回调。 */
  onRangeSelection?: ((value: Rectangle | Point[] | null) => void) | null;

  /** 用于绘制 tooltip 内容的自定义 renderer。 */
  customTooltip?: CustomComponent<HTMLDivElement, { tooltip: DataPoint }> | null;

  /** 用于在嵌入视图上方绘制 overlay 的自定义 renderer。 */
  customOverlay?: CustomComponent<HTMLDivElement, { proxy: OverlayProxy }> | null;

  /** 中间结果缓存。 */
  cache?: Cache | null;
}

export class EmbeddingViewMosaic {
  private component: any;
  private currentProps: EmbeddingViewMosaicProps;

  constructor(target: HTMLElement, props: EmbeddingViewMosaicProps) {
    this.currentProps = { ...props };
    this.component = createClassComponent({ component: Component, target: target, props: props });
  }

  update(props: Partial<EmbeddingViewMosaicProps>) {
    let updates: Partial<EmbeddingViewMosaicProps> = {};
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
