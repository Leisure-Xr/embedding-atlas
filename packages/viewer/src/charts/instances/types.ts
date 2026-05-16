// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import type { ColumnStyle } from "../../renderers/types.js";

export type SortOrder = { column: string; direction: "ascending" | "descending" }[];

export interface InstancesSpec {
  type: "instances";
  title?: string;

  /**
   * 实例视图中要显示的列。
   * 如果指定，表格和卡片视图会限制为给定列，自定义卡片模板也只会收到给定列作为数据。
   * 如果未指定，则包含数据集中的所有列（或指定 `query` 时的查询结果列）。
   */
  columns?: string[];

  /** 排序顺序。未指定时使用原始数据顺序。 */
  sort?: SortOrder;

  /** 视图模式，默认为 "table"。 */
  viewMode?: "table" | "cards";

  /** 可选的自定义 SQL 查询，用于筛选或转换数据。 */
  query?: string;

  /** 每页项目数，默认为 100。 */
  pageSize?: number;

  /** 默认高度（像素），默认为 500。视图高度可变时使用此值。 */
  defaultHeight?: number;

  /** 此实例视图专用的列样式，会覆盖全局列样式。 */
  columnStyles?: Record<string, ColumnStyle>;

  /**
   * 卡片使用的 Liquid 模板（由 liquidjs 渲染）。
   * 自定义卡片时，可使用 Liquid 模板代替列样式。
   * 未指定时，使用工具提示视图作为卡片。
   */
  cardTemplate?: string;
}

export interface InstancesState {
  offset?: number;
}
