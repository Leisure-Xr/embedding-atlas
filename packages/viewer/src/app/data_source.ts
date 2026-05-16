// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import { type Coordinator } from "@uwdata/mosaic-core";

import type { EmbeddingAtlasProps } from "../api.js";
import type { ExportFormat } from "../utils/mosaic_exporter.js";

/** 键值缓存。 */
export interface Cache {
  /** 使用给定键从缓存获取对象。未找到条目时返回 `null`。 */
  get(key: string): Promise<any | null>;

  /** 使用给定键将对象写入缓存。 */
  set(key: string, value: any): Promise<void>;
}

/** 查看器的数据源。 */
export interface DataSource {
  /** 将数据集加载到协调器数据库中的给定表。 */
  initializeCoordinator(
    coordinator: Coordinator,
    table: string,
    onStatus: (message: string) => void,
  ): Promise<Partial<EmbeddingAtlasProps>>;

  /** 下载包含数据集和查看器静态资源的 zip 归档。 */
  downloadArchive?: () => Promise<void>;

  /** 使用给定谓词下载选区。 */
  downloadSelection?: (predicate: string | null, format: ExportFormat) => Promise<void>;

  /** 适用于此数据源的缓存。 */
  cache?: Cache;
}
