# 棋研 / QiyanChess

[English](README.md) · [下载 Windows 版](https://github.com/liugedragon/qiyan-chess/releases/latest) · [反馈问题](https://github.com/liugedragon/qiyan-chess/issues)

棋研是一款国际象棋对战与复盘桌面应用。使用附带的 Stockfish 19 下棋，导入 PGN，查看局面、推荐走法和评估变化。

本项目派生自 [En Croissant](https://github.com/franciscoBSalgueiro/en-croissant)，沿用其棋盘、PGN、引擎分析、棋谱数据库和开局训练工具。棋研增加了中文首页快捷入口、附带引擎注册，以及棋盘、棋谱和报告共用的细化走法评级。

## 下载与启动

1. 从 [Releases](https://github.com/liugedragon/qiyan-chess/releases/latest) 下载 Windows x64 便携版 ZIP。
2. 将整个压缩包解压到可写文件夹。
3. 双击 `QiyanChess.exe`。

请保留完整目录。引擎、数据库扩展、DLL、音效和图像识别资源都是运行文件，不能只复制 EXE。系统需要 Microsoft Edge WebView2 Runtime。

使用附带引擎进行本地对弈和复盘不需要账号或 API 密钥。在线服务和额外资源下载需要网络。

## 对弈与复盘

- **人机对战：**首页点击「人机对战」。默认不限时、Stockfish Skill Level 5、每步思考 500 毫秒，可在对局设置调整。
- **本地双人：**首页点击「本地双人」，两人在同一台电脑轮流走棋。
- **复盘：**导入 PGN，或对局结束后点击「复盘分析」。使用 Stockfish 生成报告，再点击棋谱或评估曲线查看局面与推荐走法。
- **保存棋谱：**通过文件菜单保存或导出 PGN。仓库附有一份[合成示例棋谱](examples/评级示例.pgn)，可用来试用报告。

走法评级依据引擎结果和启发式规则，增加分析时间可能改变评级。这里的分类与准确率不是 Chess.com 使用的同一套评级模型。

## 数据与更新

设置中可自定义棋谱、引擎、数据库和习题目录。应用数据使用独立的 `local.qiyan.chess` 标识；PGN 的默认文档文件夹仍保留上游的 `EnCroissant` 名称，迁移旧棋谱时请检查目录设置。

本发行版已停用使用统计。更新菜单会打开本仓库 Releases 页面，供手动下载。替换旧版程序文件夹前，请备份自己的 PGN 和数据库。

## 文档

- [Windows 构建说明](docs/BUILDING.zh-CN.md)
- [架构与上游关系](docs/LOCAL-FORK.zh-CN.md)
- [验证记录](docs/VERIFICATION.md)
- [贡献说明](CONTRIBUTING.md)
- [第三方声明](THIRD-PARTY-NOTICES.md)

当前发行包面向 Windows x64，尚不包含远程对战房间或手机安装包。

## 许可与来源

应用源码采用 [GPL-3.0-only](LICENSE)，保留上游历史和作者归属。Stockfish 等组件分别保留其许可证。ChessQ 模型权重单独采用 **PolyForm Noncommercial 1.0.0**，DINOv2 相关材料采用 Apache 2.0。完整组件许可及对应源码见[第三方声明](THIRD-PARTY-NOTICES.md)。
