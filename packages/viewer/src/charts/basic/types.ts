// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import type { SQLField } from "../spec/spec.js";

export interface CountPlotSpec {
  type: "count-plot";
  title?: string;

  data: {
    /** 数据字段。 */
    field: SQLField;

    /** 指示字段是否包含 list[str] 数据，默认为 false。 */
    isList?: boolean;
  };

  /** 要显示的最大类别数，默认为 10。 */
  limit?: number;

  /** 标签方式，'%' 表示百分比，'#' 表示计数，'#/#' 表示选中计数/总计数。 */
  labels?: "%" | "#" | "#/#";

  /** 按总计数、选中计数、字母顺序或自定义顺序排列类别，默认为 'total-descending'。 */
  order?:
    | "total-descending"
    | "total-ascending"
    | "selected-descending"
    | "selected-ascending"
    | "alphabetical"
    | string[];

  /** 类别列宽度。 */
  categoryWidth?: number;
}

export interface CountPlotState {
  /** 已选类别列表。 */
  selection?: string[];
}

export interface PredicatesSpec {
  type: "predicates";
  title?: string;
  items?: { name: string; predicate: string }[];
}

export interface PredicatesState {
  /** 已选谓词列表。此列表中的值应为精确的谓词字符串。 */
  selection?: string[];
}

export interface MarkdownSpec {
  type: "markdown";
  title?: string;
  content: string;
}

export interface ContentViewerSpec {
  type: "content-viewer";
  title?: string;
  field: string;
}
