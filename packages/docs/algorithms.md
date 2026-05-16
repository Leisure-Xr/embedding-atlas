# 算法

`embedding-atlas` 包包含一些用于计算嵌入和聚类的实用算法。

## UMAP

该包提供了 [UMAP (Uniform Manifold Approximation and Projection for Dimension Reduction)](https://umap-learn.readthedocs.io/en/latest/) 和近似最近邻搜索的 WebAssembly 实现。

此实现基于 Leland McInnes 的原始 Python 库 [umap-learn](https://github.com/lmcinnes/umap) 和 [pynndescent](https://github.com/lmcinnes/pynndescent)，移植到 Rust 并编译为 WebAssembly。

要初始化 UMAP 算法，请使用 `createUMAP`：

```js
import { createUMAP } from "embedding-atlas";

let count = 2000;
let inputDim = 100;
let outputDim = 2;

// 数据必须是包含 count * inputDim 个元素的 Float32Array。
let data = new Float32Array(count * inputDim);
// ... 填充数据

let options = {
  metric: "cosine",
};

// 使用 `createUMAP` 初始化算法。
let umap = await createUMAP(count, inputDim, outputDim, data, options);
```

初始化后，使用 `run` 方法更新嵌入坐标：

```js
// 运行算法直到完成。
await umap.run();
```

任何时候都可以通过调用 `embedding` 方法获取当前嵌入。

```js
// 结果是包含 count * outputDim 个元素的 Float32Array。
let embedding = umap.embedding();
```

实例使用完毕后，使用 `destroy` 方法释放资源。

```js
umap.destroy();
```

## NNDescent

可以使用 `createNNDescent` 函数执行近似最近邻搜索：

```js
import { createNNDescent } from "embedding-atlas";

let count = 2000;
let inputDim = 100;

// 数据必须是包含 count * inputDim 个元素的 Float32Array。
let data = new Float32Array(count * inputDim);
// ... 填充数据

let options = {
  metric: "cosine",
};

// 创建 NNDescent 索引
let index = await createNNDescent(count, inputDim, data, options);

// 执行查询
let query = new Float32Array(inputDim);
index.queryByVector(query, k);

// 销毁实例
index.destroy();
```

## 基于密度的聚类

该包提供了密度图聚类算法的 WebAssembly 实现。
要运行该算法，请使用 `findClusters`。

```js
import { findClusters } from "embedding-atlas";

// 包含 width * height 个浮点数的密度图。
let densityMap: Float32Array;

let clusters = await findClusters(densityMap, width, height);
```

`findClusters` 返回一个聚类数组，如下所述：

<!-- @doc(ts,no-required): Cluster -->
