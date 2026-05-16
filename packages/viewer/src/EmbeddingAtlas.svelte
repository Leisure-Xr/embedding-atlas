<!-- Copyright (c) 2025 Apple Inc. Licensed under MIT License. -->
<script lang="ts">
  import { debounce } from "@embedding-atlas/utils";
  import { Selection } from "@uwdata/mosaic-core";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { scale } from "svelte/transition";

  import LayoutOptionsView from "./layouts/LayoutOptionsView.svelte";
  import LayoutView from "./layouts/LayoutView.svelte";
  import ColumnStylePicker from "./views/ColumnStylePicker.svelte";
  import FilteredCount from "./views/FilteredCount.svelte";
  import SearchResultList from "./views/SearchResultList.svelte";
  import ActionButton from "./widgets/ActionButton.svelte";
  import Button from "./widgets/Button.svelte";
  import Input from "./widgets/Input.svelte";
  import PopupButton from "./widgets/PopupButton.svelte";
  import SegmentedControl from "./widgets/SegmentedControl.svelte";
  import Select from "./widgets/Select.svelte";
  import Spinner from "./widgets/Spinner.svelte";

  import {
    IconBraces,
    IconClose,
    IconDarkMode,
    IconDashboardLayout,
    IconDownload,
    IconExport,
    IconLightMode,
    IconListLayout,
    IconSettings,
  } from "./assets/icons.js";

  import type { EmbeddingAtlasProps, EmbeddingAtlasState } from "./api.js";
  import { ChartContextCache, type ChartContext, type ChartDelegate, type RowID } from "./charts/chart.js";
  import { type ChartThemeConfig } from "./charts/common/theme.js";
  import { defaultCharts } from "./charts/default_charts.js";
  import { EMBEDDING_ATLAS_VERSION } from "./constants.js";
  import { provideModelContext } from "./model_context/model_context.js";
  import { type ColumnStyle } from "./renderers/types.js";
  import { performSearch, querySearchResultItems, resolveSearcher, type SearchResultItem } from "./search/search.js";
  import { makeColorSchemeStore } from "./utils/color_scheme.js";
  import { columnDescriptions, predicateToString, type ColumnDesc } from "./utils/database.js";
  import { latestAsync } from "./utils/latest_async.js";

  const searchLimit = 500;

  let {
    coordinator,
    data,
    initialState,
    searcher: specifiedSearcher,
    defaultChartsConfig,
    embeddingViewConfig = null,
    embeddingViewLabels = null,
    chartTheme,
    colorScheme: colorSchemeProp,
    onExportApplication,
    onExportSelection,
    onStateChange,
    modelContext,
    cache,
  }: EmbeddingAtlasProps = $props();

  const { colorScheme, userColorScheme } = makeColorSchemeStore();

  $effect.pre(() => {
    $userColorScheme = colorSchemeProp;
  });

  let container: HTMLDivElement;

  let initialized = $state(false);

  let exportFormat: "json" | "jsonl" | "csv" | "parquet" = $state("parquet");

  const crossFilter = Selection.crossfilter();

  function currentPredicate(): string | null {
    return predicateToString(crossFilter.predicate(null));
  }

  let columns: ColumnDesc[] = $state.raw([]);

  // Column styles
  let columnStyles = $state.raw<Record<string, ColumnStyle>>({});
  let resolvedColumnStyles = writable<Record<string, ColumnStyle>>({});
  $effect.pre(() => {
    let resolved = resolveColumnStyles(columns, columnStyles);
    resolvedColumnStyles.set(resolved);
  });

  function resolveColumnStyles(
    columns: ColumnDesc[],
    styles: Record<string, ColumnStyle>,
  ): Record<string, ColumnStyle> {
    let result: Record<string, ColumnStyle> = {};
    for (let column of columns) {
      result[column.name] = {
        display: data.text == column.name ? "full" : "badge",
        ...(styles[column.name] ?? {}),
      };
    }
    return result;
  }

  // Search

  // Use a default searcher FullTextSearcher when searcher is not specified
  // svelte-ignore state_referenced_locally
  let searcher = resolveSearcher({
    coordinator,
    table: data.table,
    idColumn: data.id,
    textColumn: data.text,
    neighborsColumn: data.neighbors,
    searcher: specifiedSearcher,
  });

  let searchModes = [
    ...(searcher.fullTextSearch != null ? ["full-text"] : []),
    ...(searcher.vectorSearch != null ? ["vector"] : []),
    ...(searcher.nearestNeighbors != null ? ["neighbors"] : []),
  ];

  const searchModeOptions: Record<string, { value: string; label: string }> = {
    "full-text": { value: "full-text", label: "全文" },
    vector: { value: "vector", label: "向量" },
    neighbors: { value: "neighbors", label: "近邻" },
  };

  let searchMode = $state<"full-text" | "vector">("full-text");

  let searchQuery = $state("");
  let searcherStatus = $state("");
  let searchResultVisible = $state(false);
  let searchResultStore = writable<{
    query: any;
    mode: string;
    ids: RowID[];
    label: string;
    highlight: string;
    items: SearchResultItem[];
  } | null>(null);

  const doSearch = latestAsync(
    async (query: any, mode: string) => {
      searchResultVisible = true;

      let predicate = currentPredicate();
      let searcherResult = await performSearch({
        searcher: searcher,
        predicate: predicate,
        query: query,
        mode: mode,
        limit: searchLimit,
        onStatus: (status) => {
          searcherStatus = status;
        },
      });

      // Apply predicate in case the searcher does not handle predicate.
      // And convert the search result ids to tuples.
      let result = await querySearchResultItems(
        coordinator,
        data.table,
        { id: data.id, x: data.projection?.x, y: data.projection?.y, text: data.text },
        Object.fromEntries(columns.map((c) => [c.name, c.name])),
        predicate,
        searcherResult,
      );

      let label = query.toString().trim();
      let highlight = query.toString().trim();

      if (mode == "neighbors") {
        label = "#" + query.toString() + " 的近邻";
        highlight = "";
      }

      searcherStatus = "";

      return {
        query: query,
        mode: mode,
        ids: result.map((x) => x.id),
        label: label,
        highlight: highlight,
        items: result,
      };
    },
    (result) => {
      searchResultStore.set(result);
    },
  );

  const debouncedSearch = debounce(doSearch, 500);

  function clearSearch() {
    searchResultStore.set(null);
    searchResultVisible = false;
  }

  $effect.pre(() => {
    if (searchQuery == "") {
      clearSearch();
    } else {
      debouncedSearch(searchQuery, searchMode);
    }
  });

  // Filter

  function resetFilter() {
    for (let item of crossFilter.clauses) {
      let source = item.source;
      source?.reset?.();
      crossFilter.update({ ...item, value: null, predicate: null });
    }
  }

  function loadState(state: EmbeddingAtlasState) {
    charts = state.charts ?? {};
    chartStates = state.chartStates ?? {};
    layout = state.layout ?? "list";
    layoutStates = state.layoutStates ?? {};
    columnStyles = state.columnStyles ?? {};
  }

  function getCurrentState(): EmbeddingAtlasState {
    return {
      version: EMBEDDING_ATLAS_VERSION,
      timestamp: new Date().getTime() / 1000,
      charts: charts,
      chartStates: chartStates,
      layout: layout,
      layoutStates: layoutStates,
      columnStyles: columnStyles,
      predicate: currentPredicate(),
    };
  }

  // Emit onStateChange event.
  $effect(() => {
    if (!initialized) {
      return;
    }
    onStateChange?.(getCurrentState());
  });

  onMount(async () => {
    columns = (await columnDescriptions(coordinator, data.table)).filter((x) => !x.name.startsWith("__"));
    chartContext.columns = columns;

    if (initialState) {
      loadState(initialState);
    }
    if (Object.keys(charts).length == 0) {
      let newCharts = await defaultCharts({
        coordinator,
        table: data.table,
        id: data.id,
        projection: data.projection
          ? {
              ...data.projection,
              text: data.text ?? undefined,
              image: data.image ?? undefined,
              importance: data.importance ?? undefined,
            }
          : undefined,
        config: defaultChartsConfig ?? undefined,
      });
      charts = Object.fromEntries(newCharts.map((spec, i) => [`${i + 1}`, spec]));
    }

    initialized = true;
  });

  function onWindowKeydown(e: KeyboardEvent) {
    if (e.key == "Escape") {
      resetFilter();
      e.preventDefault();
      try {
        let active: any = document.activeElement;
        active?.blur?.();
      } catch (e) {}
    }
  }

  // svelte-ignore state_referenced_locally
  let chartThemeStore = writable<ChartThemeConfig | undefined>(chartTheme ?? undefined);

  $effect.pre(() => {
    chartThemeStore.set(chartTheme ?? undefined);
  });

  // svelte-ignore state_referenced_locally
  let chartContext: ChartContext = {
    coordinator: coordinator,
    filter: crossFilter,
    table: data.table,
    id: data.id,
    columns: [],
    colorScheme: colorScheme,
    theme: chartThemeStore,
    columnStyles: resolvedColumnStyles,
    cache: new ChartContextCache(),
    persistentCache: cache ?? { get: async () => null, set: async (key, value) => {} },
    searchModes: searchModes,
    search: doSearch,
    searchResult: searchResultStore,
    highlight: writable(null),
    embeddingViewConfig: embeddingViewConfig,
    embeddingViewLabels: embeddingViewLabels,
  };

  let charts = $state.raw<Record<string, any>>({});
  let chartStates = $state.raw<Record<string, any>>({});
  let layout = $state.raw<string>("list");
  let layoutStates = $state.raw<Record<string, any>>({});

  let chartDelegates = new Map<string, Set<ChartDelegate>>();

  function registerChartDelegate(id: string, delegate: ChartDelegate): () => void {
    if (!chartDelegates.has(id)) {
      chartDelegates.set(id, new Set());
    }
    chartDelegates.get(id)!.add(delegate);
    return () => {
      chartDelegates.get(id)?.delete(delegate);
    };
  }

  let mcpStatus = $state.raw<string | undefined>(undefined);

  onMount(() => {
    if (modelContext) {
      provideModelContext(modelContext, {
        context: chartContext,
        set charts(x) {
          charts = x;
        },
        get charts() {
          return charts;
        },
        set chartStates(x) {
          chartStates = x;
        },
        get chartStates() {
          return chartStates;
        },
        set layout(x) {
          layout = x;
        },
        get layout() {
          return layout;
        },
        set layoutStates(x) {
          layoutStates = x;
        },
        get layoutStates() {
          return layoutStates;
        },
        get chartDelegates() {
          return chartDelegates;
        },
        get container() {
          return container;
        },
        get columnStyles() {
          return columnStyles;
        },
        set columnStyles(x) {
          columnStyles = x;
        },
      });

      $effect(() => {
        let subs = modelContext.connectionStatus?.subscribe((value) => {
          mcpStatus = value;
        });
        return () => {
          subs?.();
        };
      });
    }
  });

  async function onCopyState() {
    let text = JSON.stringify(getCurrentState());
    await navigator.clipboard.writeText(text);
  }
</script>

<div class="embedding-atlas-root" style:width="100%" style:height="100%" bind:this={container}>
  <div
    class="w-full h-full flex flex-col text-slate-800 bg-slate-200 dark:text-slate-200 dark:bg-slate-800"
    class:dark={$colorScheme == "dark"}
    style:color-scheme={$colorScheme}
  >
    <!-- Toolbar -->
    <div class="m-2 flex flex-row items-center gap-2 flex-wrap">
      {#if initialized}
        <!-- Left side -->
        <div class="flex flex-row flex-1 justify-between min-w-[180px]">
          {#if searchMode.length > 0}
            <div class="relative w-full">
              <Input type="search" placeholder="搜索..." className="w-full max-w-[400px] " bind:value={searchQuery} />
              {#if searchModes.filter((x) => x != "neighbors").length > 1}
                <Select
                  options={searchModes.filter((x) => x != "neighbors").map((x) => searchModeOptions[x])}
                  value={searchMode}
                  onChange={(v) => (searchMode = v)}
                />
              {/if}

              {#if searchResultVisible}
                <div
                  class="absolute w-96 left-0 top-[32px] rounded-md right-0 z-20 border border-slate-300 dark:border-slate-600 overflow-hidden resize shadow-lg bg-white/75 dark:bg-slate-800/75 backdrop-blur-sm"
                  style:height="48em"
                >
                  {#if $searchResultStore != null}
                    {@const searchResult = $searchResultStore}
                    {#key searchResult}
                      <SearchResultList
                        items={searchResult.items}
                        label={searchResult.label}
                        highlight={searchResult.highlight}
                        limit={searchLimit}
                        onClick={async (item) => {
                          chartContext.highlight.set([item.id]);
                        }}
                        onClose={clearSearch}
                        columnStyles={$resolvedColumnStyles}
                      />
                    {/key}
                  {:else if searcherStatus != null}
                    <div class="p-2">
                      <Spinner status={searcherStatus} />
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          {:else}
            <div class="text-slate-500 dark:text-slate-400">Embedding Atlas</div>
          {/if}
        </div>
        <!-- Right side -->
        <div
          class="flex flex-none gap-2 items-center pl-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
        >
          <FilteredCount coordinator={coordinator} filter={crossFilter} table={data.table} />
          <div class="flex flex-row items-center">
            <button
              title="清除筛选"
              onclick={resetFilter}
              class="rounded-md flex select-none items-center p-1.5 text-slate-400 dark:text-slate-500 focus-visible:outline-2 outline-blue-600 -outline-offset-1"
            >
              <IconClose class="w-5 h-5" />
            </button>

            {#if onExportSelection}
              <PopupButton title="导出选中项">
                {#snippet button({ visible, toggle })}
                  <button
                    title="导出选中项"
                    onclick={toggle}
                    class="rounded-md px-1.5 py-1.5 flex select-none items-center focus-visible:outline-2 outline-blue-600 -outline-offset-1"
                    class:text-slate-400={!visible}
                    class:dark:text-slate-500={!visible}
                  >
                    <IconExport class="w-5 h-5" />
                  </button>
                {/snippet}
                <div class="min-w-[420px] flex flex-col gap-2">
                  <div class="flex flex-row gap-2">
                    <ActionButton
                      icon={IconExport}
                      label="导出选中项"
                      title="导出当前选中的点"
                      class="w-48"
                      onClick={() => onExportSelection(currentPredicate(), exportFormat)}
                    />
                    <Select
                      label="格式"
                      value={exportFormat}
                      onChange={(v) => (exportFormat = v)}
                      options={[
                        { value: "parquet", label: "Parquet" },
                        { value: "jsonl", label: "JSONL" },
                        { value: "json", label: "JSON" },
                        { value: "csv", label: "CSV" },
                      ]}
                    />
                  </div>
                </div>
              </PopupButton>
            {/if}
          </div>
        </div>
        <div class="flex flex-none flex-row gap-2">
          <div class="grid grid-cols-1 grid-rows-1 justify-items-end items-center">
            {#key layout}
              <div transition:scale class="col-start-1 row-start-1">
                <LayoutOptionsView
                  context={chartContext}
                  charts={charts}
                  chartStates={chartStates}
                  layout={layout}
                  layoutStates={layoutStates}
                  onChartsChange={(v) => (charts = v)}
                  onChartStatesChange={(v) => (chartStates = v)}
                  onLayoutStatesChange={(v) => (layoutStates = v)}
                />
              </div>
            {/key}
          </div>
          <SegmentedControl
            value={layout}
            onChange={(v) => (layout = v)}
            options={[
              { value: "list", icon: IconListLayout, title: "列表布局" },
              { value: "dashboard", icon: IconDashboardLayout, title: "仪表板布局" },
            ]}
          />
          {#if colorSchemeProp == null}
            <Button
              icon={$colorScheme == "dark" ? IconLightMode : IconDarkMode}
              title="切换浅色/深色模式"
              onClick={() => {
                $userColorScheme = $colorScheme == "light" ? "dark" : "light";
              }}
            />
          {/if}
          <PopupButton icon={IconSettings} title="选项">
            <div class="min-w-[420px] flex flex-col gap-2">
              <!-- Text style settings -->
              {#if columns.length > 0}
                <h4 class="text-slate-500 dark:text-slate-400 select-none">列样式</h4>
                <ColumnStylePicker
                  columns={columns}
                  styles={$resolvedColumnStyles}
                  onStylesChange={(value) => {
                    columnStyles = value;
                  }}
                />
              {/if}
              <!-- Export -->
              <h4 class="text-slate-500 dark:text-slate-400 select-none">导出</h4>
              <div class="flex flex-col gap-2">
                <ActionButton
                  icon={IconBraces}
                  label="复制状态"
                  title="将当前 Embedding Atlas 状态以 JSON 复制到剪贴板。"
                  class="w-48"
                  onClick={onCopyState}
                />
              </div>
              {#if onExportApplication}
                <div class="flex flex-col gap-2">
                  <ActionButton
                    icon={IconDownload}
                    label="导出应用"
                    title="下载自包含的静态 Web 应用"
                    class="w-48"
                    onClick={onExportApplication}
                  />
                </div>
              {/if}
              {#if mcpStatus}
                <h4 class="text-slate-500 dark:text-slate-400 select-none">MCP (Model Context Protocol)</h4>
                <div class="flex flex-none gap-2 select-none items-center">
                  {#if mcpStatus == "connecting"}
                    <div class="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
                    连接中...
                  {:else if mcpStatus == "connected"}
                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                    已连接
                  {:else if mcpStatus == "closed" || mcpStatus == "error"}
                    <div class="w-3 h-3 rounded-full bg-red-500"></div>
                    出错或服务器已关闭连接
                  {/if}
                </div>
              {/if}
              <h4 class="text-slate-500 dark:text-slate-400 select-none">关于</h4>
              <div>Embedding Atlas, {EMBEDDING_ATLAS_VERSION}</div>
            </div>
          </PopupButton>
        </div>
      {/if}
    </div>
    <!-- Main Content -->
    <div class="flex-1 overflow-hidden h-full ml-2 mr-2 mb-2">
      {#if initialized}
        <LayoutView
          context={chartContext}
          layout={layout}
          layoutStates={layoutStates}
          charts={charts}
          chartStates={chartStates}
          onChartsChange={(v) => (charts = v)}
          onChartStatesChange={(v) => (chartStates = v)}
          onLayoutStatesChange={(v) => (layoutStates = v)}
          registerChartDelegate={registerChartDelegate}
        />
      {/if}
    </div>
  </div>
</div>
<svelte:window onkeydown={onWindowKeydown} />
