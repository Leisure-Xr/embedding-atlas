// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

export interface Placement {
  /** 图表起始 x 位置（网格索引）。 */
  x: number;
  /** 图表起始 y 位置（网格索引）。 */
  y: number;
  /** 图表宽度（网格单元数）。 */
  width: number;
  /** 图表高度（网格单元数）。 */
  height: number;
}

export interface DashboardLayoutState {
  /** 仪表板网格列数，默认为 24。 */
  numColumns?: number;

  /** 仪表板网格行数，默认为 16。 */
  numRows?: number;

  /**
   * 网格，以 `${numColumns}x${numRows}` 为键，例如 "24x16"。
   * 图表可放置在额外行中，但用户需要向下滚动才能查看。
   */
  grids?: Record<
    string,
    {
      /** 图表位置，以图表 id 为键，值为 Placement 结构。 */
      placements?: Record<string, Placement>;
      /** 图表顺序，会影响重叠图表。 */
      order?: string[];
    }
  >;
}
