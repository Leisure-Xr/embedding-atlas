// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

export type DataPointID = string | number | bigint;

export interface DataPoint {
  x: number;
  y: number;
  category?: number;
  text?: string;
  identifier?: DataPointID;
  fields?: Record<string, any>;
}

export type DataField = string | { sql: string };

export interface Cache {
  get: (key: string) => Promise<any | null>;
  set: (key: string, value: any) => Promise<void>;
}

/** 标签内容：可以是文本字符串，也可以是带显示尺寸（并可选带 x、y 坐标）的图像。 */
export type LabelContent = string | { x?: number; y?: number; image: string; width: number; height: number };

export interface Label {
  /** X 坐标。 */
  x: number;
  /** Y 坐标。 */
  y: number;
  /** 标签内容：文本字符串或图像引用。 */
  content: LabelContent;
  /** 标签层级。标签会在大约 2^level 的缩放倍率附近显示。 */
  level?: number | null;
  /** 放置优先级。 */
  priority?: number | null;
}

export interface OverlayProxy {
  location: (x: number, y: number) => { x: number; y: number };
  width: number;
  height: number;
}

type CustomComponentClass<N, P> = new (node: N, props: P) => { update?: (props: P) => void; destroy?: () => void };

export type CustomComponent<N, P> =
  | {
      class: CustomComponentClass<N, P & any>;
      props?: Record<string, any>;
    }
  | CustomComponentClass<N, P>;
