# 开源说明

本仓库是基于 Apple 开源项目 [Embedding Atlas](https://github.com/apple/embedding-atlas) 的二次开发版本。
原项目采用 MIT License，本仓库继续沿用 MIT License；完整许可证见 [LICENSE](LICENSE)。

## 主要改动

- 将界面、文档、示例和常用提示汉化。
- 增加本地 Parquet 可视化示例，支持已经预计算好的 `projection_x`、`projection_y` 和 `neighbors` 列。
- 增加 macOS / Linux 与 Windows PowerShell 启动脚本和停止脚本，便于在本地二次开发时快速运行。
- 修复搜索结果点击后高亮点的类型问题，使搜索结果可以正确联动嵌入视图。

## 本地 Parquet 示例

示例位于 [packages/backend/examples/local_parquet](packages/backend/examples/local_parquet/)。

该目录包含两个小型 Hugging Face 示例 parquet：

- `wine_reviews_sample.parquet`，来源：`james-burton/wine_reviews`
- `medmcqa_sample.parquet`，来源：`openlifescienceai/medmcqa`

这两个文件用于演示本地启动流程，每个文件 120 行，并包含文本列、二维投影列和最近邻列。
数据集版权和使用限制以原 Hugging Face 数据集页面为准。

## 快速启动

macOS / Linux:

```bash
packages/backend/examples/local_parquet/start_local_parquet.sh wine
```

Windows PowerShell:

```powershell
.\packages\backend\examples\local_parquet\start_local_parquet.ps1 wine
```

打开：

```text
http://127.0.0.1:5173/
```

关闭服务：

```bash
packages/backend/examples/local_parquet/stop_local_parquet.sh
```

```powershell
.\packages\backend\examples\local_parquet\stop_local_parquet.ps1
```

## 贡献与许可证

除非另有说明，本仓库中的代码沿用 MIT License。
如果提交新数据、模型权重或第三方资源，请在对应目录中说明来源、许可证和使用限制。
