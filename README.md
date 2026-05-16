# Embedding Atlas

[![NPM Version](https://img.shields.io/npm/v/embedding-atlas)](https://www.npmjs.com/package/embedding-atlas)
[![PyPI - Version](https://img.shields.io/pypi/v/embedding-atlas)](https://pypi.org/project/embedding-atlas/)
[![Paper](https://img.shields.io/badge/paper-arXiv:2505.06386-b31b1b.svg)](https://arxiv.org/abs/2505.06386)
![Build](https://github.com/apple/embedding-atlas/actions/workflows/ci.yml/badge.svg)
[![GitHub License](https://img.shields.io/github/license/apple/embedding-atlas)](./LICENSE)

> 本仓库是基于 Apple Embedding Atlas 的二次开发版本，已增加中文界面、本地 Parquet 示例和二次开发启动脚本。说明见 [OPEN_SOURCE.md](./OPEN_SOURCE.md)，本地示例见 [packages/backend/examples/local_parquet](./packages/backend/examples/local_parquet/)。

Embedding Atlas 是一个为大型嵌入数据提供交互式可视化的工具。它支持可视化、交叉筛选以及搜索嵌入和元数据。

**功能**

- 🏷️ **自动数据聚类与标注：**
  以交互方式可视化并浏览整体数据结构。

- 🫧 **核密度估计与密度等高线：**
  轻松探索并区分数据密集区域和离群点。

- 🧊 **顺序无关透明度：**
  确保重叠点能够清晰、准确地渲染。

- 🔍 **实时搜索与最近邻：**
  查找与给定查询或现有数据点相似的数据。

- 🚀 **WebGPU 实现（带 WebGL 2 回退）：**
  使用现代渲染栈实现快速、流畅的性能（最多可达数百万个点）。

- 📊 **用于元数据探索的多协调视图：**
  在多个元数据列之间交互式联动和筛选数据。

请访问 <https://apple.github.io/embedding-atlas> 查看演示和文档。

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./packages/docs/public/assets/embedding-atlas-dark.png">
  <img alt="Embedding Atlas 截图" src="./packages/docs/public/assets/embedding-atlas-light.png">
</picture>

## 开始使用

通过 Python 使用 Embedding Atlas：

```bash
pip install embedding-atlas

embedding-atlas <your-dataset.parquet>
```

除了命令行工具，Embedding Atlas 也可以作为 Python Notebook（例如 Jupyter）小组件使用：

```python
from embedding_atlas.widget import EmbeddingAtlasWidget

# 为你的数据框显示 Embedding Atlas 小组件：
EmbeddingAtlasWidget(df)
```

此外，Embedding Atlas 的组件也通过 npm 包提供：

```bash
npm install embedding-atlas
```

```js
import { EmbeddingAtlas, EmbeddingView } from "embedding-atlas";

// 或使用 React：
import { EmbeddingAtlas, EmbeddingView } from "embedding-atlas/react";

// 或使用 Svelte：
import { EmbeddingAtlas, EmbeddingView } from "embedding-atlas/svelte";
```

更多信息请访问 <https://apple.github.io/embedding-atlas/overview.html>。

## BibTeX

Embedding Atlas 工具：

```bibtex
@misc{ren2025embedding,
  title={Embedding Atlas: Low-Friction, Interactive Embedding Visualization},
  author={Donghao Ren and Fred Hohman and Halden Lin and Dominik Moritz},
  year={2025},
  eprint={2505.06386},
  archivePrefix={arXiv},
  primaryClass={cs.HC},
  url={https://arxiv.org/abs/2505.06386},
}
```

用于在嵌入视图中自动生成聚类和标签的算法：

```bibtex
@misc{ren2025scalable,
  title={A Scalable Approach to Clustering Embedding Projections},
  author={Donghao Ren and Fred Hohman and Dominik Moritz},
  year={2025},
  eprint={2504.07285},
  archivePrefix={arXiv},
  primaryClass={cs.HC},
  url={https://arxiv.org/abs/2504.07285},
}
```

## 开发

开发说明请访问 <https://apple.github.io/embedding-atlas/develop.html>，或查看 `packages/docs/develop.md`。

## 许可证

本代码基于 [`MIT 许可证`](LICENSE) 发布。
