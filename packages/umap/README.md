# UMAP (Rust)

UMAP（Uniform Manifold Approximation and Projection）和 NNDescent（近似最近邻搜索）的纯 Rust 实现，并提供用于浏览器的 WebAssembly 绑定。

此实现基于原始 Python 库：

- **[umap-learn](https://github.com/lmcinnes/umap)** — Leland McInnes 编写的 UMAP 算法
- **[pynndescent](https://github.com/lmcinnes/pynndescent)** — Leland McInnes 编写的最近邻下降算法

## 结构

此 workspace 包含三个 crate：

### `nndescent/`

近似 k 最近邻图构建，从 PyNNDescent 移植而来。

- `distance.rs` — 距离度量（euclidean、cosine、manhattan、chebyshev、minkowski），通过 `wide` 使用 SIMD 加速
- `nn_descent.rs` — 用于迭代优化邻居图的核心 NN-descent 算法
- `rp_trees.rs` — 用于初始化和搜索的随机投影树
- `heap.rs` — 用于高效跟踪 k-NN 的最大堆
- `search.rs` — 基于已构建索引的查询功能
- `rng.rs` — 与 Python 实现匹配的 Tau RNG，用于可复现性

### `umap/`

UMAP 降维，从 umap-learn 移植而来。

- `lib.rs` — 使用 `UmapBuilder` 模式的公共 API。编排完整流水线：邻居查找、图构建、初始化和优化
- `graph.rs` — 稀疏矩阵操作、模糊单纯复形构建和对称化
- `spectral.rs` — 通过 LOBPCG 特征分解进行谱初始化，并包含 Jacobi 和 Cholesky 求解器
- `optimize.rs` — 使用带 Hogwild 并行和负采样的 SGD 进行布局优化

### `umap-wasm/`

通过 `wasm-bindgen` 提供 WebAssembly 绑定，将 UMAP 和 NNDescent 暴露给 JavaScript/TypeScript。
