# EmbeddingAtlas

`embedding-atlas` 包包含一个用于 Embedding Atlas 整体前端用户界面的组件。

```bash
npm install embedding-atlas
```

使用 React 封装组件：

```js
import { EmbeddingAtlas } from "embedding-atlas/react";

let coordinator: Coordinator; // Mosaic 协调器。

<EmbeddingAtlas
  coordinator={coordinator}
  data={{
    table: "data_table",
    id: "id_column",
    projection: { x: "x_column", y: "y_column" },
    text: "text_column"
  }}
  ...
/>
```

使用 Svelte 封装组件：

```js
import { EmbeddingAtlas } from "embedding-atlas/svelte";

let coordinator: Coordinator; // Mosaic 协调器。

<EmbeddingAtlas
  coordinator={coordinator}
  data={{
    table: "data_table",
    id: "id_column",
    projection: { x: "x_column", y: "y_column" },
    text: "text_column"
  }}
  ...
/>
```

如果你的应用不使用 React 或 Svelte，可以直接构造该组件：

```js
import { EmbeddingAtlas } from "embedding-atlas";

let coordinator: Coordinator; // Mosaic 协调器。

let target = document.getElementById("container");
let props = {
  coordinator: coordinator,
  data: {
    table: "data_table",
    id: "id_column",
    projection: { x: "x_column", y: "y_column" },
    text: "text_column"
  },
  // ...
};

// 创建并挂载组件
let component = new EmbeddingAtlas(target, props);

// 使用新属性更新
component.update(newProps);

// 销毁组件
component.destroy();
```

## 属性

可以使用以下属性（props）配置该视图：

<!-- @doc(ts): EmbeddingAtlasProps -->

## 状态

`EmbeddingAtlasState` 接口描述 Embedding Atlas UI 的状态。

可以将 `initialState` 设置为之前保存的状态值，以便将 UI 重新加载到先前状态。

状态属性：

<!-- @doc(ts): EmbeddingAtlasState -->

## 图表主题

可以向组件的 `chartTheme` 属性传入包含以下属性的对象，用于设置图表样式。
也可以将这些选项作为 `light` 和/或 `dark` 属性提供，这会根据视图的 `colorScheme` 控制外观。例如：

```ts
{
  light: {
    markColor: "black";
  }
  dark: {
    markColor: "white";
  }
}
```

<!-- @doc(ts,no-required): ChartTheme -->
