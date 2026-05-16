# 密度聚类算法

此目录包含密度图聚类算法的代码。

## 构建

环境：

- 通过 [rustup](https://rustup.rs/) 安装 Rust 工具链。
- 使用 `npm install -g wasm-pack` 安装 wasm-pack 工具。

构建命令行工具：

```bash
cargo build --release
```

构建 WASM 包：

```bash
cd density_clustering_wasm
npx wasm-pack build --release
```

将 WASM 包复制到 UI 组件：

```bash
rm -rf ../../src/lib/density_clustering/wasm
mkdir ../../src/lib/density_clustering/wasm
cp pkg/*.ts pkg/*.js pkg/*.wasm ../../src/lib/density_clustering/wasm
```
