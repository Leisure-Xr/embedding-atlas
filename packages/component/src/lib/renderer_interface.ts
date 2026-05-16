// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import type { Point, ViewportState } from "./utils.js";

export type RenderMode = "points" | "density";

export interface EmbeddingRendererProps {
  mode: RenderMode;
  colorScheme: "light" | "dark";

  x: Float32Array<ArrayBuffer>;
  y: Float32Array<ArrayBuffer>;
  category: Uint8Array<ArrayBuffer> | null;

  categoryCount: number;
  categoryColors: string[] | null;

  viewportX: number;
  viewportY: number;
  viewportScale: number;

  pointSize: number;
  pointAlpha: number;
  pointsAlpha: number;

  densityScaler: number;
  densityBandwidth: number;
  densityQuantizationStep: number;
  densityAlpha: number;
  contoursAlpha: number;

  gamma: number;
  width: number;
  height: number;

  /** 近似渲染点数上限。null/Infinity 表示不限制。默认：4,000,000。 */
  downsampleMaxPoints: number | null;
  /** 降采样时的密度权重（0-10）。默认：5。 */
  downsampleDensityWeight: number;
}

export interface DensityMap {
  data: Float32Array;
  width: number;
  height: number;
  coordinateAtPixel: (x: number, y: number) => Point;
}

export interface EmbeddingRenderer {
  readonly props: EmbeddingRendererProps;

  /** 设置 renderer props。需要重新渲染时返回 true。 */
  setProps(newProps: Partial<EmbeddingRendererProps>): boolean;

  /** 渲染。 */
  render(): void;

  /** 销毁 renderer 并释放资源。 */
  destroy(): void;

  /** 生成密度图。 */
  densityMap(width: number, height: number, radius: number, viewportState: ViewportState): Promise<DensityMap>;
}
