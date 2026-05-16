// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import type { Snippet } from "svelte";

import type { ChartContext } from "../charts/chart.js";

export interface LayoutProps<State = unknown> {
  context: ChartContext;

  /** 要布局的图表字典。键为图表 id，值为图表 spec。 */
  charts: Record<string, any>;

  /** 布局状态。 */
  state: State;

  /**
   * 状态变化时的回调。
   * 默认更新模式为 "merge"，会将新状态递归合并到现有状态。
   * 在 "replace" 模式下，新状态会完全替换现有状态。
   */
  onStateChange: (state: Partial<State>, mode?: "merge" | "replace") => void;

  /**
   * 图表变化时的回调。
   * 默认更新模式为 "merge"，会将新图表递归合并到现有图表。
   * 在 "replace" 模式下，新图表会完全替换现有图表。
   */
  onChartsChange: (charts: Record<string, any>, mode?: "merge" | "replace") => void;

  /** 图表状态变化时的回调。 */
  onChartStatesChange: (states: Record<string, any>, mode?: "merge" | "replace") => void;

  /** 渲染给定图表的 snippet。 */
  chartView: Snippet<
    [{ id: string; width?: number | "container"; height?: number | "container"; mode?: "view" | "edit" }]
  >;
}

export type LayoutOptionsProps<State = unknown> = Omit<LayoutProps<State>, "chartView">;
