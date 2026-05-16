// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import { Liquid } from "liquidjs";
import { marked } from "marked";

const engine = new Liquid();

import { sanitizeHTML } from "./sanitize.js";

/** 将 Markdown 渲染为经过清理的 HTML，可安全用于 innerHTML。 */
export function renderMarkdown(content: string): string {
  let html = marked(content, { async: false, gfm: true });
  return sanitizeHTML(html);
}

/** 将 Liquid 模板编译为接收 value 并返回已清理 HTML 的函数，可安全用于 innerHTML。 */
export function compileLiquidTemplate(template: string): (value: any) => string {
  try {
    let parsed = engine.parse(template);
    return (value) => {
      try {
        return sanitizeHTML(engine.renderSync(parsed, value));
      } catch (_) {
        return "Liquid 模板出错。";
      }
    };
  } catch (_) {
    return () => "Liquid 模板出错。";
  }
}
