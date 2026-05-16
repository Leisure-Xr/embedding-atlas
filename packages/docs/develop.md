# 开发说明

[在 GitHub 上查看代码](https://github.com/apple/embedding-atlas)。

本仓库采用单体仓库组织，包含以下包：

**前端：**

- `packages/component`：`EmbeddingView` 和 `EmbeddingViewMosaic` 组件。
- `packages/viewer`：用于可视化嵌入和其他列的前端应用。它也提供可嵌入其他应用的 `EmbeddingAtlas` 组件。
- `packages/utils`：共享工具。
- `packages/embedding-atlas`：已发布的 `embedding-atlas` 包，将以上包重新导出为统一 API。
- `packages/examples`：展示如何使用 `embedding-atlas` 包的示例。

**Rust / WebAssembly:**

- `packages/density-clustering`：密度聚类算法，使用 Rust 编写并编译为 WebAssembly。
- `packages/umap`：UMAP 和 NNDescent 算法的 Rust 实现，编译为 WebAssembly。

**Python:**

- `packages/backend`：名为 `embedding-atlas` 的 Python 包，提供 `embedding-atlas` 命令行工具。

**文档：**

- `packages/docs`：文档网站。

## 前置条件

- [Node.js](https://nodejs.org/) 和 npm
- [uv](https://docs.astral.sh/uv/) 包管理器
- [Rust](https://www.rust-lang.org/)
- WebAssembly 目标：`rustup target add wasm32-unknown-unknown`
- wasm-bindgen 命令行工具：`cargo install -f wasm-bindgen-cli --version 0.2.114`

## 安装和构建

安装依赖：

```bash
npm install
```

构建所有包：

```bash
npm run build
```

这会构建所有包，包括 WASM 包（`umap-wasm` 和 `density-clustering`）。

## 开发

使用演示数据集启动命令行工具：

```bash
cd packages/backend
./start.sh
```

启动 `viewer` 包的开发服务器：

```bash
cd packages/viewer
npm run dev
```

`viewer` 包是 Embedding Atlas 的主界面。运行 `npm run dev` 后，界面会在 `http://localhost:5173` 提供服务。该界面需要位于 `http://localhost:5055` 的后端服务器提供数据。你可以按上文所述通过 `./start.sh` 启动后端。没有后端服务器时，仍可访问 `http://localhost:5173/#/test` 查看测试数据集，或访问 `http://localhost:5173/#/file` 使用文件加载器。

启动 `component` 包的开发服务器：

```bash
cd packages/component
npm run dev
```

启动 `examples` 包的开发服务器：

```bash
cd packages/examples
npm run dev
```

## 单元测试

运行单个包的测试：

```bash
# JavaScript 测试
cd packages/utils
npm run test

# Python 测试
cd packages/backend
uv run pytest

# Rust 测试
cd packages/density-clustering
cargo test
```

一次性运行所有 JavaScript、Python 和 Rust 测试：

```bash
npm run test
```

## 部署

包和文档网站通过 [GitHub Actions](https://github.com/apple/embedding-atlas/blob/main/.github/workflows/ci.yml) 部署。当发布带有 `vX.Y.Z` 格式标签的发布版本时会触发部署。

也可以手动运行工作流，并启用 "Publish Documentation Website"，单独部署文档网站。
