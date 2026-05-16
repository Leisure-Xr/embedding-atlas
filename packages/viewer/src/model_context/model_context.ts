// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import { validate } from "json-schema";
import type { MCPTool, ModelContextAPI, ToolResponse } from "../app/mcp_server.js";
import type { ChartContext, ChartDelegate } from "../charts/chart.js";
import { renderersList } from "../renderers/renderer_types.js";
import type { ColumnStyle } from "../renderers/types.js";
import {
  schemaBuiltinChartSpec,
  schemaBuiltinChartState,
  schemaColumnStyle,
  schemaDashboardLayoutState,
  schemaListLayoutState,
} from "../schemas.js";
import { findUnusedId } from "../utils/identifier.js";
import { screenshot, type ScreenshotOptions } from "../utils/screenshot.js";

export interface ModelContextDelegate {
  context: ChartContext;
  charts: Record<string, any>;
  chartStates: Record<string, any>;
  layout: string;
  layoutStates: Record<string, any>;
  chartDelegates: Map<string, Set<ChartDelegate>>;
  container: HTMLDivElement;
  columnStyles: Record<string, ColumnStyle>;
}

export function provideModelContext(api: ModelContextAPI, delegate: ModelContextDelegate) {
  let screenshotOptions: ScreenshotOptions = { maxWidth: 1568, maxHeight: 1568, pixelRatio: 2 };

  let tools: MCPTool[] = [
    {
      name: "get_data_schema",
      description: "获取表名和列信息",
      inputSchema: { type: "object", additionalProperties: false },
      execute: async () => {
        return jsonResponse({
          table: delegate.context.table,
          columns: delegate.context.columns,
        });
      },
    },
    {
      name: "run_sql_query",
      description: "在 DuckDB 中运行只读 SQL 查询。",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: `要运行的 SQL 查询，必须是只读查询。`,
          },
        },
        additionalProperties: false,
      },
      execute: async (params: { query: string }) => {
        let result = await delegate.context.coordinator.query(params.query);
        return jsonResponse(result.toArray());
      },
    },
    {
      name: "list_renderers",
      description:
        "获取用于在表格、卡片或提示框中显示值的 renderer 列表。可在 ColumnStyle 中设置 renderer。",
      inputSchema: { type: "object", additionalProperties: false },
      execute: async () => {
        return jsonResponse(renderersList);
      },
    },
    {
      name: "get_column_styles",
      description: "获取所有列的样式。",
      inputSchema: { type: "object", additionalProperties: false },
      execute: async () => {
        return jsonResponse(delegate.columnStyles);
      },
    },
    {
      name: "set_column_style",
      description: `设置指定列的样式`,
      inputSchema: {
        type: "object",
        properties: {
          column: { type: "string" },
          style: {
            type: "object",
            description: `列样式。Schema：${JSON.stringify(schemaColumnStyle)}。使用 list_renderers 工具获取 renderer 列表。`,
          },
        },
        additionalProperties: false,
      },
      execute: async (params: { column: string; style: any }) => {
        delegate.columnStyles = {
          ...delegate.columnStyles,
          [params.column]: params.style,
        };
        return textResponse("成功");
      },
    },
    {
      name: "list_charts",
      description: "列出 Embedding Atlas 中的所有图表。",
      inputSchema: { type: "object", additionalProperties: false },
      execute: async () => {
        return jsonResponse(delegate.charts);
      },
    },
    {
      name: "add_chart",
      description: "使用给定 specification 创建新图表，并返回新图表的 id。",
      inputSchema: {
        type: "object",
        properties: {
          spec: {
            type: "object",
            description: `
                图表 specification。Schema：${JSON.stringify(schemaBuiltinChartSpec)}。
                注意：
                - 数据可能非常大（超过 100k 个点）。尽量不要创建没有聚合的图表。
                - 向合适的图层添加 "filter": "$filter"，让图表响应其他图表的筛选。该 filter 是 cross-filter。
                - 创建图表时，请考虑加入交互能力。
                - 默认情况下，绘图尺寸由图表容器决定，尽量不要直接设置。
                - 添加新图表前，请至少使用 list_charts 列出现有图表一次，避免重复。
              `,
          },
        },
        additionalProperties: false,
      },
      execute: async (params: { spec: any }) => {
        // Validate schema.
        let validateResult = validate(params.spec, schemaBuiltinChartSpec);
        if (validateResult.valid) {
          let id = findUnusedId(delegate.charts);
          delegate.charts = { ...delegate.charts, [id]: params.spec };
          return jsonResponse({ id: id });
        } else {
          return jsonResponse({ error: "Spec 无效", details: validateResult.errors });
        }
      },
    },
    {
      name: "get_chart_spec",
      description: "获取图表 specification",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        additionalProperties: false,
      },
      execute: async (params: { id: string; spec: any }) => {
        return jsonResponse(delegate.charts[params.id]);
      },
    },
    {
      name: "set_chart_spec",
      description: "更新图表 specification",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string" },
          spec: { type: "object", description: "新的图表 specification，将替换现有 specification。" },
        },
        additionalProperties: false,
      },
      execute: async (params: { id: string; spec: any }) => {
        let validateResult = validate(params.spec, schemaBuiltinChartSpec);
        if (validateResult.valid) {
          delegate.charts = { ...delegate.charts, [params.id]: params.spec };
          return textResponse("成功");
        } else {
          return jsonResponse({ error: "Spec 无效", details: validateResult.errors });
        }
      },
    },
    {
      name: "get_chart_state",
      description: "获取图表状态",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        additionalProperties: false,
      },
      execute: async (params: { id: string }) => {
        return jsonResponse(delegate.chartStates[params.id] ?? {});
      },
    },
    {
      name: "set_chart_state",
      description: `
          更新图表状态。Schema：${JSON.stringify(schemaBuiltinChartState)}。
        `,
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string" },
          state: { type: "object", description: "新的图表状态，将替换现有状态。" },
        },
        additionalProperties: false,
      },
      execute: async (params: { id: string; state: any }) => {
        delegate.chartStates = { ...delegate.chartStates, [params.id]: params.state };
        return textResponse("成功");
      },
    },
    {
      name: "clear_chart_state",
      description: "清除图表状态",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        additionalProperties: false,
      },
      execute: async (params: { id: string; state: any }) => {
        delegate.chartStates = { ...delegate.chartStates, [params.id]: {} };
        return textResponse("成功");
      },
    },
    {
      name: "delete_chart",
      description: "删除图表",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        additionalProperties: false,
      },
      execute: async (params: { id: string; spec: any }) => {
        delegate.charts = Object.fromEntries(Object.entries(delegate.charts).filter((x) => x[0] != params.id));
        delegate.chartStates = Object.fromEntries(
          Object.entries(delegate.chartStates).filter((x) => x[0] != params.id),
        );
        return textResponse("成功");
      },
    },
    {
      name: "get_chart_screenshot",
      description: "获取图表截图",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        additionalProperties: false,
      },
      execute: async (params: { id: string }) => {
        let items = delegate.chartDelegates.get(params.id);
        if (items != null) {
          for (let chart of items) {
            if (chart.screenshot) {
              let image = await chart.screenshot(screenshotOptions);
              return imageResponse(image);
            }
          }
        }
        return textResponse("该图表不支持截图");
      },
    },
    {
      name: "get_layout_type",
      description: "获取当前布局类型（'list' 或 'dashboard'）",
      inputSchema: {
        type: "object",
        additionalProperties: false,
      },
      execute: async () => {
        return textResponse(delegate.layout);
      },
    },
    {
      name: "set_layout_type",
      description: "设置当前布局类型（'list' 或 'dashboard'）",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string" },
        },
        additionalProperties: false,
      },
      execute: async (params: { type: string }) => {
        delegate.layout = params.type;
        return textResponse("成功");
      },
    },
    {
      name: "get_layout_state",
      description: "获取当前布局状态",
      inputSchema: {
        type: "object",
        additionalProperties: false,
      },
      execute: async () => {
        return jsonResponse(delegate.layoutStates[delegate.layout] ?? {});
      },
    },
    {
      name: "set_layout_state",
      description: "设置当前布局状态",
      inputSchema: {
        type: "object",
        properties: {
          state: {
            type: "object",
            description: `
                新的布局状态，将替换现有状态。
                Schema：
                - dashboard layout state：${JSON.stringify(schemaDashboardLayoutState)}
                - list layout state：${JSON.stringify(schemaListLayoutState)}
              `,
          },
        },
        additionalProperties: false,
      },
      execute: async (params: { state: any }) => {
        delegate.layoutStates = { ...delegate.layoutStates, [delegate.layout]: params.state };
        return textResponse("成功");
      },
    },
    {
      name: "get_full_screenshot",
      description: "获取应用完整截图",
      inputSchema: {
        type: "object",
        additionalProperties: false,
      },
      execute: async () => {
        let image = await screenshot(delegate.container, screenshotOptions);
        return imageResponse(image);
      },
    },
  ];

  api.provideContext({ tools: tools });
}

function textResponse(text: string): ToolResponse {
  return { content: [{ type: "text", text: text.toString() }] };
}

function jsonResponse(content: any): ToolResponse {
  return textResponse(JSON.stringify(content));
}

function imageResponse(dataUrl: string): ToolResponse {
  let parsed = parseImageDataUrl(dataUrl);
  if (parsed) {
    return { content: [{ type: "image", data: parsed.data, mimeType: parsed.mimeType }] };
  }
  return textResponse("截图失败");
}

function parseImageDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  // Check if it's a valid data URL
  if (!dataUrl.startsWith("data:")) {
    return null;
  }

  // Find the comma that separates metadata from content
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) {
    return null;
  }

  // Extract the metadata part (everything before the comma)
  const metadata = dataUrl.substring(5, commaIndex); // Skip "data:"

  // Extract the base64 content (everything after the comma)
  const base64Content = dataUrl.substring(commaIndex + 1);

  // Parse the metadata to extract MIME type
  let mimeType: string;

  if (metadata.includes(";base64")) {
    // Format: "image/png;base64" or "image/jpeg;base64"
    mimeType = metadata.replace(";base64", "");
  } else if (metadata.includes(";")) {
    // Handle other parameters (though base64 is most common)
    mimeType = metadata.split(";")[0];
  } else {
    // Just the MIME type without parameters
    mimeType = metadata;
  }

  // Validate that it's an image MIME type
  if (!mimeType.startsWith("image/")) {
    return null;
  }

  // Specifically check for PNG and JPEG
  if (mimeType !== "image/png" && mimeType !== "image/jpeg") {
    return null;
  }

  return { mimeType, data: base64Content };
}
