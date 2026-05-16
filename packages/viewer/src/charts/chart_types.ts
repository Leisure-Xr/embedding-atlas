// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import type { Component } from "svelte";

import ContentViewer from "./basic/ContentViewer.svelte";
import CountPlot from "./basic/CountPlot.svelte";
import Markdown from "./basic/Markdown.svelte";
import Placeholder from "./basic/Placeholder.svelte";
import Predicates from "./basic/Predicates.svelte";
import Builder from "./builder/Builder.svelte";
import Embedding from "./embedding/Embedding.svelte";
import Instances from "./instances/Instances.svelte";
import Chart from "./spec/Chart.svelte";

import type {
  ContentViewerSpec,
  CountPlotSpec,
  CountPlotState,
  MarkdownSpec,
  PredicatesSpec,
  PredicatesState,
} from "./basic/types.js";
import type { UIElement } from "./builder/builder_description.js";
import type { ChartBuilderDescription, ChartViewProps } from "./chart.js";
import { histogramSpec } from "./default_charts.js";
import type { EmbeddingSpec, EmbeddingState } from "./embedding/types.js";
import type { InstancesSpec } from "./instances/types.js";
import type { ChartSpec, ChartState } from "./spec/spec.js";

export type ChartComponent = Component<ChartViewProps<any, any>, {}, "">;

interface ChartTypeOptions {
  /**
   * 图表组件支持编辑模式。
   * 如果设为 true，图表组件负责编辑图表。
   * 否则会使用 JSON spec 编辑器。
   */
  supportsEditMode?: boolean;
}

const chartTypes: Record<string, ChartComponent> = {};
const chartTypeOptions: Record<string, ChartTypeOptions> = {};
const chartBuilders: ChartBuilderDescription<any, any>[] = [];

export function registerChartType(type: string, component: ChartComponent, options: ChartTypeOptions = {}) {
  chartTypes[type] = component;
  chartTypeOptions[type] = options;
}

export function registerChartBuilder<Spec, T extends readonly UIElement[]>(builder: ChartBuilderDescription<Spec, T>) {
  chartBuilders.push(builder);
}

export function findChartComponent(spec: any): ChartComponent {
  if (typeof spec != "object") {
    return Placeholder;
  }
  if (typeof spec.type == "string") {
    let r = chartTypes[spec.type];
    if (r == null) {
      return Placeholder;
    }
    return r;
  }
  return Chart;
}

export function findChartTypeOptions(spec: any): ChartTypeOptions {
  if (typeof spec != "object") {
    return {};
  }
  if (typeof spec.type == "string") {
    let r = chartTypeOptions[spec.type];
    if (r == null) {
      return {};
    }
    return r;
  }
  return {};
}

export function chartBuilderDescriptions(): ChartBuilderDescription<any, any>[] {
  return chartBuilders;
}

// 图表构建器是一种特殊图表类型。
registerChartType("builder", Builder);

// 内置图表类型
registerChartType("count-plot", CountPlot);
registerChartType("embedding", Embedding);
registerChartType("instances", Instances);
registerChartType("predicates", Predicates);
registerChartType("markdown", Markdown, { supportsEditMode: true });
registerChartType("content-viewer", ContentViewer);

// 所有内置图表类型的 spec 类型
export type BuiltinChartSpec =
  | ChartSpec
  | ContentViewerSpec
  | CountPlotSpec
  | EmbeddingSpec
  | InstancesSpec
  | MarkdownSpec
  | PredicatesSpec;

// 所有内置图表类型的状态类型
export type BuiltinChartState = ChartState | EmbeddingState | CountPlotState | PredicatesState;

// 图表构建器

registerChartBuilder({
  icon: "chart-h-bar",
  description: "创建字段计数图",
  ui: [
    { label: "字段", field: { key: "x", required: true } }, //
  ] as const,
  create: ({ x }): CountPlotSpec | undefined => {
    if (x.type == "discrete[]") {
      return {
        title: x.name,
        type: "count-plot",
        data: { field: x.name, isList: true },
      };
    } else {
      return {
        title: x.name,
        type: "count-plot",
        data: { field: x.name },
      };
    }
  },
});

registerChartBuilder({
  icon: "chart-stacked",
  description: "创建字段直方图",
  ui: [
    { label: "字段", field: { key: "x", types: ["number", "string", "Date"], required: true } }, //
    { label: "分组字段", field: { key: "color", types: ["number", "string", "Date"] } },
  ] as const,
  create: ({ x, color }): ChartSpec | undefined => histogramSpec(x.name, color?.name),
});

registerChartBuilder({
  icon: "chart-line",
  description: "创建两个字段的折线图",
  ui: [
    { label: "X 字段", field: { key: "x", types: ["number", "string", "Date"], required: true } }, //
    { label: "Y 字段", field: { key: "y", types: ["number"], required: true } }, //
    { label: "分组字段", field: { key: "color", types: ["number", "string", "Date"] } },
  ] as const,
  create: ({ x, y, color }): ChartSpec | undefined => ({
    title: y.name,
    layers: [
      {
        mark: "line",
        filter: "$filter",
        encoding: {
          x: { field: x.name },
          y: { aggregate: "mean", field: y.name },
          ...(color ? { color: { field: color.name } } : {}),
        },
      },
    ],
    selection: { brush: { encoding: "x" } },
    widgets: [
      { type: "scale.type", channel: "x" },
      { type: "encoding.normalize", attribute: "y", layer: 0, options: ["x"] },
    ],
  }),
});

registerChartBuilder({
  icon: "chart-ecdf",
  description: "创建显示字段经验累积分布（eCDF）的图表",
  ui: [
    { label: "字段", field: { key: "x", types: ["number"], required: true } }, //
    { label: "分组字段", field: { key: "color", types: ["number", "string", "Date"] } },
  ] as const,
  create: ({ x, color }): ChartSpec | undefined => ({
    title: x.name,
    layers: [
      {
        mark: "line",
        filter: "$filter",
        encoding: {
          x: { aggregate: "ecdf-value", field: x.name },
          y: { aggregate: "ecdf-rank" },
          ...(color ? { color: { field: color.name } } : {}),
        },
      },
    ],
    selection: { brush: { encoding: "x" } },
    widgets: [{ type: "scale.type", channel: "x" }],
  }),
});

registerChartBuilder({
  icon: "chart-heatmap",
  description: "创建两个字段的二维热力图",
  ui: [
    { label: "X 字段", field: { key: "x", types: ["number", "string", "Date"], required: true } }, //
    { label: "Y 字段", field: { key: "y", types: ["number", "string", "Date"], required: true } }, //
  ] as const,
  create: ({ x, y }): ChartSpec | undefined => ({
    title: `${x.name}, ${y.name}`,
    layers: [
      {
        mark: "rect",
        filter: "$filter",
        zIndex: -1,
        encoding: {
          x: { field: x.name },
          y: { field: y.name },
          color: { aggregate: "count" },
        },
      },
      {
        mark: "rect",
        zIndex: -2,
        encoding: {
          color: {
            value: 0,
          },
        },
      },
    ],
    selection: { brush: { encoding: "xy" } },
    widgets: [
      { type: "scale.type", channel: "x" },
      { type: "scale.type", channel: "y" },
      { type: "encoding.normalize", attribute: "color", layer: 0, options: ["x", "y"] },
    ],
  }),
});

registerChartBuilder({
  icon: "chart-boxplot",
  description: "创建箱线图",
  ui: [
    { label: "X 字段", field: { key: "x", types: ["number", "string", "Date"], required: true } }, //
    { label: "Y 字段", field: { key: "y", types: ["number"], required: true } }, //
  ] as const,
  create: ({ x, y }): ChartSpec | undefined => ({
    title: x.name,
    layers: [
      {
        mark: "rect",
        filter: "$filter",
        width: 1,
        style: { fillColor: "$ruleColor" },
        encoding: {
          x: { field: x.name },
          y1: { aggregate: "min", field: y.name },
          y2: { aggregate: "max", field: y.name },
        },
      },
      {
        mark: "rect",
        filter: "$filter",
        width: { gap: 1, clampToRatio: 0.1 },
        encoding: {
          x: { field: x.name },
          y1: { aggregate: "quantile", quantile: 0.25, field: y.name },
          y2: { aggregate: "quantile", quantile: 0.75, field: y.name },
        },
      },
      {
        mark: "rect",
        filter: "$filter",
        height: 1,
        width: { gap: 1, clampToRatio: 0.1 },
        style: { fillColor: "$ruleColor" },
        encoding: {
          x: { field: x.name },
          y: { aggregate: "median", field: y.name },
        },
      },
    ],
    selection: { brush: { encoding: "x" } },
    axis: {
      y: { title: y.name },
    },
    widgets: [
      { type: "scale.type", channel: "x" },
      { type: "scale.type", channel: "y" },
    ],
  }),
});

registerChartBuilder({
  icon: "chart-bubble",
  description: "创建气泡图",
  ui: [
    { label: "X 字段", field: { key: "x", types: ["number"], required: true } }, //
    { label: "Y 字段", field: { key: "y", types: ["number"], required: true } }, //
    { label: "颜色字段", field: { key: "color", types: ["number", "string", "Date"] } }, //
    { label: "分组字段", field: { key: "group", types: ["number", "string", "Date"] } }, //
  ] as const,
  create: ({ x, y, color, group }): ChartSpec | undefined => ({
    title: x.name,
    layers: [
      {
        mark: "point",
        filter: "$filter",
        style: {
          fillColor: "$encoding",
          fillOpacity: 0.1,
          strokeColor: "$encoding",
        },
        encoding: {
          x: { aggregate: "mean", field: x.name },
          y: { aggregate: "mean", field: y.name },
          size: { aggregate: "count" },
          ...(color ? { color: { field: color?.name } } : {}),
          ...(group ? { group: { field: group.name } } : {}),
        },
      },
    ],
    selection: { brush: { encoding: "xy" } },
    widgets: [
      { type: "scale.type", channel: "x" },
      { type: "scale.type", channel: "y" },
    ],
  }),
});

registerChartBuilder({
  icon: "chart-embedding",
  description: "创建嵌入视图",
  ui: [
    { label: "X 字段", field: { key: "x", types: ["number"], required: true } }, //
    { label: "Y 字段", field: { key: "y", types: ["number"], required: true } }, //
    { label: "文本字段", field: { key: "text", types: ["string"] } }, //
    { label: "类别字段", field: { key: "category", types: ["string", "number", "Date"] } }, //
  ] as const,
  preview: false,
  create: ({ x, y, text, category }, context): EmbeddingSpec | undefined => ({
    type: "embedding",
    title: "嵌入视图",
    data: {
      x: x.name,
      y: y.name,
      text: text?.name,
      category: category?.name,
    },
  }),
});

registerChartBuilder({
  icon: "chart-predicates",
  description: "创建自定义 SQL 谓词筛选器",
  ui: [] as const,
  create: (): PredicatesSpec | undefined => ({
    type: "predicates",
    title: "SQL 谓词",
  }),
});

registerChartBuilder({
  icon: "chart-markdown",
  description: "创建 Markdown 内容视图",
  preview: false,
  ui: [{ code: { key: "content", language: "markdown" } }] as const,
  create: ({ content }): any | undefined => ({
    type: "markdown",
    title: "Markdown",
    content: content,
  }),
});

registerChartBuilder({
  icon: "chart-content-viewer",
  description: "创建显示最后选中点指定字段内容的视图",
  preview: false,
  ui: [{ label: "字段", field: { key: "field", required: true } }] as const,
  create: ({ field }): ContentViewerSpec | undefined => ({
    type: "content-viewer",
    title: field.name,
    field: field.name,
  }),
});

registerChartBuilder({
  icon: "chart-spec",
  description: "使用自定义 spec 创建图表",
  preview: false,
  ui: [{ spec: { key: "spec" } }] as const,
  create: ({ spec }): ChartSpec | undefined => spec,
});

registerChartBuilder({
  icon: "chart-table",
  description: "创建带分页的表格视图",
  preview: false,
  ui: [
    {
      label: "表格的 SQL 查询（可选）",
      details:
        "留空将显示（筛选后的）数据集。可用 $table 和 $filter 分别引用数据表和筛选谓词。",
      code: { key: "query", language: "sql" },
    },
  ] as const,
  create: ({ query }): InstancesSpec | undefined => {
    return {
      type: "instances",
      title: "表格",
      viewMode: "table",
      query: query != null && query.trim() != "" ? query : undefined,
    };
  },
});

registerChartBuilder({
  icon: "chart-cards",
  description: "创建带分页的卡片视图",
  preview: false,
  ui: [
    {
      label: "卡片视图的 SQL 查询（可选）",
      details:
        "留空将显示（筛选后的）数据集。可用 $table 和 $filter 分别引用数据表和筛选谓词。",
      code: { key: "query", language: "sql" },
    },
    {
      label: "卡片 HTML 模板（可选）",
      code: { key: "template", language: "" },
    },
  ] as const,
  create: ({ query, template }): InstancesSpec | undefined => {
    return {
      type: "instances",
      title: "卡片",
      viewMode: "cards",
      query: query != null && query.trim() != "" ? query : undefined,
      cardTemplate: template != null && template.trim() != "" ? template : undefined,
    };
  },
});
