// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import type { Coordinator } from "@uwdata/mosaic-core";

import { columnDescriptions, distinctCount } from "../utils/database.js";
import type { BuiltinChartSpec } from "./chart_types.js";
import type { EmbeddingSpec } from "./embedding/types.js";
import type { InstancesSpec } from "./instances/types.js";
import type { ChartSpec } from "./spec/spec.js";

export interface DefaultChartsConfig {
  /** 如果指定，则只包含给定列。 */
  include?: string[];

  /** 要排除的列，仅在未指定 `include` 时适用。 */
  exclude?: string[];

  /** 覆盖特定列的图表 spec。如果覆盖值设为 `null`，则跳过该列。 */
  override?: Record<string, BuiltinChartSpec | null>;

  /** 设为 false 可禁用实例表格；也可传入对象来覆盖 spec 属性。 */
  table?: boolean | Partial<InstancesSpec>;

  /** 设为 false 可禁用嵌入视图；也可传入对象来覆盖 spec 属性。 */
  embedding?: boolean | Partial<EmbeddingSpec>;
}

/** 返回给定数据表的默认图表列表。 */
export async function defaultCharts(options: {
  coordinator: Coordinator;
  table: string;
  id: string;
  projection?: { x: string; y: string; text?: string; image?: string; importance?: string };
  config?: DefaultChartsConfig;
}): Promise<BuiltinChartSpec[]> {
  let { coordinator, table, projection } = options;
  let config = options.config ?? {};
  let exclude = config.exclude ?? [];

  let columns = (await columnDescriptions(coordinator, table)).filter((x) => !x.name.startsWith("__"));

  let charts: BuiltinChartSpec[] = [];

  if (projection != null && config.embedding !== false) {
    let spec: EmbeddingSpec = {
      type: "embedding",
      title: "嵌入视图",
      data: {
        x: projection.x,
        y: projection.y,
        text: projection.text,
        image: projection.image,
        importance: projection.importance,
      },
    };
    if (typeof config.embedding == "object") {
      spec = { ...spec, ...config.embedding };
    }
    charts.push(spec);
    exclude.push(projection.x);
    exclude.push(projection.y);
    if (projection.text) {
      exclude.push(projection.text);
    }
  }

  charts.push({ type: "predicates", title: "SQL 谓词" });

  if (config.table !== false) {
    let spec: InstancesSpec = {
      type: "instances",
      title: "数据实例",
    };
    if (typeof config.table == "object") {
      spec = { ...spec, ...config.table };
    }
    charts.push(spec);
  }

  for (let item of columns) {
    if (item.jsType == null) {
      continue;
    }

    // If include is specified, only process columns in the include list.
    if (config.include != undefined && config.include.indexOf(item.name) < 0) {
      continue;
    }
    // If exclude is specified, skip excluded columns.
    if (exclude.indexOf(item.name) >= 0) {
      continue;
    }

    // If we have an override, use the override directly.
    let override = config.override?.[item.name];
    if (override !== undefined) {
      if (override !== null) {
        charts.push(override);
      }
      continue;
    }

    let distinct = await distinctCount(coordinator, table, item.name);
    // Skip the column if there's only a single unique value.
    if (distinct <= 1) {
      continue;
    }

    switch (item.jsType) {
      case "string": {
        if (distinct <= 1000) {
          charts.push({
            type: "count-plot",
            title: item.name,
            data: { field: item.name },
          });
        }
        break;
      }
      case "string[]": {
        charts.push({
          type: "count-plot",
          title: item.name,
          data: { field: item.name, isList: true },
        });
        break;
      }
      case "number":
      case "Date": {
        if (distinct <= 10) {
          charts.push({
            type: "count-plot",
            title: item.name,
            data: { field: item.name },
          });
        } else {
          charts.push(histogramSpec(item.name));
        }
        break;
      }
    }
  }
  return charts;
}

export function histogramSpec(field: string, groupField?: string): ChartSpec {
  return {
    title: field,
    layers: [
      {
        mark: "bar",
        style: { fillColor: "$markColorFade" },
        encoding: {
          x: { field: field },
          y: { aggregate: "count" },
        },
      },
      {
        mark: "bar",
        filter: "$filter",
        encoding: {
          x: { field: field },
          y: { aggregate: "count" },
          ...(groupField ? { color: { field: groupField } } : {}),
        },
      },
    ],
    selection: { brush: { encoding: "x" } },
    widgets: [
      { type: "scale.type", channel: "x" },
      { type: "encoding.normalize", attribute: "y", layer: [0, 1], options: ["x"] },
    ],
  };
}
