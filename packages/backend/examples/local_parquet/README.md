# 本地 Parquet 可视化示例

这个示例演示如何用已经包含二维投影和最近邻数据的本地 `.parquet` 文件启动 Embedding Atlas。
它适合在二次开发 Embedding Atlas 时测试当前仓库源码，而不是测试已经通过 `pip install` 安装到 Python 环境里的旧版本。

## 示例数据

本目录包含两个已生成好的 Hugging Face 小样本，每个文件 120 行，并且已经包含：

- 文本列
- `projection_x`
- `projection_y`
- `neighbors`

`neighbors` 列的格式为：

```json
{"ids": [0, 12, 34], "distances": [0.0, 0.23, 0.31]}
```

| 文件 | 数据来源 | 文本列 | 常用类别列 |
| --- | --- | --- | --- |
| `wine_reviews_sample.parquet` | Hugging Face: `james-burton/wine_reviews` | `description` | `country`, `province`, `points` |
| `medmcqa_sample.parquet` | Hugging Face: `openlifescienceai/medmcqa` | `question` | `subject_name`, `topic_name`, `choice_type` |

## 前置条件

### 基础环境（必需）

| 工具 | macOS | Windows |
| --- | --- | --- |
| Node.js + npm | `brew install node` 或从 https://nodejs.org/ 下载 | 从 https://nodejs.org/ 下载安装 |
| uv | `brew install uv` 或 `curl -LsSf https://astral.sh/uv/install.sh \| sh` | `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 \| iex"` |

安装 JS 依赖（在仓库根目录运行）：

```bash
npm install
```

仓库已包含预构建的 WASM 文件，安装依赖后即可直接运行示例。

### Rust 工具链（可选，仅修改 Rust/WASM 源码时需要）

如果需要修改 `packages/umap` 或 `packages/density-clustering` 中的 Rust 代码，需要安装 Rust 工具链来重新编译 WASM：

macOS / Linux：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown
cargo install -f wasm-bindgen-cli --version 0.2.114
```

Windows（先从 https://www.rust-lang.org/tools/install 下载并运行 rustup-init.exe）：

```powershell
rustup target add wasm32-unknown-unknown
cargo install -f wasm-bindgen-cli --version 0.2.114
```

修改 Rust 代码后，在仓库根目录运行：

```bash
npm run build
```

## 一键启动脚本

macOS / Linux:

```bash
packages/backend/examples/local_parquet/start_local_parquet.sh wine
packages/backend/examples/local_parquet/start_local_parquet.sh medmcqa
```

Windows PowerShell:

```powershell
.\packages\backend\examples\local_parquet\start_local_parquet.ps1 wine
.\packages\backend\examples\local_parquet\start_local_parquet.ps1 medmcqa
```


启动自己的 parquet：

```bash
packages/backend/examples/local_parquet/start_local_parquet.sh /path/to/data.parquet \
  --text text \
  --x projection_x \
  --y projection_y \
  --neighbors neighbors
```

```powershell
.\packages\backend\examples\local_parquet\start_local_parquet.ps1 C:\path\to\data.parquet `
  -Text text `
  -X projection_x `
  -Y projection_y `
  -Neighbors neighbors
```

如果你的列名不同，把这些参数改成自己的列名。例如：

```bash
packages/backend/examples/local_parquet/start_local_parquet.sh /path/to/data.parquet \
  --text content \
  --x x \
  --y y \
  --neighbors nearest_neighbors
```

```powershell
.\packages\backend\examples\local_parquet\start_local_parquet.ps1 C:\path\to\data.parquet `
  -Text content `
  -X x `
  -Y y `
  -Neighbors nearest_neighbors
```

脚本会同时启动 backend 和本地 viewer。打开：

```text
http://127.0.0.1:5173/
```

### 端口

默认会占用两个本地端口：

- `5055`：backend 数据服务，viewer dev 模式会固定读取 `http://localhost:5055/data/`。
- `5173`：viewer 前端开发服务器。

因此 backend 端口在脚本中固定为 `5055`。如果 `5173` 已被占用，可以改 viewer 端口：

```bash
packages/backend/examples/local_parquet/start_local_parquet.sh wine --frontend-port 5174
```

```powershell
.\packages\backend\examples\local_parquet\start_local_parquet.ps1 wine -FrontendPort 5174
```

如果 `5055` 已被占用，需要先停止占用该端口的旧 backend，或关闭之前启动的示例。

### 关闭服务

如果脚本还在当前终端运行，按 `Ctrl+C` 即可停止 viewer，并自动停止由脚本启动的 backend。

如果终端已经关闭，或者你想主动清理默认端口上的进程：

macOS / Linux:

```bash
packages/backend/examples/local_parquet/stop_local_parquet.sh
```

Windows PowerShell:

```powershell
.\packages\backend\examples\local_parquet\stop_local_parquet.ps1
```

也可以指定端口：

```bash
packages/backend/examples/local_parquet/stop_local_parquet.sh 5055 5173
```

```powershell
.\packages\backend\examples\local_parquet\stop_local_parquet.ps1 -Ports 5055,5173
```

## 启动 Wine Reviews

在终端 1 启动 backend：

```bash
cd packages/backend

uv run embedding-atlas examples/local_parquet/wine_reviews_sample.parquet \
  --text description \
  --x projection_x \
  --y projection_y \
  --neighbors neighbors \
  --disable-projection \
  --cors \
  --host 127.0.0.1 \
  --port 5055 \
  --static ../viewer
```

在终端 2 启动本地 viewer：

```bash
npm run dev -w @embedding-atlas/viewer -- --host 127.0.0.1 --port 5173
```

打开：

```text
http://127.0.0.1:5173/
```

## 启动 MedMCQA

在终端 1 启动 backend：

```bash
cd packages/backend

uv run embedding-atlas examples/local_parquet/medmcqa_sample.parquet \
  --text question \
  --x projection_x \
  --y projection_y \
  --neighbors neighbors \
  --disable-projection \
  --cors \
  --host 127.0.0.1 \
  --port 5055 \
  --static ../viewer
```

在终端 2 启动本地 viewer：

```bash
npm run dev -w @embedding-atlas/viewer -- --host 127.0.0.1 --port 5173
```

打开：

```text
http://127.0.0.1:5173/
```

## 参数说明

- `--text` 指定搜索和提示框使用的文本列。
- `--x` 和 `--y` 指定已经预计算好的二维坐标列。
- `--neighbors` 指定已经预计算好的最近邻列。
- `--disable-projection` 表示直接使用 parquet 里的投影结果，不重新计算 embedding 或 UMAP。
- `--cors` 允许本地 viewer dev server 访问 backend。
- `--static ../viewer` 只给 backend 一个存在的静态目录；二次开发时主要通过 `npm run dev -w @embedding-atlas/viewer` 查看最新前端源码。

## 已验证

这两个文件都已用上面的 backend 参数验证过：

- `/data/metadata.json` 能返回正确的 `text`、`projection_x`、`projection_y` 和 `neighbors` 配置。
- `/data/query` 查询 `SELECT count(*) AS n FROM dataset` 返回 `120`。
