// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

export type CustomComponentClass<N, P> = new (
  node: N,
  props: P,
) => { update?: (props: P) => void; destroy?: () => void };

export interface RendererProps {
  value: any;
  options?: Record<string, any>;
}

export interface RendererOptionsProps {
  options?: Record<string, any>;
  onChange?: (value?: Record<string, any>) => void;
}

/** 自定义值渲染器组件。 */
export type RendererComponent = CustomComponentClass<HTMLElement, RendererProps>;

/** 自定义值渲染器的选项配置面板组件。 */
export type RendererOptionsComponent = CustomComponentClass<HTMLElement, RendererOptionsProps>;

/** 描述列在表格、工具提示和搜索结果中如何显示的类型。 */
export interface ColumnStyle {
  /**
   * 渲染器名称。内置选项：
   * - "markdown"：将值渲染为 Markdown
   * - "liquid-template"：使用 Liquid 模板渲染值（由 liquidjs 渲染）。选项：template（string）：模板，默认为 "{{ value }}"。
   * - "image"：渲染图像。选项：size（number）：图像最大宽度/高度。
   * - "url"：将值渲染为链接
   * - "json"：将值渲染为 JSON 字符串
   * - "messages"：渲染聊天消息（OpenAI 格式）
   */
  renderer?: string;

  /** 作为 props 传给渲染器类的选项。 */
  options?: Record<string, any>;

  /** 在工具提示中的显示样式。 */
  display?: "full" | "badge" | "hidden";
}
