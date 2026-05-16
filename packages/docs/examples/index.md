<script setup>
import { data } from "./examples.data";
</script>

# 示例

> **注意：** 打开示例会从标明的外部提供方将数据集直接加载到你的浏览器中。数据集来源和参考资料列在本页底部。

浏览这些交互式示例，了解 Embedding Atlas 如何可视化和分析带有预计算嵌入的各类数据集。

<div class="example-grid">
  <ExampleItem
    v-for="example of data.examples.embedding"
    :title="example.title"
    :details="example.details"
    :image="example.image"
    :data="example.data"
    :settings="example.settings"
    :state="example.state"
  />
</div>

虽然 Embedding Atlas 主要面向嵌入的可视化和探索，但它也提供了强大的表格数据集分析与可视化能力。

<div class="example-grid">
  <ExampleItem
    v-for="example of data.examples.tabular"
    :title="example.title"
    :details="example.details"
    :image="example.image"
    :data="example.data"
    :settings="example.settings"
    :state="example.state"
  />
</div>

### 数据集参考

<ul>
  <li v-for="dataset of data.datasets.sort((a, b) => a.title.toUpperCase() < b.title.toUpperCase() ? -1 : 1)" style="line-height: 1.2em; margin: 1em 0;">
      <b>{{dataset.title}}</b>
      <br />
      <span style="font-size: 13px">{{dataset.authors}}</span>
      <br />
      <span style="font-size: 13px">
        <a :href="dataset.link.url" target="_blank" noreferrer noopener>{{dataset.link.title}}</a>
      </span>
  </li>
</ul>

<style scoped>
.example-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: start;
  gap: 16px;
  margin-top: 16px;
  margin-bottom: 16px;
}
</style>
