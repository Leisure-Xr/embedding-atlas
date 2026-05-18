/* tslint:disable */
/* eslint-disable */

/**
 * Builder for NNDescent approximate nearest neighbor index.
 *
 * Usage (JS):
 * ```js
 * const index = new NNDescentBuilder(data, 1000, 784, "euclidean", 15)
 *   .randomState(42)
 *   .nTrees(10)
 *   .build();
 * const graph = index.neighborGraph();
 * graph.indices     // Int32Array
 * graph.distances   // Float32Array
 * ```
 */
export class NNDescentBuilder {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Build the NNDescent index.
     */
    build(): Promise<NNDescentIndex>;
    /**
     * Early stopping threshold. Default: 0.001.
     */
    delta(d: number): NNDescentBuilder;
    /**
     * Probability of pruning during diversification. Default: 1.0.
     */
    diversifyProb(p: number): NNDescentBuilder;
    /**
     * Enable GPU acceleration via WebGPU. Default: false.
     * Requires the `gpu` feature.
     */
    gpu(g: boolean): NNDescentBuilder;
    /**
     * Maximum RP tree depth. Default: 200.
     */
    maxRptreeDepth(d: number): NNDescentBuilder;
    /**
     * Number of NN-descent iterations. Default: auto.
     */
    nIters(n: number): NNDescentBuilder;
    /**
     * Number of random projection trees. Default: auto.
     */
    nTrees(n: number): NNDescentBuilder;
    /**
     * Create a new NNDescent builder.
     *
     * @param data - Flat Float32Array, row-major (n_rows * n_cols).
     * @param n_rows - Number of data points.
     * @param n_cols - Number of features per point.
     * @param metric - Distance metric ("euclidean", "cosine", etc.).
     * @param n_neighbors - Number of neighbors to find.
     */
    constructor(data: Float32Array, n_rows: number, n_cols: number, metric: string, n_neighbors: number);
    /**
     * Set a progress callback: `(progress: number, stage: string) => void`.
     * `progress` is in [0, 1], `stage` describes the current processing phase.
     */
    progress(callback: Function): NNDescentBuilder;
    /**
     * Pruning degree multiplier. Default: 1.5.
     */
    pruningDegreeMultiplier(m: number): NNDescentBuilder;
    /**
     * Random seed for reproducibility. Default: None (random).
     */
    randomState(seed: bigint): NNDescentBuilder;
    /**
     * Whether to use RP tree initialization. Default: true.
     */
    treeInit(t: boolean): NNDescentBuilder;
    /**
     * Enable verbose output. Default: false.
     */
    verbose(v: boolean): NNDescentBuilder;
}

/**
 * An NNDescent nearest neighbor index.
 */
export class NNDescentIndex {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Get the neighbor graph (indices + distances).
     */
    neighborGraph(): NeighborResult;
    /**
     * Prepare the search index for querying.
     */
    prepare(): void;
    /**
     * Query the index for k nearest neighbors.
     *
     * @param query_data - Flat Float32Array (n_queries * n_features), row-major.
     * @param n_queries - Number of query points.
     * @param n_features - Number of features (must match training data).
     * @param k - Number of neighbors to return.
     * @param epsilon - Accuracy/speed tradeoff (higher = more accurate).
     */
    query(query_data: Float32Array, n_queries: number, n_features: number, k: number, epsilon: number): NeighborResult;
}

/**
 * Result of a neighbor graph or query operation.
 */
export class NeighborResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Neighbor distances as a flat Float32Array (row-major, n_rows x n_cols).
     */
    readonly distances: Float32Array;
    /**
     * Neighbor indices as a flat Int32Array (row-major, n_rows x n_cols).
     */
    readonly indices: Int32Array;
    /**
     * Number of columns (neighbors per point).
     */
    readonly nCols: number;
    /**
     * Number of rows (points).
     */
    readonly nRows: number;
}

/**
 * Builder for UMAP dimensionality reduction.
 *
 * Usage (JS):
 * ```js
 * const result = new UMAPBuilder(data, 1000, 784, 2)
 *   .metric("cosine")
 *   .minDist(0.1)
 *   .nNeighbors(15)
 *   .randomState(42)
 *   .build();
 * result.embedding   // Float32Array (n_rows * n_components)
 * result.nRows       // number
 * result.nComponents // number
 * ```
 */
export class UMAPBuilder {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Run UMAP and return the embedding result.
     */
    build(): Promise<UMAPResult>;
    /**
     * Enable GPU acceleration via WebGPU. Default: false.
     * Requires the `gpu` feature.
     */
    gpu(g: boolean): UMAPBuilder;
    /**
     * Initialization method: "spectral" or "random". Default: "spectral".
     */
    initMethod(method: string): UMAPBuilder;
    /**
     * Initial learning rate. Default: 1.0.
     */
    learningRate(lr: number): UMAPBuilder;
    /**
     * Local connectivity constraint. Default: 1.0.
     */
    localConnectivity(c: number): UMAPBuilder;
    /**
     * Distance metric ("euclidean", "cosine", etc.). Default: "euclidean".
     */
    metric(metric: string): UMAPBuilder;
    /**
     * Minimum distance between points in embedding. Default: 0.1.
     */
    minDist(d: number): UMAPBuilder;
    /**
     * Interpolation between fuzzy union and intersection. Default: 1.0.
     */
    mixRatio(r: number): UMAPBuilder;
    /**
     * Number of optimization epochs. Default: auto.
     */
    nEpochs(n: number): UMAPBuilder;
    /**
     * Number of neighbors for graph construction. Default: 15.
     */
    nNeighbors(n: number): UMAPBuilder;
    /**
     * Negative samples per positive sample. Default: 5.
     */
    negativeSampleRate(r: number): UMAPBuilder;
    /**
     * Create a new UMAP builder.
     *
     * @param data - Flat Float32Array, row-major (n_rows * n_cols).
     * @param n_rows - Number of data points.
     * @param n_cols - Number of input features.
     * @param n_components - Target embedding dimensions (typically 2).
     */
    constructor(data: Float32Array, n_rows: number, n_cols: number, n_components: number);
    /**
     * Set a progress callback: `(progress: number, stage: string) => void`.
     * `progress` is in [0, 1], `stage` describes the current processing phase.
     */
    progress(callback: Function): UMAPBuilder;
    /**
     * Random seed for reproducibility. Default: None (random).
     */
    randomState(seed: bigint): UMAPBuilder;
    /**
     * Weight of repulsive force. Default: 1.0.
     */
    repulsionStrength(s: number): UMAPBuilder;
    /**
     * Effective scale of embedded points. Default: 1.0.
     */
    spread(s: number): UMAPBuilder;
    /**
     * Enable verbose output. Default: false.
     */
    verbose(v: boolean): UMAPBuilder;
}

/**
 * Result of a UMAP embedding.
 */
export class UMAPResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Embedding coordinates as a flat Float32Array (row-major, n_rows x n_components).
     */
    readonly embedding: Float32Array;
    /**
     * KNN distances as a flat Float32Array (row-major, n_rows x n_neighbors).
     */
    readonly knnDistances: Float32Array;
    /**
     * KNN indices as a flat Int32Array (row-major, n_rows x n_neighbors).
     */
    readonly knnIndices: Int32Array;
    /**
     * Number of embedding dimensions.
     */
    readonly nComponents: number;
    /**
     * Number of neighbors per point.
     */
    readonly nNeighbors: number;
    /**
     * Number of data points.
     */
    readonly nRows: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_neighborresult_free: (a: number, b: number) => void;
    readonly __wbg_nndescentbuilder_free: (a: number, b: number) => void;
    readonly __wbg_nndescentindex_free: (a: number, b: number) => void;
    readonly __wbg_umapbuilder_free: (a: number, b: number) => void;
    readonly __wbg_umapresult_free: (a: number, b: number) => void;
    readonly neighborresult_distances: (a: number) => [number, number];
    readonly neighborresult_indices: (a: number) => [number, number];
    readonly neighborresult_nCols: (a: number) => number;
    readonly neighborresult_nRows: (a: number) => number;
    readonly nndescentbuilder_build: (a: number) => any;
    readonly nndescentbuilder_delta: (a: number, b: number) => number;
    readonly nndescentbuilder_diversifyProb: (a: number, b: number) => number;
    readonly nndescentbuilder_gpu: (a: number, b: number) => number;
    readonly nndescentbuilder_maxRptreeDepth: (a: number, b: number) => number;
    readonly nndescentbuilder_nIters: (a: number, b: number) => number;
    readonly nndescentbuilder_nTrees: (a: number, b: number) => number;
    readonly nndescentbuilder_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
    readonly nndescentbuilder_progress: (a: number, b: any) => number;
    readonly nndescentbuilder_pruningDegreeMultiplier: (a: number, b: number) => number;
    readonly nndescentbuilder_randomState: (a: number, b: bigint) => number;
    readonly nndescentbuilder_treeInit: (a: number, b: number) => number;
    readonly nndescentbuilder_verbose: (a: number, b: number) => number;
    readonly nndescentindex_neighborGraph: (a: number) => [number, number, number];
    readonly nndescentindex_prepare: (a: number) => void;
    readonly nndescentindex_query: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number];
    readonly umapbuilder_build: (a: number) => any;
    readonly umapbuilder_gpu: (a: number, b: number) => number;
    readonly umapbuilder_initMethod: (a: number, b: number, c: number) => number;
    readonly umapbuilder_learningRate: (a: number, b: number) => number;
    readonly umapbuilder_localConnectivity: (a: number, b: number) => number;
    readonly umapbuilder_metric: (a: number, b: number, c: number) => number;
    readonly umapbuilder_minDist: (a: number, b: number) => number;
    readonly umapbuilder_mixRatio: (a: number, b: number) => number;
    readonly umapbuilder_nEpochs: (a: number, b: number) => number;
    readonly umapbuilder_nNeighbors: (a: number, b: number) => number;
    readonly umapbuilder_negativeSampleRate: (a: number, b: number) => number;
    readonly umapbuilder_new: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly umapbuilder_progress: (a: number, b: any) => number;
    readonly umapbuilder_randomState: (a: number, b: bigint) => number;
    readonly umapbuilder_repulsionStrength: (a: number, b: number) => number;
    readonly umapbuilder_spread: (a: number, b: number) => number;
    readonly umapbuilder_verbose: (a: number, b: number) => number;
    readonly umapresult_embedding: (a: number) => [number, number];
    readonly umapresult_knnDistances: (a: number) => [number, number];
    readonly umapresult_knnIndices: (a: number) => [number, number];
    readonly umapresult_nComponents: (a: number) => number;
    readonly umapresult_nNeighbors: (a: number) => number;
    readonly umapresult_nRows: (a: number) => number;
    readonly wasm_bindgen__closure__destroy__haa54f3cb78148739: (a: number, b: number) => void;
    readonly wasm_bindgen__closure__destroy__hdfc360fd1cd8c401: (a: number, b: number) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h5b921cd3a1e32cf4: (a: number, b: number, c: any) => [number, number];
    readonly wasm_bindgen__convert__closures_____invoke__h1c03c2421eb6fc91: (a: number, b: number, c: any, d: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h143de1bb2d9032f7: (a: number, b: number, c: any) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
