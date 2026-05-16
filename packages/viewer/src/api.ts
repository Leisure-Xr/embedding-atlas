// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

// 嵌入查看器的组件 API。

import type { EmbeddingViewConfig, Label } from "@embedding-atlas/component";
import type { Coordinator } from "@uwdata/mosaic-core";
import { createClassComponent } from "svelte/legacy";

import Component from "./EmbeddingAtlas.svelte";

import type { ModelContextAPI } from "./app/mcp_server.js";
import type { ChartThemeConfig } from "./charts/common/theme.js";
import type { DefaultChartsConfig } from "./charts/default_charts.js";
import type { ColumnStyle } from "./renderers/types.js";

import cssCode from "./app.css?inline";

export interface EmbeddingAtlasProps {
  /** Mosaic 协调器。 */
  coordinator: Coordinator;

  /** 数据源。 */
  data: {
    /** 数据表名称。 */
    table: string;

    /** 唯一行标识符所在的列。 */
    id: string;

    /** 嵌入投影视图使用的 X 和 Y 列。 */
    projection?: { x: string; y: string } | null;

    /** 预计算最近邻所在的列。
     *  列中的每个值都应是如下格式的字典：`{ "ids": [id1, id2, ...], "distances": [distance1, distance2, ...] }`。
     *  `"ids"` 应是邻居行 id（由 `idColumn` 给出）的数组，并按距离排序。
     *  `"distances"` 应包含到每个邻居的对应距离。
     *  注意：如果指定了 `searcher.nearestNeighbors`，UI 会改用 searcher。
     */
    neighbors?: string | null;

    /** 文本所在的列。文本会用作工具提示和搜索功能的内容。 */
    text?: string | null;

    /** 图像数据所在的列。与 `importance` 一起用于为聚类标签选择代表性图像。 */
    image?: string | null;

    /** 重要性分数（例如 PageRank、中心性）所在的列。与 `image` 一起用于为聚类标签选择代表性图像。 */
    importance?: string | null;
  };

  /** 配色方案。 */
  colorScheme?: "light" | "dark" | null;

  /** 查看器初始状态。 */
  initialState?: EmbeddingAtlasState | null;

  /**
   * 配置默认图表。
   * 默认情况下，除了嵌入视图和表格外，还会根据每列的数据类型显示一个分布图。
   * 可通过此选项配置这些图表。
   */
  defaultChartsConfig?: DefaultChartsConfig | null;

  /** 嵌入视图配置。参见 EmbeddingView 文档。 */
  embeddingViewConfig?: EmbeddingViewConfig | null;

  /** 嵌入视图标签。 */
  embeddingViewLabels?: Label[] | null;

  /** 图表主题配置。 */
  chartTheme?: ChartThemeConfig | null;

  /** 应用到组件根节点的自定义 CSS 样式表。 */
  stylesheet?: string | null;

  /** 提供搜索功能的对象，包括全文搜索、向量搜索和最近邻查询。
   *  如果未指定（undefined），将使用文本列提供默认全文搜索。
   *  如果设为 null，则禁用搜索。 */
  searcher?: Searcher | null;

  /** 导出当前选中点的回调。 */
  onExportSelection?:
    | ((predicate: string | null, format: "json" | "jsonl" | "csv" | "parquet") => Promise<void>)
    | null;

  /** 将应用下载为归档文件的回调。 */
  onExportApplication?: (() => Promise<void>) | null;

  /** 查看器状态变化时的回调。可将状态序列化为 JSON 并重新加载。 */
  onStateChange?: ((state: EmbeddingAtlasState) => void) | null;

  /** 模型上下文 API，组件会向其中注册工具。 */
  modelContext?: ModelContextAPI | null;

  /** 用于加速查看器初始化的缓存。 */
  cache?: Cache | null;
}

export interface EmbeddingAtlasState {
  /** 创建此状态的 Embedding Atlas 版本。省略时假定为当前版本。 */
  version?: string;

  /** 创建此状态时的 UNIX 时间戳。 */
  timestamp?: number;

  /** 图表列表。 */
  charts?: Record<string, any>;

  /** 所有图表的状态，以 id 到图表状态的映射保存。 */
  chartStates?: Record<string, any>;

  /** 当前布局。 */
  layout?: string;

  /** 所有布局的状态。 */
  layoutStates?: Record<string, any>;

  /** 列显示与渲染样式。 */
  columnStyles?: Record<string, ColumnStyle>;

  /** 选区谓词（SQL 表达式）。
   *  此属性由图表状态派生，直接修改不会产生效果。 */
  predicate?: string | null;
}

export interface Cache {
  /** 使用给定键从缓存获取对象。未找到条目时返回 `null`。 */
  get(key: string): Promise<any | null>;

  /** 使用给定键将对象写入缓存。 */
  set(key: string, value: any): Promise<void>;
}

export interface Searcher {
  /** 使用给定查询执行全文搜索。 */
  fullTextSearch?(
    query: string,
    options?: { limit?: number; predicate?: string | null; onStatus?: (status: string) => void },
  ): Promise<{ id: any }[]>;

  /** 使用给定查询执行向量搜索。 */
  vectorSearch?(
    query: string,
    options?: { limit?: number; predicate?: string | null; onStatus?: (status: string) => void },
  ): Promise<{ id: any; distance?: number }[]>;

  /** 查找给定 id 所在行的最近邻。 */
  nearestNeighbors?(
    id: any,
    options?: { limit?: number; predicate?: string | null; onStatus?: (status: string) => void },
  ): Promise<{ id: any; distance?: number }[]>;
}

export class EmbeddingAtlas {
  private component: any;
  private container: HTMLDivElement;
  private currentProps: EmbeddingAtlasProps;

  constructor(target: HTMLElement, props: EmbeddingAtlasProps) {
    this.currentProps = { ...props };

    // Container element
    this.container = document.createElement("div");
    this.container.style.display = "flex";
    this.container.style.width = "100%";
    this.container.style.height = "100%";
    target.appendChild(this.container);

    // Shadow root on container
    let shadowRoot = this.container.attachShadow({ mode: "open" });
    let sheet = new CSSStyleSheet();
    sheet.replaceSync(cssCode);
    shadowRoot.adoptedStyleSheets = [sheet];
    if (props.stylesheet != undefined) {
      let customSheet = new CSSStyleSheet();
      customSheet.replaceSync(props.stylesheet);
      shadowRoot.adoptedStyleSheets.push(customSheet);
    }

    // Inner container element
    let innerContainer = document.createElement("div");
    innerContainer.style.display = "flex";
    innerContainer.style.width = "100%";
    innerContainer.style.height = "100%";
    shadowRoot.appendChild(innerContainer);

    // The Svelte component
    this.component = createClassComponent({ component: Component, target: innerContainer, props: props });
  }

  update(props: Partial<EmbeddingAtlasProps>) {
    let updates: Partial<EmbeddingAtlasProps> = {};
    for (let key in props) {
      if ((props as any)[key] !== (this.currentProps as any)[key]) {
        (updates as any)[key] = (props as any)[key];
        (this.currentProps as any)[key] = (props as any)[key];
      }
    }
    this.component.$set(updates);
  }

  destroy() {
    this.component.$destroy();
    this.container.remove();
  }
}
