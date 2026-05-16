// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import type { EmbeddingViewConfig, Label } from "@embedding-atlas/component";
import type { Coordinator, Selection } from "@uwdata/mosaic-core";
import type { Readable, Writable } from "svelte/store";

import type { ColumnDesc } from "../utils/database.js";
import type { ScreenshotOptions } from "../utils/screenshot.js";
import type { ChartThemeConfig } from "./common/theme.js";

export class ChartContextCache {
  private contents: Map<string, any>;

  constructor() {
    this.contents = new Map();
  }

  get(key: string): any | null {
    return this.contents.get(key) ?? null;
  }

  set(key: string, value: any) {
    this.contents.set(key, value);
  }

  value<T>(key: string, valueFunc: () => T): T {
    if (this.contents.has(key)) {
      return this.contents.get(key) as T;
    }
    const value = valueFunc();
    this.contents.set(key, value);
    return value;
  }
}

export type RowID = any;

export interface ChartContext {
  /** Mosaic 协调器。 */
  coordinator: Coordinator;

  /** 数据表。 */
  table: string;

  /** 行 id 列。 */
  id: string;

  /** 表包含的列列表。 */
  columns: ColumnDesc[];

  /** 全局交叉筛选选区。 */
  filter: Selection;

  /** 当前配色方案。 */
  colorScheme: Readable<"light" | "dark">;

  /** 图表主题。 */
  theme: Readable<ChartThemeConfig | undefined>;

  /** 列样式。 */
  columnStyles: Readable<any>;

  /**
   * 用于共享中间结果的缓存。
   * 此缓存中的值会在宿主组件生命周期内保留。
   * 可在此缓存中存储任意值（包括引用 coordinator 或 filter 的值）。
   */
  cache: ChartContextCache;

  /**
   * 用于中间结果的持久缓存。
   * 此缓存中的值由后端保留（如果可用）。
   * 此缓存中的值必须可 JSON 序列化。
   */
  persistentCache: {
    get(key: string): Promise<any | null>;
    set(key: string, value: any): Promise<void>;
  };

  /** 通知父级显示搜索框。 */
  search?: (query: any, mode: string) => void;

  /** 支持的搜索模式列表。 */
  searchModes?: string[];

  /** 当前搜索结果。 */
  searchResult: Readable<{ query: any; mode: string; ids: RowID[] } | null>;

  /**
   * 当前高亮点。此值变化时，支持的视图会高亮给定点。
   * 向此列表添加新点时，视图会通过动画展示该点。
   */
  highlight: Writable<RowID[] | null>;

  /** 嵌入视图配置。参见 EmbeddingView 文档。 */
  embeddingViewConfig?: EmbeddingViewConfig | null;

  /** 嵌入视图标签。 */
  embeddingViewLabels?: Label[] | null;
}

/** 传入图表视图的属性。 */
export interface ChartViewProps<Spec = unknown, State = unknown> {
  /**
   * 图表上下文。上下文在图表视图生命周期内保持不变
   * （即 coordinator 或 table 变化时，会重新创建图表视图）。
   */
  context: ChartContext;

  /**
   * 图表宽度。指定后，图表应适配该宽度。
   * 未指定时，图表可自行决定宽度。
   */
  width?: number;

  /**
   * 图表高度。指定后，图表应适配该高度。
   * 未指定时，图表可自行决定高度。
   */
  height?: number;

  /**
   * 定义图表的一组属性，包括 x 和 y 的数据列、标题、x 和 y 轴标签、颜色比例尺等。
   * 图表可修改自己的 spec，例如通过下拉框切换自己的 X 比例尺类型。
   * spec 必须是可 JSON 序列化的对象。
   */
  spec: Spec;

  /**
   * 当前用户交互状态，包括刷选筛选器的当前值、复选框是否勾选等。
   * 有时 spec 和 state 的边界并不清晰（例如，如果有下拉框可切换 X 比例尺类型，它也可被视为 state）。
   * 功能上的区别是：重置图表或从头加载图表时，state 会被设为 `{}`，而 spec 保持不变。
   */
  state: State;

  /** 图表视图模式。视图可自行决定如何解释该值。 */
  mode: "view" | "edit";

  /**
   * 状态变化时的回调。
   * 默认更新模式为 "merge"，会将新状态递归合并到现有状态。
   * 在 "replace" 模式下，新状态会完全替换现有状态。
   */
  onStateChange: (state: Partial<State>, mode?: "merge" | "replace") => void;

  /**
   * spec 变化时的回调。
   * 默认更新模式为 "merge"，会将新 spec 递归合并到现有 spec。
   * 在 "replace" 模式下，新 spec 会完全替换现有 spec。
   */
  onSpecChange: (spec: Partial<Spec>, mode?: "merge" | "replace") => void;

  /** 注册图表委托。 */
  registerDelegate?: (delegate: ChartDelegate) => () => void;
}

export interface ChartDelegate {
  /** 返回图表截图，结果应为截图的 data URL。 */
  screenshot?: (options?: ScreenshotOptions) => Promise<string>;
}

export type { ChartBuilderDescription } from "./builder/builder_description.js";
