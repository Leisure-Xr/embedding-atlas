// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import type { EmbeddingViewConfig, Point, Rectangle, ViewportState } from "@embedding-atlas/component";

export interface EmbeddingSpec {
  type: "embedding";
  title?: string;

  data: {
    x: string;
    y: string;
    text?: string | null;
    image?: string | null;
    importance?: string | null;
    category?: string | null;
  };

  mode?: "points" | "density";
  minimumDensity?: number;
  pointSize?: number;
  /** 要渲染的最大点数（用于降采样）。默认值：4000000。设为 null 可禁用。 */
  downsampleMaxPoints?: number | null;
  config?: EmbeddingViewConfig;
}

export interface EmbeddingState {
  /** 视口状态。 */
  viewport?: ViewportState;
  /** 图例状态。 */
  legend?: {
    /** 已选类别。 */
    selection?: string[];
  };
  /**
   * 刷选选区状态。可为矩形，或用于套索选择的点列表。
   * 坐标应使用数据单位。
   */
  brush?: Rectangle | Point[];
}
