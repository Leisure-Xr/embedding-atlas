// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import type { JSType } from "../../utils/database.js";
import type { ChartSpec } from "../spec/spec.js";

export interface Field {
  name: string;
  type: "continuous" | "discrete" | "discrete[]";
}

export type UIElement =
  | {
      field: {
        key: string;
        required?: boolean;
        types?: JSType[] | null;
      };
      label?: string;
      details?: string;
    }
  | {
      code: {
        key: string;
        language?: string;
        jsonSchema?: any;
      };
      label?: string;
      details?: string;
    }
  | {
      spec: {
        key: string;
      };
      label?: string;
      details?: string;
    };

// 用于从 UI 描述推断值类型的辅助类型。
type UIValue<E> = E extends { field: { key: infer K extends string; required: true } }
  ? { [P in K]: Field }
  : E extends { field: { key: infer K extends string } }
    ? { [P in K]: Field | undefined }
    : E extends { code: { key: infer K extends string } }
      ? { [P in K]: string }
      : E extends { spec: { key: infer K extends string } }
        ? { [P in K]: ChartSpec }
        : never;

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;
type UIValues<A extends readonly UIElement[]> = UnionToIntersection<UIValue<A[number]>>;

export interface ChartBuilderDescription<Spec, UI extends readonly UIElement[]> {
  /** 图表类型的图标。 */
  icon: string;

  /** 图表类型描述。 */
  description: string;

  /** UI 元素。 */
  ui: UI;

  /** 是否显示预览图表（默认为 true）。 */
  preview?: boolean;

  /** 根据给定值创建图表 spec 的函数。 */
  create: (values: UIValues<UI>, context: { table: string; id: string }) => Spec | undefined;
}
