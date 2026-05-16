// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

export interface EmbeddingViewConfig {
  /** 配色方案。 */
  colorScheme?: "light" | "dark" | null;

  /** 视图模式。 */
  mode?: "points" | "density" | null;

  /** 显示密度等高线所需的最小平均密度。
   * 密度以每平方点（即 CSS 像素单位）中的点数衡量。 */
  minimumDensity?: number | null;

  /** 覆盖自动计算的点大小。
   * 未指定时会基于密度计算点大小。 */
  pointSize?: number | null;

  /** 自动生成标签。
   * 默认情况下，如果未指定 `labels` prop，并且 Mosaic 视图中指定了 `text` 列，
   * 或非 Mosaic 视图中指定了 `queryClusterLabels` 回调，则会自动生成标签。
   * 设置为 `false` 可禁用自动标签。 */
  autoLabelEnabled?: boolean | null;

  /** 生成自动标签前用于筛选聚类的密度阈值。
   * 该值相对于最大密度。 */
  autoLabelDensityThreshold?: number | null;

  /** 自动标签生成使用的停用词。默认使用 NLTK 停用词。 */
  autoLabelStopWords?: string[] | null;

  /** 启用降采样时近似渲染的最大点数。
   * 采样会偏向稀疏区域（密集区域保留的点更少）。
   * 采样概率由以下公式给出：
   * P(i) = (downsampleMaxPoints / numPointsInViewport) * (2 / (1 + density(p_i) / maxDensity * downsampleDensityWeight))
   * 默认值：4,000,000。设置为 null 或 Infinity 可禁用降采样。 */
  downsampleMaxPoints?: number | null;

  /** 降采样的密度权重（0-10）。
   * 值越高，密集区域剔除越激进。
   * 默认值：5。 */
  downsampleDensityWeight?: number | null;
}
