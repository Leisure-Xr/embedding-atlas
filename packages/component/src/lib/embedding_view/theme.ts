// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

export interface EmbeddingViewTheme {
  /** 文本使用的字体族。 */
  fontFamily: string;
  /** 聚类标签颜色。 */
  clusterLabelColor: string;
  /** 聚类标签描边颜色。 */
  clusterLabelOutlineColor: string;
  /** 聚类标签透明度。 */
  clusterLabelOpacity: number;
  /** 是否显示底部状态栏。 */
  statusBar: boolean;
  /** 状态栏文本颜色。 */
  statusBarTextColor: string;
  /** 状态栏背景颜色。 */
  statusBarBackgroundColor: string;
  /** 品牌链接。 */
  brandingLink: { text: string; href: string } | null;
}

export type ThemeConfig = Partial<EmbeddingViewTheme> & {
  /** 深色模式覆盖项。 */
  dark?: Partial<EmbeddingViewTheme>;
  /** 浅色模式覆盖项。 */
  light?: Partial<EmbeddingViewTheme>;
};

const defaultThemeConfig: { light: EmbeddingViewTheme; dark: EmbeddingViewTheme } = {
  light: {
    fontFamily: "system-ui,sans-serif",
    clusterLabelColor: "#000",
    clusterLabelOutlineColor: "rgba(255,255,255,0.8)",
    clusterLabelOpacity: 0.8,
    statusBar: true,
    statusBarTextColor: "#525252",
    statusBarBackgroundColor: "rgba(255,255,255,0.9)",
    brandingLink: { text: "Embedding Atlas", href: "https://apple.github.io/embedding-atlas" },
  },
  dark: {
    fontFamily: "system-ui,sans-serif",
    clusterLabelColor: "#ccc",
    clusterLabelOutlineColor: "rgba(0,0,0,0.8)",
    clusterLabelOpacity: 0.8,
    statusBar: true,
    statusBarTextColor: "#d9d9d9",
    statusBarBackgroundColor: "rgba(0,0,0,0.9)",
    brandingLink: { text: "Embedding Atlas", href: "https://apple.github.io/embedding-atlas" },
  },
};

export function resolveTheme(theme: ThemeConfig | null, colorScheme: "light" | "dark"): EmbeddingViewTheme {
  if (theme == null) {
    return defaultThemeConfig[colorScheme];
  } else {
    return { ...defaultThemeConfig[colorScheme], ...theme, ...(theme[colorScheme] != null ? theme[colorScheme] : {}) };
  }
}
