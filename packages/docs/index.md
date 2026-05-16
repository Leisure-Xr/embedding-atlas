---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: Embedding Atlas
  text: 可扩展的交互式可视化
  tagline: 可视化、交叉筛选并搜索嵌入和元数据。

  image:
    light: ./assets/embedding-atlas-light.png
    dark: ./assets/embedding-atlas-dark.png
    alt: embedding atlas 截图
  actions:
    - theme: brand
      text: 示例
      link: /examples/
      target: _self
    - theme: brand
      text: 加载数据
      link: /app/
      target: _self
    - theme: alt
      text: 文档
      link: /overview

features:
  - icon: 🏷️
    title: 自动数据聚类与标注
    details: 以交互方式可视化并浏览整体数据结构。

  - icon: 🫧
    title: 核密度估计与密度等高线
    details: 轻松探索并区分数据密集区域和离群点。

  - icon: 🧊
    title: 顺序无关透明度
    details: 确保重叠点能够清晰、准确地渲染。

  - icon: 🔍
    title: 实时搜索与最近邻
    details: 查找与给定查询或现有数据点相似的数据。

  - icon: 🚀
    title: WebGPU 实现（带 WebGL 2 回退）
    details: 使用现代渲染栈实现快速、流畅的性能（最多可达数百万个点）。

  - icon: 📊
    title: 用于元数据探索的多协调视图
    details: 在多个元数据列之间交互式联动和筛选数据。
---
