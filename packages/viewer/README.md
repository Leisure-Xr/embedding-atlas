# viewer

embedding atlas 的前端应用。

构建：

```bash
npm run build
```

启动开发服务器：

```bash
npm run dev
```

这会在 http://localhost:5173 提供 Embedding Atlas UI。请注意，UI 需要后端服务器为其提供数据。你可以通过上面提到的 `./start.sh` 启动一个后端服务器。没有后端服务器时，你仍然可以访问 http://localhost:5173/#/test 查看测试数据集；http://localhost:5173/#/file 会显示文件加载器。
