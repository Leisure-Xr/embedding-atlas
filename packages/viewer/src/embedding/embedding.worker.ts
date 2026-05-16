// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import { createNNDescent, createUMAP, type NNDescentResult, type UMAPOptions } from "@embedding-atlas/umap-wasm";
import { createWorkerRuntime, imageToDataUrl, transfer } from "@embedding-atlas/utils";
import { load_image, pipeline } from "@huggingface/transformers";

let { handler, registerClass } = createWorkerRuntime();

onmessage = handler;

interface EmbeddingOptions {
  type: "text" | "image";
  model: string;
}

class Embedder {
  private type: "text" | "image";
  private extractor: any;
  private batches: any[] = [];
  private data: { data: Float32Array; count: number; dimension: number } | undefined = undefined;
  private nnIndex: Promise<NNDescentResult> | undefined = undefined;

  private constructor() {
    this.type = "text";
  }

  static async create(options: EmbeddingOptions): Promise<Embedder> {
    let e = new Embedder();
    e.type = options.type;
    let pipelineOptions: any = { device: "webgpu" };
    if (options.type === "text") {
      e.extractor = await pipeline("feature-extraction", options.model, pipelineOptions);
    } else if (options.type === "image") {
      e.extractor = await pipeline("image-feature-extraction", options.model, pipelineOptions);
    } else {
      throw new Error("数据类型无效");
    }
    return e;
  }

  async batch(data: any[]): Promise<void> {
    let inputs: any;
    if (this.type === "text") {
      inputs = data.map((x) => x?.toString() ?? "");
    } else {
      let imgs = data.map((x) => imageToDataUrl(x) ?? "");
      inputs = await Promise.all(imgs.map((x) => load_image(x)));
    }
    let embedding = await this.extractor(inputs, { pooling: "mean", normalize: true });
    if (embedding.dims.length === 3) {
      embedding = embedding.mean(1);
    }
    if (embedding.dims.length !== 2 || embedding.dims[0] !== data.length) {
      throw new Error("输出嵌入维度不匹配");
    }
    this.batches.push(embedding);
  }

  private _getData(): { data: Float32Array; count: number; dimension: number } {
    if (this.data) return this.data;
    const count = this.batches.reduce((a: number, b: any) => a + b.dims[0], 0);
    const dim = this.batches[0].dims[1];
    const vectors = new Float32Array(count * dim);
    let offset = 0;
    for (let b of this.batches) {
      let len = b.dims[0] * dim;
      vectors.set(b.data.subarray(0, len), offset);
      offset += len;
    }
    this.data = { data: vectors, count: count, dimension: dim };
    return this.data;
  }

  private async _getNNIndex(): Promise<NNDescentResult> {
    if (this.nnIndex) return this.nnIndex;
    let { data, count, dimension } = this._getData();
    this.nnIndex = createNNDescent(count, dimension, data, {
      metric: "cosine",
      nNeighbors: 15,
    });
    return this.nnIndex;
  }

  async umap(options: UMAPOptions = {}): Promise<Float32Array> {
    let { data, count, dimension } = this._getData();
    let umap = await createUMAP(count, dimension, 2, data, {
      metric: "cosine",
      ...options,
    });
    await umap.run();
    let result = new Float32Array(umap.embedding);
    umap.destroy();
    return result;
  }

  async neighbors(idx: number, k: number): Promise<{ indices: Int32Array; distances: Float32Array }> {
    let index = await this._getNNIndex();
    return index.queryByIndex(idx, k);
  }

  async queryByVector(vector: Float32Array, k: number): Promise<{ indices: Int32Array; distances: Float32Array }> {
    let index = await this._getNNIndex();
    return index.queryByVector(vector, k);
  }

  /** 一次性查询所有已索引点的邻居，避免逐点往返 worker。 */
  async bulkNeighbors(
    k: number,
  ): Promise<{ allIndices: Int32Array; allDistances: Float32Array; count: number; k: number }> {
    let { count } = this._getData();
    let index = await this._getNNIndex();
    let allIndices = new Int32Array(count * k);
    let allDistances = new Float32Array(count * k);
    // 使用哨兵值填充：索引 -1，距离 Infinity。
    // 这样未填充的位置（queryByIndex 返回少于 k 个结果时）
    // 永远不会被误认为有效邻居。
    allIndices.fill(-1);
    for (let i = 0; i < count * k; i++) allDistances[i] = Infinity;
    for (let i = 0; i < count; i++) {
      let { indices, distances } = index.queryByIndex(i, k);
      let len = Math.min(indices.length, k);
      allIndices.set(indices.subarray(0, len), i * k);
      allDistances.set(distances.subarray(0, len), i * k);
    }
    return transfer({ allIndices, allDistances, count, k }, [allIndices.buffer, allDistances.buffer]);
  }

  /** 计算已索引点对之间的精确余弦距离。 */
  async exactDistances(sourceIndices: number[], targetIndices: number[]): Promise<Float32Array> {
    let { data, dimension } = this._getData();
    // 返回扁平数组：对每个 source，包含它到所有 target 的距离。
    let result = new Float32Array(sourceIndices.length * targetIndices.length);
    for (let si = 0; si < sourceIndices.length; si++) {
      let sOff = sourceIndices[si] * dimension;
      for (let ti = 0; ti < targetIndices.length; ti++) {
        let tOff = targetIndices[ti] * dimension;
        // 余弦距离 = 1 - cosine_similarity。
        // 由于向量已做 L2 归一化，cosine_similarity 等于点积。
        let dot = 0;
        for (let d = 0; d < dimension; d++) {
          dot += data[sOff + d] * data[tOff + d];
        }
        result[si * targetIndices.length + ti] = 1 - dot;
      }
    }
    return transfer(result, [result.buffer]);
  }

  destroy(): void {
    this.batches = [];
    this.data = undefined;
    if (this.nnIndex) {
      this.nnIndex.then((x) => x.destroy());
    }
    this.nnIndex = undefined;
  }
}

export type { Embedder };

registerClass("Embedder", (options: EmbeddingOptions) => Embedder.create(options));
