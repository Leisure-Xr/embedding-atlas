# 概览

Embedding Atlas 是一个为大型嵌入数据提供交互式可视化的工具。它支持可视化、交叉筛选以及搜索嵌入和元数据。

::: tip
你可以直接在此网站上[加载自己的数据](https://apple.github.io/embedding-atlas/app/)来使用 Embedding Atlas。在这个在线版本中，Embedding Atlas 会在浏览器内计算嵌入和投影。你的数据不会离开本机。
:::

Embedding Atlas 以两个包发布：

- 一个 Python 包 `embedding-atlas`，提供：
  - 用于从命令行启动 Embedding Atlas 的[命令行工具](./tool.md)。
  - 用于在交互式 Python 笔记本中使用 Embedding Atlas 的 [Python Notebook 小组件](./widget.md)。
  - 用于在 Streamlit 应用中使用 Embedding Atlas 的 [Streamlit 组件](./streamlit.md)。
  - 所有这些方式都允许你计算嵌入（可使用自定义模型）和投影。

- 一个 npm 包 `embedding-atlas`，将用户界面组件作为 API 暴露，便于你在自己的应用中使用。暴露的组件如下：
  - [EmbeddingView](./embedding-view.md)
  - [EmbeddingViewMosaic](./embedding-view-mosaic.md)
  - [EmbeddingAtlas](./embedding-atlas.md)
  - [算法](./algorithms.md)
