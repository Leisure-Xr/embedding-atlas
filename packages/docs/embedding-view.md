# EmbeddingView

`embedding-atlas` 包包含一个组件，可显示带 x 和 y 坐标的嵌入中的最多数百万个点。

我们还提供该组件的 React 和 Svelte 封装组件，便于你将其加入自己的应用。

<p class="light-only"><img style="margin: 0 auto;" src="./public/assets/component-light.png" /></p>
<p class="dark-only"><img style="margin: 0 auto;" src="./public/assets/component-dark.png" /></p>

```bash
npm install embedding-atlas
```

使用 React 封装组件：

```js
import { EmbeddingView } from "embedding-atlas/react";

// 用状态捕获视图提示框
let [tooltip, setTooltip] = useState(null);

let xColumn: Float32Array;
let yColumn: Float32Array;
let categoryColumn: Uint8Array; // 可选

<EmbeddingView
  data={{x: xColumn, y: yColumn, category: categoryColumn}}
  tooltip={tooltip}
  onTooltip={setTooltip}
  ...
/>
```

使用 Svelte 封装组件：

```js
import { EmbeddingView } from "embedding-atlas/svelte";

// 将提示框作为状态。
let tooltip = $state(null);

<EmbeddingView
  data={{ x: xColumn, y: yColumn, category: categoryColumn }}
  tooltip={tooltip}
  onTooltip={(v) => (tooltip = v)}
  ...
/>
```

如果你的应用不使用 React 或 Svelte，可以直接构造该组件：

```js
import { EmbeddingView } from "embedding-atlas";

let target = document.getElementById("container");
let props = {
  data: {
    x: xColumn,
    y: yColumn,
    category: categoryColumn,
    onTooltip: (value) => {
      // ...
    },
  },
};

// 创建并挂载组件
let component = new EmbeddingView(target, props);

// 使用新属性更新
component.update(newProps);

// 销毁组件
component.destroy();
```

## 属性

可以使用以下属性（props）配置该视图：

<!-- @doc(ts): EmbeddingViewProps -->

## 配置

可以向嵌入视图的 `config` 属性传入包含以下属性的对象：

<!-- @doc(ts): EmbeddingViewConfig -->

## 主题

可以向嵌入视图的 `theme` 属性传入包含以下属性的对象。
也可以将这些选项作为 `light` 和/或 `dark` 属性提供，这会根据视图的 `colorScheme` 控制外观。例如：

```ts
{
  light: {
    clusterLabelColor: "black";
  }
  dark: {
    clusterLabelColor: "white";
  }
}
```

<!-- @doc(ts,no-required): EmbeddingViewTheme -->

## 自定义提示框

可以使用 `customTooltip` 属性更改提示框的显示方式。

首先为自定义提示框组件创建一个类：

```js
class CustomTooltip {
  constructor(target, props) {
    // 创建提示框组件并挂载到目标元素。
    // props 会包含 `tooltip` 字段，以及你指定的任何自定义属性。
  }
  update(props) {
    // 使用新 props 更新组件。
  }
  destroy() {
    // 销毁组件。
  }
}
```

然后为组件指定 `customTooltip` 属性：

```js
<EmbeddingView
  ...
  customTooltip={{
    class: CustomTooltip,
    props: { customProp: 10 } // 向提示框组件传入额外属性。
  }}
/>
```

## 自定义叠加层

可以使用 `customOverlay` 属性向嵌入视图添加叠加层。

首先为自定义叠加层创建一个类：

```js
class CustomOverlay {
  constructor(target, props) {
    // 创建叠加层组件并挂载到目标元素。
    // props 会包含 `proxy` 字段，以及你指定的任何自定义属性。
    // 可以使用 proxy.location(x, y) 获取数据点 (x, y) 的像素位置。
  }
  update(props) {
    // 使用新 props 更新组件。
  }
  destroy() {
    // 销毁组件。
  }
}
```

然后为组件指定 `customOverlay` 属性：

```js
<EmbeddingView
  ...
  customOverlay={{
    class: CustomOverlay,
    props: { customProp: 10 } // 向叠加层组件传入额外属性。
  }}
/>
```
