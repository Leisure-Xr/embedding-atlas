// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import type { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";

import type { Logger } from "./logging.js";

/** window.EMBEDDING_ATLAS_CONFIG 的类型。可在 index.html 中设置它来配置应用。 */
export interface AppConfig {
  home: "file-viewer" | "backend-viewer";

  /**
   * 从给定 URL 加载数据。返回类型：
   * - { data, filename }：已加载的二进制数据，以及带扩展名的文件名（例如 data.parquet）
   * - { url }：要通过常规 fetch() 加载的新 URL
   * - `undefined`：通过常规 fetch() 加载现有 URL
   * - `true`：数据已导入给定表
   */
  loadDataFromUrl?: (
    url: string,
    context: {
      table: string;
      db: AsyncDuckDB;
      connection: AsyncDuckDBConnection;
      fetch: (url: string) => Promise<Uint8Array<ArrayBuffer>>;
      logger?: Logger;
    },
  ) => Promise<
    { data: Uint8Array<ArrayBuffer>; filename?: string } | { url: string; filename?: string } | undefined | true
  >;
}

export function resolveAppConfig(): AppConfig {
  let config: Partial<AppConfig> = {};
  if (typeof window != undefined && (window as any).EMBEDDING_ATLAS_CONFIG != undefined) {
    config = (window as any).EMBEDDING_ATLAS_CONFIG;
  }
  return {
    home: "backend-viewer",
    ...config,
  };
}
