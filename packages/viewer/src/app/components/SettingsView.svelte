<!-- Copyright (c) 2025 Apple Inc. Licensed under MIT License. -->
<script lang="ts">
  import type { UMAPOptions } from "@embedding-atlas/umap-wasm";
  import { untrack } from "svelte";

  import Button from "../../widgets/Button.svelte";
  import CheckBox from "../../widgets/CheckBox.svelte";
  import ComboBox from "../../widgets/ComboBox.svelte";
  import NumberInput from "../../widgets/NumberInput.svelte";
  import SegmentedControl from "../../widgets/SegmentedControl.svelte";
  import Select from "../../widgets/Select.svelte";

  import { EMBEDDING_ATLAS_VERSION } from "../../constants.js";
  import { jsTypeFromDBType } from "../../utils/database.js";

  // Predefined embedding models. The default is the first model.
  const textModels = [
    "Xenova/all-MiniLM-L6-v2",
    "Xenova/paraphrase-multilingual-mpnet-base-v2",
    "Xenova/multilingual-e5-small",
    "Xenova/multilingual-e5-base",
    "Xenova/multilingual-e5-large",
  ];
  const imageModels = [
    "Xenova/dinov2-small",
    "Xenova/dinov2-base",
    "Xenova/dinov2-large",
    "Xenova/dino-vitb8",
    "Xenova/dino-vits8",
    "Xenova/dino-vitb16",
    "Xenova/dino-vits16",
  ];

  export interface Settings {
    version: string;
    text?: string;
    embedding?:
      | {
          precomputed: { x: string; y: string; neighbors?: string };
        }
      | {
          compute: {
            column: string;
            type: "text" | "image";
            model: string;
            umapOptions?: UMAPOptions;
          };
        };
  }

  interface Props {
    columns: { column_name: string; column_type: string }[];
    onConfirm: (value: Settings) => void;
  }

  let { columns, onConfirm }: Props = $props();

  let embeddingMode = $state<"precomputed" | "from-text" | "from-image" | "none">("precomputed");

  let textColumn: string | undefined = $state(undefined);

  let embeddingXColumn: string | undefined = $state(undefined);
  let embeddingYColumn: string | undefined = $state(undefined);
  let embeddingNeighborsColumn: string | undefined = $state(undefined);
  let embeddingTextColumn: string | undefined = $state(undefined);
  let embeddingTextModel: string | undefined = $state(undefined);
  let embeddingImageColumn: string | undefined = $state(undefined);
  let embeddingImageModel: string | undefined = $state(undefined);

  let showUmapOptions = $state(false);
  let umapMinDist = $state(0.1);
  let umapNNeighbors = $state(15);
  let umapGpu = $state(true);

  let numericalColumns = $derived(columns.filter((x) => jsTypeFromDBType(x.column_type) == "number"));
  let stringColumns = $derived(columns.filter((x) => jsTypeFromDBType(x.column_type) == "string"));

  $effect.pre(() => {
    let c = textColumn;
    if (untrack(() => embeddingTextColumn == undefined)) {
      embeddingTextColumn = c;
    }
  });

  function confirm() {
    let value: Settings = { version: EMBEDDING_ATLAS_VERSION, text: textColumn };
    if (embeddingMode == "precomputed" && embeddingXColumn != undefined && embeddingYColumn != undefined) {
      value.embedding = {
        precomputed: {
          x: embeddingXColumn,
          y: embeddingYColumn,
          neighbors: embeddingNeighborsColumn != undefined ? embeddingNeighborsColumn : undefined,
        },
      };
    }
    if (embeddingMode == "from-text" && embeddingTextColumn != undefined) {
      let model = embeddingTextModel?.trim() ?? "";
      if (model == undefined || model == "") {
        model = textModels[0];
      }
      let umapOptions = showUmapOptions
        ? { minDist: umapMinDist, nNeighbors: umapNNeighbors, gpu: umapGpu }
        : undefined;
      value.embedding = { compute: { column: embeddingTextColumn, type: "text", model: model, umapOptions } };
    }
    if (embeddingMode == "from-image" && embeddingImageColumn != undefined) {
      let model = embeddingImageModel?.trim() ?? "";
      if (model == undefined || model == "") {
        model = imageModels[0];
      }
      let umapOptions = showUmapOptions
        ? { minDist: umapMinDist, nNeighbors: umapNNeighbors, gpu: umapGpu }
        : undefined;
      value.embedding = { compute: { column: embeddingImageColumn, type: "image", model: model, umapOptions } };
    }
    onConfirm?.(value);
  }
</script>

<div
  class="flex flex-col p-4 w-[40rem] border rounded-md bg-slate-50 border-slate-300 dark:bg-slate-900 dark:border-slate-700"
>
  <div class="flex flex-col gap-2 pb-4">
    <!-- Text column -->
    <h2 class="text-slate-500 dark:text-slate-500">搜索和提示框（可选）</h2>
    <p class="text-sm text-slate-400 dark:text-slate-600">
      如果选择了列，该列将用于全文搜索和提示框。请选择包含自由文本的列，例如描述、聊天消息或摘要。
    </p>
    <div class="w-full flex flex-row items-center">
      <div class="w-[6rem] dark:text-slate-400">文本</div>
      <Select
        class="flex-1 min-w-0"
        value={textColumn}
        onChange={(v) => (textColumn = v)}
        options={[
          { value: undefined, label: "（无）" },
          ...stringColumns.map((x) => ({ value: x.column_name, label: `${x.column_name} (${x.column_type})` })),
        ]}
      />
    </div>
    <div class="my-2"></div>
    <!-- Embedding Config -->
    <h2 class="text-slate-500 dark:text-slate-500">嵌入视图（可选）</h2>
    <p class="text-sm text-slate-400 dark:text-slate-600">
      要启用嵌入视图，可以选择一对预计算的 X/Y 列，也可以选择文本列并在浏览器中计算嵌入投影。对于大数据集，建议提前计算嵌入和二维投影。
    </p>
    <div class="flex items-start">
      <SegmentedControl
        value={embeddingMode}
        onChange={(v) => (embeddingMode = v as any)}
        options={[
          { value: "precomputed", label: "预计算" },
          { value: "from-text", label: "从文本计算" },
          { value: "from-image", label: "从图片计算" },
          { value: "none", label: "无" },
        ]}
      />
    </div>
    {#if embeddingMode == "precomputed"}
      <div class="w-full flex flex-row items-center">
        <div class="w-[6rem] dark:text-slate-400">X</div>
        <Select
          class="flex-1 min-w-0"
          value={embeddingXColumn}
          onChange={(v) => (embeddingXColumn = v)}
          options={[
            { value: undefined, label: "（无）" },
            ...numericalColumns.map((x) => ({ value: x.column_name, label: `${x.column_name} (${x.column_type})` })),
          ]}
        />
      </div>
      <div class="w-full flex flex-row items-center">
        <div class="w-[6rem] dark:text-slate-400">Y</div>
        <Select
          class="flex-1 min-w-0"
          value={embeddingYColumn}
          onChange={(v) => (embeddingYColumn = v)}
          options={[
            { value: undefined, label: "（无）" },
            ...numericalColumns.map((x) => ({ value: x.column_name, label: `${x.column_name} (${x.column_type})` })),
          ]}
        />
      </div>
      <div class="w-full flex flex-row items-center">
        <div class="w-[6rem] dark:text-slate-400">近邻</div>
        <Select
          class="flex-1 min-w-0"
          value={embeddingNeighborsColumn}
          onChange={(v) => (embeddingNeighborsColumn = v)}
          options={[
            { value: undefined, label: "（无）" },
            ...columns.map((x) => ({ value: x.column_name, label: `${x.column_name} (${x.column_type})` })),
          ]}
        />
      </div>
      <p class="text-sm text-slate-400 dark:text-slate-600">
        近邻列应包含预计算的最近邻，格式为：<code
          >{`{ "ids": [n1, n2, ...], "distances": [d1, d2, ...] }`}</code
        >。ID 应为从 0 开始的行索引。
      </p>
    {:else if embeddingMode == "from-text"}
      <div class="w-full flex flex-row items-center">
        <div class="w-[6rem] dark:text-slate-400">文本</div>
        <Select
          class="flex-1 min-w-0"
          value={embeddingTextColumn}
          onChange={(v) => (embeddingTextColumn = v)}
          options={[
            { value: undefined, label: "（无）" },
            ...stringColumns.map((x) => ({ value: x.column_name, label: `${x.column_name} (${x.column_type})` })),
          ]}
        />
      </div>
      <div class="w-full flex flex-row items-center">
        <div class="w-[6rem] dark:text-slate-400">模型</div>
        <ComboBox
          className="flex-1"
          value={embeddingTextModel}
          placeholder="（默认 {textModels[0]}）"
          onChange={(v) => (embeddingTextModel = v)}
          options={textModels}
        />
      </div>
      <p class="text-sm text-slate-400 dark:text-slate-600">
        在浏览器中计算嵌入和二维投影可能需要一些时间。模型将通过 Transformers.js 加载。
      </p>
    {:else if embeddingMode == "from-image"}
      <div class="w-full flex flex-row items-center">
        <div class="w-[6rem] dark:text-slate-400">图片</div>
        <Select
          class="flex-1 min-w-0"
          value={embeddingImageColumn}
          onChange={(v) => (embeddingImageColumn = v)}
          options={[
            { value: undefined, label: "（无）" },
            ...columns.map((x) => ({ value: x.column_name, label: `${x.column_name} (${x.column_type})` })),
          ]}
        />
      </div>
      <div class="w-full flex flex-row items-center">
        <div class="w-[6rem] dark:text-slate-400">模型</div>
        <ComboBox
          className="flex-1"
          value={embeddingImageModel}
          placeholder="（默认 {imageModels[0]}）"
          onChange={(v) => (embeddingImageModel = v)}
          options={imageModels}
        />
      </div>
      <p class="text-sm text-slate-400 dark:text-slate-600">
        在浏览器中计算嵌入和二维投影可能需要一些时间。模型将通过 Transformers.js 加载。
      </p>
    {/if}
    {#if embeddingMode == "from-text" || embeddingMode == "from-image"}
      <button
        class="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 select-none mt-1"
        onclick={() => (showUmapOptions = !showUmapOptions)}
      >
        <span class="text-[10px]">{showUmapOptions ? "\u25BC" : "\u25B6"}</span>
        UMAP 选项
      </button>
      {#if showUmapOptions}
        <div class="w-full flex flex-row items-center">
          <div class="w-[6rem] dark:text-slate-400">最小距离</div>
          <NumberInput className="flex-1 min-w-0" bind:value={umapMinDist} min={0} max={1} step={0.01} />
        </div>
        <div class="w-full flex flex-row items-center">
          <div class="w-[6rem] dark:text-slate-400">近邻数</div>
          <NumberInput className="flex-1 min-w-0" bind:value={umapNNeighbors} min={2} max={200} step={1} />
        </div>
        <div class="w-full flex flex-row items-center">
          <div class="w-[6rem] dark:text-slate-400">GPU</div>
          <CheckBox bind:checked={umapGpu} label="可用时使用 WebGPU" />
        </div>
      {/if}
    {/if}
  </div>
  <div class="w-full flex flex-row items-center mt-4">
    <div class="flex-1"></div>
    <Button
      label="确认"
      class="w-40 justify-center"
      onClick={() => {
        confirm();
      }}
    />
  </div>
</div>
