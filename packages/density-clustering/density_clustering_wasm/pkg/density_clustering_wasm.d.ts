/* tslint:disable */
/* eslint-disable */

export interface ClusteringOptions {

}

export interface FindClustersOptions {
    clustering_options?: Partial<ClusteringOptions>;
    smooth_boundaries?: boolean;
    return_boundary_rects?: boolean;
}

export interface ClusterSummary {
    num_pixels: number;
    sum_x_density: number;
    sum_y_density: number;
    sum_density: number;
    max_density: number;
    max_density_location: [number, number];
}

export type Polygon = [number, number][];
export type Rect = [number, number, number, number];

export interface FindClustersResult {
    summaries: Map<number, ClusterSummary>;
    boundaries: Map<number, Polygon[]>;
    boundary_rects: Map<number, Rect[]>;
}



export class DensityMap {
    free(): void;
    [Symbol.dispose](): void;
    height(): number;
    constructor(width: number, height: number, data: Float32Array);
    width(): number;
}

export function find_clusters(input: DensityMap, options: FindClustersOptions): FindClustersResult;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_densitymap_free: (a: number, b: number) => void;
    readonly densitymap_height: (a: number) => number;
    readonly densitymap_new: (a: number, b: number, c: number, d: number) => number;
    readonly densitymap_width: (a: number) => number;
    readonly find_clusters: (a: number, b: any) => any;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
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
