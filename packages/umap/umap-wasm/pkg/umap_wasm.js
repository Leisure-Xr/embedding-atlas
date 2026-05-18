/* @ts-self-types="./umap_wasm.d.ts" */

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
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(NNDescentBuilder.prototype);
        obj.__wbg_ptr = ptr;
        NNDescentBuilderFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        NNDescentBuilderFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nndescentbuilder_free(ptr, 0);
    }
    /**
     * Build the NNDescent index.
     * @returns {Promise<NNDescentIndex>}
     */
    build() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.nndescentbuilder_build(ptr);
        return ret;
    }
    /**
     * Early stopping threshold. Default: 0.001.
     * @param {number} d
     * @returns {NNDescentBuilder}
     */
    delta(d) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.nndescentbuilder_delta(ptr, d);
        return NNDescentBuilder.__wrap(ret);
    }
    /**
     * Probability of pruning during diversification. Default: 1.0.
     * @param {number} p
     * @returns {NNDescentBuilder}
     */
    diversifyProb(p) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.nndescentbuilder_diversifyProb(ptr, p);
        return NNDescentBuilder.__wrap(ret);
    }
    /**
     * Enable GPU acceleration via WebGPU. Default: false.
     * Requires the `gpu` feature.
     * @param {boolean} g
     * @returns {NNDescentBuilder}
     */
    gpu(g) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.nndescentbuilder_gpu(ptr, g);
        return NNDescentBuilder.__wrap(ret);
    }
    /**
     * Maximum RP tree depth. Default: 200.
     * @param {number} d
     * @returns {NNDescentBuilder}
     */
    maxRptreeDepth(d) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.nndescentbuilder_maxRptreeDepth(ptr, d);
        return NNDescentBuilder.__wrap(ret);
    }
    /**
     * Number of NN-descent iterations. Default: auto.
     * @param {number} n
     * @returns {NNDescentBuilder}
     */
    nIters(n) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.nndescentbuilder_nIters(ptr, n);
        return NNDescentBuilder.__wrap(ret);
    }
    /**
     * Number of random projection trees. Default: auto.
     * @param {number} n
     * @returns {NNDescentBuilder}
     */
    nTrees(n) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.nndescentbuilder_nTrees(ptr, n);
        return NNDescentBuilder.__wrap(ret);
    }
    /**
     * Create a new NNDescent builder.
     *
     * @param data - Flat Float32Array, row-major (n_rows * n_cols).
     * @param n_rows - Number of data points.
     * @param n_cols - Number of features per point.
     * @param metric - Distance metric ("euclidean", "cosine", etc.).
     * @param n_neighbors - Number of neighbors to find.
     * @param {Float32Array} data
     * @param {number} n_rows
     * @param {number} n_cols
     * @param {string} metric
     * @param {number} n_neighbors
     */
    constructor(data, n_rows, n_cols, metric, n_neighbors) {
        const ptr0 = passArrayF32ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(metric, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.nndescentbuilder_new(ptr0, len0, n_rows, n_cols, ptr1, len1, n_neighbors);
        this.__wbg_ptr = ret >>> 0;
        NNDescentBuilderFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Set a progress callback: `(progress: number, stage: string) => void`.
     * `progress` is in [0, 1], `stage` describes the current processing phase.
     * @param {Function} callback
     * @returns {NNDescentBuilder}
     */
    progress(callback) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.nndescentbuilder_progress(ptr, callback);
        return NNDescentBuilder.__wrap(ret);
    }
    /**
     * Pruning degree multiplier. Default: 1.5.
     * @param {number} m
     * @returns {NNDescentBuilder}
     */
    pruningDegreeMultiplier(m) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.nndescentbuilder_pruningDegreeMultiplier(ptr, m);
        return NNDescentBuilder.__wrap(ret);
    }
    /**
     * Random seed for reproducibility. Default: None (random).
     * @param {bigint} seed
     * @returns {NNDescentBuilder}
     */
    randomState(seed) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.nndescentbuilder_randomState(ptr, seed);
        return NNDescentBuilder.__wrap(ret);
    }
    /**
     * Whether to use RP tree initialization. Default: true.
     * @param {boolean} t
     * @returns {NNDescentBuilder}
     */
    treeInit(t) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.nndescentbuilder_treeInit(ptr, t);
        return NNDescentBuilder.__wrap(ret);
    }
    /**
     * Enable verbose output. Default: false.
     * @param {boolean} v
     * @returns {NNDescentBuilder}
     */
    verbose(v) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.nndescentbuilder_verbose(ptr, v);
        return NNDescentBuilder.__wrap(ret);
    }
}
if (Symbol.dispose) NNDescentBuilder.prototype[Symbol.dispose] = NNDescentBuilder.prototype.free;

/**
 * An NNDescent nearest neighbor index.
 */
export class NNDescentIndex {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(NNDescentIndex.prototype);
        obj.__wbg_ptr = ptr;
        NNDescentIndexFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        NNDescentIndexFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nndescentindex_free(ptr, 0);
    }
    /**
     * Get the neighbor graph (indices + distances).
     * @returns {NeighborResult}
     */
    neighborGraph() {
        const ret = wasm.nndescentindex_neighborGraph(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return NeighborResult.__wrap(ret[0]);
    }
    /**
     * Prepare the search index for querying.
     */
    prepare() {
        wasm.nndescentindex_prepare(this.__wbg_ptr);
    }
    /**
     * Query the index for k nearest neighbors.
     *
     * @param query_data - Flat Float32Array (n_queries * n_features), row-major.
     * @param n_queries - Number of query points.
     * @param n_features - Number of features (must match training data).
     * @param k - Number of neighbors to return.
     * @param epsilon - Accuracy/speed tradeoff (higher = more accurate).
     * @param {Float32Array} query_data
     * @param {number} n_queries
     * @param {number} n_features
     * @param {number} k
     * @param {number} epsilon
     * @returns {NeighborResult}
     */
    query(query_data, n_queries, n_features, k, epsilon) {
        const ptr0 = passArrayF32ToWasm0(query_data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.nndescentindex_query(this.__wbg_ptr, ptr0, len0, n_queries, n_features, k, epsilon);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return NeighborResult.__wrap(ret[0]);
    }
}
if (Symbol.dispose) NNDescentIndex.prototype[Symbol.dispose] = NNDescentIndex.prototype.free;

/**
 * Result of a neighbor graph or query operation.
 */
export class NeighborResult {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(NeighborResult.prototype);
        obj.__wbg_ptr = ptr;
        NeighborResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        NeighborResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_neighborresult_free(ptr, 0);
    }
    /**
     * Neighbor distances as a flat Float32Array (row-major, n_rows x n_cols).
     * @returns {Float32Array}
     */
    get distances() {
        const ret = wasm.neighborresult_distances(this.__wbg_ptr);
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Neighbor indices as a flat Int32Array (row-major, n_rows x n_cols).
     * @returns {Int32Array}
     */
    get indices() {
        const ret = wasm.neighborresult_indices(this.__wbg_ptr);
        var v1 = getArrayI32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Number of columns (neighbors per point).
     * @returns {number}
     */
    get nCols() {
        const ret = wasm.neighborresult_nCols(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Number of rows (points).
     * @returns {number}
     */
    get nRows() {
        const ret = wasm.neighborresult_nRows(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) NeighborResult.prototype[Symbol.dispose] = NeighborResult.prototype.free;

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
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(UMAPBuilder.prototype);
        obj.__wbg_ptr = ptr;
        UMAPBuilderFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        UMAPBuilderFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_umapbuilder_free(ptr, 0);
    }
    /**
     * Run UMAP and return the embedding result.
     * @returns {Promise<UMAPResult>}
     */
    build() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.umapbuilder_build(ptr);
        return ret;
    }
    /**
     * Enable GPU acceleration via WebGPU. Default: false.
     * Requires the `gpu` feature.
     * @param {boolean} g
     * @returns {UMAPBuilder}
     */
    gpu(g) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.umapbuilder_gpu(ptr, g);
        return UMAPBuilder.__wrap(ret);
    }
    /**
     * Initialization method: "spectral" or "random". Default: "spectral".
     * @param {string} method
     * @returns {UMAPBuilder}
     */
    initMethod(method) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(method, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.umapbuilder_initMethod(ptr, ptr0, len0);
        return UMAPBuilder.__wrap(ret);
    }
    /**
     * Initial learning rate. Default: 1.0.
     * @param {number} lr
     * @returns {UMAPBuilder}
     */
    learningRate(lr) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.umapbuilder_learningRate(ptr, lr);
        return UMAPBuilder.__wrap(ret);
    }
    /**
     * Local connectivity constraint. Default: 1.0.
     * @param {number} c
     * @returns {UMAPBuilder}
     */
    localConnectivity(c) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.umapbuilder_localConnectivity(ptr, c);
        return UMAPBuilder.__wrap(ret);
    }
    /**
     * Distance metric ("euclidean", "cosine", etc.). Default: "euclidean".
     * @param {string} metric
     * @returns {UMAPBuilder}
     */
    metric(metric) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(metric, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.umapbuilder_metric(ptr, ptr0, len0);
        return UMAPBuilder.__wrap(ret);
    }
    /**
     * Minimum distance between points in embedding. Default: 0.1.
     * @param {number} d
     * @returns {UMAPBuilder}
     */
    minDist(d) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.umapbuilder_minDist(ptr, d);
        return UMAPBuilder.__wrap(ret);
    }
    /**
     * Interpolation between fuzzy union and intersection. Default: 1.0.
     * @param {number} r
     * @returns {UMAPBuilder}
     */
    mixRatio(r) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.umapbuilder_mixRatio(ptr, r);
        return UMAPBuilder.__wrap(ret);
    }
    /**
     * Number of optimization epochs. Default: auto.
     * @param {number} n
     * @returns {UMAPBuilder}
     */
    nEpochs(n) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.umapbuilder_nEpochs(ptr, n);
        return UMAPBuilder.__wrap(ret);
    }
    /**
     * Number of neighbors for graph construction. Default: 15.
     * @param {number} n
     * @returns {UMAPBuilder}
     */
    nNeighbors(n) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.umapbuilder_nNeighbors(ptr, n);
        return UMAPBuilder.__wrap(ret);
    }
    /**
     * Negative samples per positive sample. Default: 5.
     * @param {number} r
     * @returns {UMAPBuilder}
     */
    negativeSampleRate(r) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.umapbuilder_negativeSampleRate(ptr, r);
        return UMAPBuilder.__wrap(ret);
    }
    /**
     * Create a new UMAP builder.
     *
     * @param data - Flat Float32Array, row-major (n_rows * n_cols).
     * @param n_rows - Number of data points.
     * @param n_cols - Number of input features.
     * @param n_components - Target embedding dimensions (typically 2).
     * @param {Float32Array} data
     * @param {number} n_rows
     * @param {number} n_cols
     * @param {number} n_components
     */
    constructor(data, n_rows, n_cols, n_components) {
        const ptr0 = passArrayF32ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.umapbuilder_new(ptr0, len0, n_rows, n_cols, n_components);
        this.__wbg_ptr = ret >>> 0;
        UMAPBuilderFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Set a progress callback: `(progress: number, stage: string) => void`.
     * `progress` is in [0, 1], `stage` describes the current processing phase.
     * @param {Function} callback
     * @returns {UMAPBuilder}
     */
    progress(callback) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.umapbuilder_progress(ptr, callback);
        return UMAPBuilder.__wrap(ret);
    }
    /**
     * Random seed for reproducibility. Default: None (random).
     * @param {bigint} seed
     * @returns {UMAPBuilder}
     */
    randomState(seed) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.umapbuilder_randomState(ptr, seed);
        return UMAPBuilder.__wrap(ret);
    }
    /**
     * Weight of repulsive force. Default: 1.0.
     * @param {number} s
     * @returns {UMAPBuilder}
     */
    repulsionStrength(s) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.umapbuilder_repulsionStrength(ptr, s);
        return UMAPBuilder.__wrap(ret);
    }
    /**
     * Effective scale of embedded points. Default: 1.0.
     * @param {number} s
     * @returns {UMAPBuilder}
     */
    spread(s) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.umapbuilder_spread(ptr, s);
        return UMAPBuilder.__wrap(ret);
    }
    /**
     * Enable verbose output. Default: false.
     * @param {boolean} v
     * @returns {UMAPBuilder}
     */
    verbose(v) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.umapbuilder_verbose(ptr, v);
        return UMAPBuilder.__wrap(ret);
    }
}
if (Symbol.dispose) UMAPBuilder.prototype[Symbol.dispose] = UMAPBuilder.prototype.free;

/**
 * Result of a UMAP embedding.
 */
export class UMAPResult {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(UMAPResult.prototype);
        obj.__wbg_ptr = ptr;
        UMAPResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        UMAPResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_umapresult_free(ptr, 0);
    }
    /**
     * Embedding coordinates as a flat Float32Array (row-major, n_rows x n_components).
     * @returns {Float32Array}
     */
    get embedding() {
        const ret = wasm.umapresult_embedding(this.__wbg_ptr);
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * KNN distances as a flat Float32Array (row-major, n_rows x n_neighbors).
     * @returns {Float32Array}
     */
    get knnDistances() {
        const ret = wasm.umapresult_knnDistances(this.__wbg_ptr);
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * KNN indices as a flat Int32Array (row-major, n_rows x n_neighbors).
     * @returns {Int32Array}
     */
    get knnIndices() {
        const ret = wasm.umapresult_knnIndices(this.__wbg_ptr);
        var v1 = getArrayI32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Number of embedding dimensions.
     * @returns {number}
     */
    get nComponents() {
        const ret = wasm.umapresult_nComponents(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Number of neighbors per point.
     * @returns {number}
     */
    get nNeighbors() {
        const ret = wasm.umapresult_nNeighbors(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Number of data points.
     * @returns {number}
     */
    get nRows() {
        const ret = wasm.umapresult_nRows(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) UMAPResult.prototype[Symbol.dispose] = UMAPResult.prototype.free;

function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Error_83742b46f01ce22d: function(arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_Window_412fe051c1aa1519: function(arg0) {
            const ret = arg0.Window;
            return ret;
        },
        __wbg_WorkerGlobalScope_349300f9b277afe1: function(arg0) {
            const ret = arg0.WorkerGlobalScope;
            return ret;
        },
        __wbg___wbindgen_debug_string_5398f5bb970e0daa: function(arg0, arg1) {
            const ret = debugString(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_is_function_3c846841762788c1: function(arg0) {
            const ret = typeof(arg0) === 'function';
            return ret;
        },
        __wbg___wbindgen_is_null_0b605fc6b167c56f: function(arg0) {
            const ret = arg0 === null;
            return ret;
        },
        __wbg___wbindgen_is_undefined_52709e72fb9f179c: function(arg0) {
            const ret = arg0 === undefined;
            return ret;
        },
        __wbg___wbindgen_throw_6ddd609b62940d55: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg__wbg_cb_unref_6b5b6b8576d35cb1: function(arg0) {
            arg0._wbg_cb_unref();
        },
        __wbg_beginComputePass_097033d61ef8af0f: function(arg0, arg1) {
            const ret = arg0.beginComputePass(arg1);
            return ret;
        },
        __wbg_buffer_60b8043cd926067d: function(arg0) {
            const ret = arg0.buffer;
            return ret;
        },
        __wbg_call_2d781c1f4d5c0ef8: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.call(arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_call_dcc2662fa17a72cf: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = arg0.call(arg1, arg2, arg3);
            return ret;
        }, arguments); },
        __wbg_copyBufferToBuffer_99ba10ae51f20b8a: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
            arg0.copyBufferToBuffer(arg1, arg2, arg3, arg4, arg5);
        }, arguments); },
        __wbg_createBindGroupLayout_1d37ac0dabfbed28: function() { return handleError(function (arg0, arg1) {
            const ret = arg0.createBindGroupLayout(arg1);
            return ret;
        }, arguments); },
        __wbg_createBindGroup_3bccbd7517f0708e: function(arg0, arg1) {
            const ret = arg0.createBindGroup(arg1);
            return ret;
        },
        __wbg_createBuffer_24b346170c9f54c8: function() { return handleError(function (arg0, arg1) {
            const ret = arg0.createBuffer(arg1);
            return ret;
        }, arguments); },
        __wbg_createCommandEncoder_48a406baaa084912: function(arg0, arg1) {
            const ret = arg0.createCommandEncoder(arg1);
            return ret;
        },
        __wbg_createComputePipeline_4efb4ca205a4b557: function(arg0, arg1) {
            const ret = arg0.createComputePipeline(arg1);
            return ret;
        },
        __wbg_createPipelineLayout_f668b6fbdf877ab3: function(arg0, arg1) {
            const ret = arg0.createPipelineLayout(arg1);
            return ret;
        },
        __wbg_createShaderModule_1b0812f3a4503221: function(arg0, arg1) {
            const ret = arg0.createShaderModule(arg1);
            return ret;
        },
        __wbg_dispatchWorkgroups_1b750cb68e2eb693: function(arg0, arg1, arg2, arg3) {
            arg0.dispatchWorkgroups(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0);
        },
        __wbg_end_fd65a01a19361ec7: function(arg0) {
            arg0.end();
        },
        __wbg_finish_2440fb64e53f7d5a: function(arg0, arg1) {
            const ret = arg0.finish(arg1);
            return ret;
        },
        __wbg_finish_4b40810f0b577bc2: function(arg0) {
            const ret = arg0.finish();
            return ret;
        },
        __wbg_getMappedRange_55878eb97535ca19: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.getMappedRange(arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_getRandomValues_76dfc69825c9c552: function() { return handleError(function (arg0, arg1) {
            globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
        }, arguments); },
        __wbg_gpu_bafbc1407fe850fb: function(arg0) {
            const ret = arg0.gpu;
            return ret;
        },
        __wbg_instanceof_GpuAdapter_aff4b0f95a6c1c3e: function(arg0) {
            let result;
            try {
                result = arg0 instanceof GPUAdapter;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_label_4b6427d9045e3926: function(arg0, arg1) {
            const ret = arg1.label;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_length_ea16607d7b61445b: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_limits_2ae770381034d5ef: function(arg0) {
            const ret = arg0.limits;
            return ret;
        },
        __wbg_limits_805a5a24eacdef89: function(arg0) {
            const ret = arg0.limits;
            return ret;
        },
        __wbg_mapAsync_f7fe2e4825742580: function(arg0, arg1, arg2, arg3) {
            const ret = arg0.mapAsync(arg1 >>> 0, arg2, arg3);
            return ret;
        },
        __wbg_maxBindGroups_aeb19ade452446c6: function(arg0) {
            const ret = arg0.maxBindGroups;
            return ret;
        },
        __wbg_maxBindingsPerBindGroup_56b9cd783b976459: function(arg0) {
            const ret = arg0.maxBindingsPerBindGroup;
            return ret;
        },
        __wbg_maxBufferSize_b9cfa105ccd49524: function(arg0) {
            const ret = arg0.maxBufferSize;
            return ret;
        },
        __wbg_maxColorAttachmentBytesPerSample_3853759407ab3c40: function(arg0) {
            const ret = arg0.maxColorAttachmentBytesPerSample;
            return ret;
        },
        __wbg_maxColorAttachments_a9a3c5bc728fb56f: function(arg0) {
            const ret = arg0.maxColorAttachments;
            return ret;
        },
        __wbg_maxComputeInvocationsPerWorkgroup_732f87215035d9e5: function(arg0) {
            const ret = arg0.maxComputeInvocationsPerWorkgroup;
            return ret;
        },
        __wbg_maxComputeWorkgroupSizeX_4f1d6552edeba82a: function(arg0) {
            const ret = arg0.maxComputeWorkgroupSizeX;
            return ret;
        },
        __wbg_maxComputeWorkgroupSizeY_170c377843fcdda9: function(arg0) {
            const ret = arg0.maxComputeWorkgroupSizeY;
            return ret;
        },
        __wbg_maxComputeWorkgroupSizeZ_78bd13bc9226bc99: function(arg0) {
            const ret = arg0.maxComputeWorkgroupSizeZ;
            return ret;
        },
        __wbg_maxComputeWorkgroupStorageSize_0a6873ffe86d432d: function(arg0) {
            const ret = arg0.maxComputeWorkgroupStorageSize;
            return ret;
        },
        __wbg_maxComputeWorkgroupsPerDimension_7f64fa252d98d9e0: function(arg0) {
            const ret = arg0.maxComputeWorkgroupsPerDimension;
            return ret;
        },
        __wbg_maxDynamicStorageBuffersPerPipelineLayout_548c4d8427692343: function(arg0) {
            const ret = arg0.maxDynamicStorageBuffersPerPipelineLayout;
            return ret;
        },
        __wbg_maxDynamicUniformBuffersPerPipelineLayout_575f81e5a619fda4: function(arg0) {
            const ret = arg0.maxDynamicUniformBuffersPerPipelineLayout;
            return ret;
        },
        __wbg_maxSampledTexturesPerShaderStage_4b0d0d0deb7f9173: function(arg0) {
            const ret = arg0.maxSampledTexturesPerShaderStage;
            return ret;
        },
        __wbg_maxSamplersPerShaderStage_122e1c314b7d5f0e: function(arg0) {
            const ret = arg0.maxSamplersPerShaderStage;
            return ret;
        },
        __wbg_maxStorageBufferBindingSize_69368e8c4a720d65: function(arg0) {
            const ret = arg0.maxStorageBufferBindingSize;
            return ret;
        },
        __wbg_maxStorageBuffersPerShaderStage_483da9a48e09b2cd: function(arg0) {
            const ret = arg0.maxStorageBuffersPerShaderStage;
            return ret;
        },
        __wbg_maxStorageTexturesPerShaderStage_825095cb824c2a90: function(arg0) {
            const ret = arg0.maxStorageTexturesPerShaderStage;
            return ret;
        },
        __wbg_maxTextureArrayLayers_311d9cd973092ad3: function(arg0) {
            const ret = arg0.maxTextureArrayLayers;
            return ret;
        },
        __wbg_maxTextureDimension1D_f14696527b4dd4c9: function(arg0) {
            const ret = arg0.maxTextureDimension1D;
            return ret;
        },
        __wbg_maxTextureDimension2D_8a888981a9a496a3: function(arg0) {
            const ret = arg0.maxTextureDimension2D;
            return ret;
        },
        __wbg_maxTextureDimension3D_af7a8c47b3a93760: function(arg0) {
            const ret = arg0.maxTextureDimension3D;
            return ret;
        },
        __wbg_maxUniformBufferBindingSize_5cab04d98886e7d3: function(arg0) {
            const ret = arg0.maxUniformBufferBindingSize;
            return ret;
        },
        __wbg_maxUniformBuffersPerShaderStage_14f4345c06c80500: function(arg0) {
            const ret = arg0.maxUniformBuffersPerShaderStage;
            return ret;
        },
        __wbg_maxVertexAttributes_73ce901689262af1: function(arg0) {
            const ret = arg0.maxVertexAttributes;
            return ret;
        },
        __wbg_maxVertexBufferArrayStride_4cb22981054e6df0: function(arg0) {
            const ret = arg0.maxVertexBufferArrayStride;
            return ret;
        },
        __wbg_maxVertexBuffers_a6df2bc183ca7af0: function(arg0) {
            const ret = arg0.maxVertexBuffers;
            return ret;
        },
        __wbg_minStorageBufferOffsetAlignment_2039bfddd5b42bd9: function(arg0) {
            const ret = arg0.minStorageBufferOffsetAlignment;
            return ret;
        },
        __wbg_minUniformBufferOffsetAlignment_4366c5e24c3a2e2f: function(arg0) {
            const ret = arg0.minUniformBufferOffsetAlignment;
            return ret;
        },
        __wbg_navigator_583ffd4fc14c0f7a: function(arg0) {
            const ret = arg0.navigator;
            return ret;
        },
        __wbg_navigator_9cebf56f28aa719b: function(arg0) {
            const ret = arg0.navigator;
            return ret;
        },
        __wbg_new_ab79df5bd7c26067: function() {
            const ret = new Object();
            return ret;
        },
        __wbg_new_from_slice_22da9388ac046e50: function(arg0, arg1) {
            const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_new_typed_aaaeaf29cf802876: function(arg0, arg1) {
            try {
                var state0 = {a: arg0, b: arg1};
                var cb0 = (arg0, arg1) => {
                    const a = state0.a;
                    state0.a = 0;
                    try {
                        return wasm_bindgen__convert__closures_____invoke__h1c03c2421eb6fc91(a, state0.b, arg0, arg1);
                    } finally {
                        state0.a = a;
                    }
                };
                const ret = new Promise(cb0);
                return ret;
            } finally {
                state0.a = state0.b = 0;
            }
        },
        __wbg_new_typed_bccac67128ed885a: function() {
            const ret = new Array();
            return ret;
        },
        __wbg_new_with_byte_offset_and_length_b2ec5bf7b2f35743: function(arg0, arg1, arg2) {
            const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
            return ret;
        },
        __wbg_nndescentindex_new: function(arg0) {
            const ret = NNDescentIndex.__wrap(arg0);
            return ret;
        },
        __wbg_prototypesetcall_d62e5099504357e6: function(arg0, arg1, arg2) {
            Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
        },
        __wbg_push_e87b0e732085a946: function(arg0, arg1) {
            const ret = arg0.push(arg1);
            return ret;
        },
        __wbg_queueMicrotask_0c399741342fb10f: function(arg0) {
            const ret = arg0.queueMicrotask;
            return ret;
        },
        __wbg_queueMicrotask_a082d78ce798393e: function(arg0) {
            queueMicrotask(arg0);
        },
        __wbg_queue_3e40156d83b9183e: function(arg0) {
            const ret = arg0.queue;
            return ret;
        },
        __wbg_requestAdapter_245da40985c2fdc5: function(arg0, arg1) {
            const ret = arg0.requestAdapter(arg1);
            return ret;
        },
        __wbg_requestDevice_28434913a23418c4: function(arg0, arg1) {
            const ret = arg0.requestDevice(arg1);
            return ret;
        },
        __wbg_resolve_ae8d83246e5bcc12: function(arg0) {
            const ret = Promise.resolve(arg0);
            return ret;
        },
        __wbg_setBindGroup_98f0303f15c3cfb4: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            arg0.setBindGroup(arg1 >>> 0, arg2, getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
        }, arguments); },
        __wbg_setBindGroup_bc67abae8c962082: function(arg0, arg1, arg2) {
            arg0.setBindGroup(arg1 >>> 0, arg2);
        },
        __wbg_setPipeline_0c34cc40ab8d6499: function(arg0, arg1) {
            arg0.setPipeline(arg1);
        },
        __wbg_set_7eaa4f96924fd6b3: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = Reflect.set(arg0, arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_set_access_1cc7ab8607a9643c: function(arg0, arg1) {
            arg0.access = __wbindgen_enum_GpuStorageTextureAccess[arg1];
        },
        __wbg_set_beginning_of_pass_write_index_ac45c363336c24c7: function(arg0, arg1) {
            arg0.beginningOfPassWriteIndex = arg1 >>> 0;
        },
        __wbg_set_bind_group_layouts_b4667372bdcee99f: function(arg0, arg1) {
            arg0.bindGroupLayouts = arg1;
        },
        __wbg_set_binding_0a48264269982c5e: function(arg0, arg1) {
            arg0.binding = arg1 >>> 0;
        },
        __wbg_set_binding_15ab1e2c74990b25: function(arg0, arg1) {
            arg0.binding = arg1 >>> 0;
        },
        __wbg_set_buffer_3b3e4c4a884d1610: function(arg0, arg1) {
            arg0.buffer = arg1;
        },
        __wbg_set_buffer_ff433f6fc0bcc260: function(arg0, arg1) {
            arg0.buffer = arg1;
        },
        __wbg_set_code_c616b86ce504e24a: function(arg0, arg1, arg2) {
            arg0.code = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_compute_7c274f1347709d07: function(arg0, arg1) {
            arg0.compute = arg1;
        },
        __wbg_set_e80615d7a9a43981: function(arg0, arg1, arg2) {
            arg0.set(arg1, arg2 >>> 0);
        },
        __wbg_set_end_of_pass_write_index_c60088bc589e6882: function(arg0, arg1) {
            arg0.endOfPassWriteIndex = arg1 >>> 0;
        },
        __wbg_set_entries_bfc700c1f97eec0b: function(arg0, arg1) {
            arg0.entries = arg1;
        },
        __wbg_set_entries_f07df780e3613292: function(arg0, arg1) {
            arg0.entries = arg1;
        },
        __wbg_set_entry_point_aa503b3bb9fed987: function(arg0, arg1, arg2) {
            arg0.entryPoint = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_format_b8158198b657d617: function(arg0, arg1) {
            arg0.format = __wbindgen_enum_GpuTextureFormat[arg1];
        },
        __wbg_set_has_dynamic_offset_4d5601049080763e: function(arg0, arg1) {
            arg0.hasDynamicOffset = arg1 !== 0;
        },
        __wbg_set_label_392dc66ad76d942d: function(arg0, arg1, arg2) {
            arg0.label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_3e06143ad04772ae: function(arg0, arg1, arg2) {
            arg0.label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_50f397060b5b5610: function(arg0, arg1, arg2) {
            arg0.label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_68e2953cfd33a5a5: function(arg0, arg1, arg2) {
            arg0.label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_76c4f74a38ff9bcd: function(arg0, arg1, arg2) {
            arg0.label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_79484ec4d6d85bbf: function(arg0, arg1, arg2) {
            arg0.label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_861c8e348e26599d: function(arg0, arg1, arg2) {
            arg0.label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_d1b6a326332d0520: function(arg0, arg1, arg2) {
            arg0.label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_d687cfb9a30329c8: function(arg0, arg1, arg2) {
            arg0.label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_e345704005fb385b: function(arg0, arg1, arg2) {
            arg0.label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_layout_b9b36c291ee7f2e1: function(arg0, arg1) {
            arg0.layout = arg1;
        },
        __wbg_set_layout_cccbb8f794df887c: function(arg0, arg1) {
            arg0.layout = arg1;
        },
        __wbg_set_mapped_at_creation_34da9d6bf64b78d6: function(arg0, arg1) {
            arg0.mappedAtCreation = arg1 !== 0;
        },
        __wbg_set_min_binding_size_9389ad67218af140: function(arg0, arg1) {
            arg0.minBindingSize = arg1;
        },
        __wbg_set_module_5f33a55198ad797f: function(arg0, arg1) {
            arg0.module = arg1;
        },
        __wbg_set_multisampled_b526741755338725: function(arg0, arg1) {
            arg0.multisampled = arg1 !== 0;
        },
        __wbg_set_offset_1a0f95ffb7dd6f40: function(arg0, arg1) {
            arg0.offset = arg1;
        },
        __wbg_set_power_preference_915480f4b9565dc2: function(arg0, arg1) {
            arg0.powerPreference = __wbindgen_enum_GpuPowerPreference[arg1];
        },
        __wbg_set_query_set_0a78c3dcb3650b2b: function(arg0, arg1) {
            arg0.querySet = arg1;
        },
        __wbg_set_required_features_42347bf311233eb6: function(arg0, arg1) {
            arg0.requiredFeatures = arg1;
        },
        __wbg_set_resource_f2d72f59cc9308fc: function(arg0, arg1) {
            arg0.resource = arg1;
        },
        __wbg_set_sample_type_6d1e240a417bdf44: function(arg0, arg1) {
            arg0.sampleType = __wbindgen_enum_GpuTextureSampleType[arg1];
        },
        __wbg_set_sampler_f864a162bad4f66f: function(arg0, arg1) {
            arg0.sampler = arg1;
        },
        __wbg_set_size_6b2fc4a0e39e4d07: function(arg0, arg1) {
            arg0.size = arg1;
        },
        __wbg_set_size_c78ae8d2e2181815: function(arg0, arg1) {
            arg0.size = arg1;
        },
        __wbg_set_storage_texture_c3919f22b211c542: function(arg0, arg1) {
            arg0.storageTexture = arg1;
        },
        __wbg_set_texture_bf820de044f0d291: function(arg0, arg1) {
            arg0.texture = arg1;
        },
        __wbg_set_timestamp_writes_b9e1d87e2f057bd1: function(arg0, arg1) {
            arg0.timestampWrites = arg1;
        },
        __wbg_set_type_40f4ae4fa32946cd: function(arg0, arg1) {
            arg0.type = __wbindgen_enum_GpuBufferBindingType[arg1];
        },
        __wbg_set_type_4f1cd48d79f4d6dc: function(arg0, arg1) {
            arg0.type = __wbindgen_enum_GpuSamplerBindingType[arg1];
        },
        __wbg_set_usage_9aa23fa1e13799a8: function(arg0, arg1) {
            arg0.usage = arg1 >>> 0;
        },
        __wbg_set_view_dimension_36c0bf530395d014: function(arg0, arg1) {
            arg0.viewDimension = __wbindgen_enum_GpuTextureViewDimension[arg1];
        },
        __wbg_set_view_dimension_553cd9fa176d06ca: function(arg0, arg1) {
            arg0.viewDimension = __wbindgen_enum_GpuTextureViewDimension[arg1];
        },
        __wbg_set_visibility_eef2d8e9608a8981: function(arg0, arg1) {
            arg0.visibility = arg1 >>> 0;
        },
        __wbg_static_accessor_GLOBAL_8adb955bd33fac2f: function() {
            const ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_GLOBAL_THIS_ad356e0db91c7913: function() {
            const ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_SELF_f207c857566db248: function() {
            const ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_WINDOW_bb9f1ba69d61b386: function() {
            const ret = typeof window === 'undefined' ? null : window;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_submit_2521bdd9a232bca7: function(arg0, arg1) {
            arg0.submit(arg1);
        },
        __wbg_then_098abe61755d12f6: function(arg0, arg1) {
            const ret = arg0.then(arg1);
            return ret;
        },
        __wbg_then_9e335f6dd892bc11: function(arg0, arg1, arg2) {
            const ret = arg0.then(arg1, arg2);
            return ret;
        },
        __wbg_then_bc59d1943397ca4e: function(arg0, arg1, arg2) {
            const ret = arg0.then(arg1, arg2);
            return ret;
        },
        __wbg_umapresult_new: function(arg0) {
            const ret = UMAPResult.__wrap(arg0);
            return ret;
        },
        __wbg_unmap_815a075fd850cb73: function(arg0) {
            arg0.unmap();
        },
        __wbg_writeBuffer_e8b792fb0962f30d: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
            arg0.writeBuffer(arg1, arg2, arg3, arg4, arg5);
        }, arguments); },
        __wbindgen_cast_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { dtor_idx: 168, function: Function { arguments: [Externref], shim_idx: 169, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__haa54f3cb78148739, wasm_bindgen__convert__closures_____invoke__h143de1bb2d9032f7);
            return ret;
        },
        __wbindgen_cast_0000000000000002: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { dtor_idx: 179, function: Function { arguments: [Externref], shim_idx: 180, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__hdfc360fd1cd8c401, wasm_bindgen__convert__closures_____invoke__h5b921cd3a1e32cf4);
            return ret;
        },
        __wbindgen_cast_0000000000000003: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_cast_0000000000000004: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
            const ret = getArrayU8FromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_cast_0000000000000005: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./umap_wasm_bg.js": import0,
    };
}

function wasm_bindgen__convert__closures_____invoke__h143de1bb2d9032f7(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures_____invoke__h143de1bb2d9032f7(arg0, arg1, arg2);
}

function wasm_bindgen__convert__closures_____invoke__h5b921cd3a1e32cf4(arg0, arg1, arg2) {
    const ret = wasm.wasm_bindgen__convert__closures_____invoke__h5b921cd3a1e32cf4(arg0, arg1, arg2);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

function wasm_bindgen__convert__closures_____invoke__h1c03c2421eb6fc91(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures_____invoke__h1c03c2421eb6fc91(arg0, arg1, arg2, arg3);
}


const __wbindgen_enum_GpuBufferBindingType = ["uniform", "storage", "read-only-storage"];


const __wbindgen_enum_GpuPowerPreference = ["low-power", "high-performance"];


const __wbindgen_enum_GpuSamplerBindingType = ["filtering", "non-filtering", "comparison"];


const __wbindgen_enum_GpuStorageTextureAccess = ["write-only", "read-only", "read-write"];


const __wbindgen_enum_GpuTextureFormat = ["r8unorm", "r8snorm", "r8uint", "r8sint", "r16uint", "r16sint", "r16float", "rg8unorm", "rg8snorm", "rg8uint", "rg8sint", "r32uint", "r32sint", "r32float", "rg16uint", "rg16sint", "rg16float", "rgba8unorm", "rgba8unorm-srgb", "rgba8snorm", "rgba8uint", "rgba8sint", "bgra8unorm", "bgra8unorm-srgb", "rgb9e5ufloat", "rgb10a2uint", "rgb10a2unorm", "rg11b10ufloat", "rg32uint", "rg32sint", "rg32float", "rgba16uint", "rgba16sint", "rgba16float", "rgba32uint", "rgba32sint", "rgba32float", "stencil8", "depth16unorm", "depth24plus", "depth24plus-stencil8", "depth32float", "depth32float-stencil8", "bc1-rgba-unorm", "bc1-rgba-unorm-srgb", "bc2-rgba-unorm", "bc2-rgba-unorm-srgb", "bc3-rgba-unorm", "bc3-rgba-unorm-srgb", "bc4-r-unorm", "bc4-r-snorm", "bc5-rg-unorm", "bc5-rg-snorm", "bc6h-rgb-ufloat", "bc6h-rgb-float", "bc7-rgba-unorm", "bc7-rgba-unorm-srgb", "etc2-rgb8unorm", "etc2-rgb8unorm-srgb", "etc2-rgb8a1unorm", "etc2-rgb8a1unorm-srgb", "etc2-rgba8unorm", "etc2-rgba8unorm-srgb", "eac-r11unorm", "eac-r11snorm", "eac-rg11unorm", "eac-rg11snorm", "astc-4x4-unorm", "astc-4x4-unorm-srgb", "astc-5x4-unorm", "astc-5x4-unorm-srgb", "astc-5x5-unorm", "astc-5x5-unorm-srgb", "astc-6x5-unorm", "astc-6x5-unorm-srgb", "astc-6x6-unorm", "astc-6x6-unorm-srgb", "astc-8x5-unorm", "astc-8x5-unorm-srgb", "astc-8x6-unorm", "astc-8x6-unorm-srgb", "astc-8x8-unorm", "astc-8x8-unorm-srgb", "astc-10x5-unorm", "astc-10x5-unorm-srgb", "astc-10x6-unorm", "astc-10x6-unorm-srgb", "astc-10x8-unorm", "astc-10x8-unorm-srgb", "astc-10x10-unorm", "astc-10x10-unorm-srgb", "astc-12x10-unorm", "astc-12x10-unorm-srgb", "astc-12x12-unorm", "astc-12x12-unorm-srgb"];


const __wbindgen_enum_GpuTextureSampleType = ["float", "unfilterable-float", "depth", "sint", "uint"];


const __wbindgen_enum_GpuTextureViewDimension = ["1d", "2d", "2d-array", "cube", "cube-array", "3d"];
const NNDescentBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_nndescentbuilder_free(ptr >>> 0, 1));
const NNDescentIndexFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_nndescentindex_free(ptr >>> 0, 1));
const NeighborResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_neighborresult_free(ptr >>> 0, 1));
const UMAPBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_umapbuilder_free(ptr >>> 0, 1));
const UMAPResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_umapresult_free(ptr >>> 0, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => state.dtor(state.a, state.b));

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayI32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat32ArrayMemory0 = null;
function getFloat32ArrayMemory0() {
    if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.byteLength === 0) {
        cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32ArrayMemory0;
}

let cachedInt32ArrayMemory0 = null;
function getInt32ArrayMemory0() {
    if (cachedInt32ArrayMemory0 === null || cachedInt32ArrayMemory0.byteLength === 0) {
        cachedInt32ArrayMemory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            state.dtor(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function passArrayF32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getFloat32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedFloat32ArrayMemory0 = null;
    cachedInt32ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('umap_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
