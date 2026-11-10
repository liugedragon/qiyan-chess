# 架构与上游关系

[English](LOCAL-FORK.md) · [README](../README.zh-CN.md)

棋研派生自 [En Croissant](https://github.com/franciscoBSalgueiro/en-croissant)，以提交 `499c447876f8d258b927959d84fae33224599289` 为基础，保留原 Git 历史、作者和 GPL 许可证。

## 模块

| 范围 | 实现 |
| --- | --- |
| 桌面外壳和原生命令 | `src-tauri/` 中的 Tauri、Rust |
| 棋盘、对局和分析界面 | `src/` 中的 React、TypeScript，沿用并扩展 En Croissant |
| 棋规和记谱 | `chessops` 及上游棋谱状态实现 |
| 引擎分析 | UCI 集成，Windows 包附带 Stockfish 19 |
| 棋谱数据库 | DuckDB 与 Aix 国际象棋扩展 |
| 细化走法评级 | `src/utils/move-review.ts`，由棋盘、棋谱和报告共用 |
| 实验性房间协议 | `src/services/game-port.ts`，无 Tauri 依赖，尚未接入桌面对局界面 |

## 衍生版行为

首页提供人机对战、本地双人和 PGN 复盘入口。人机默认不限时、Skill Level 5、每步思考 500 毫秒。程序启动时会将附带引擎注册到本应用的引擎配置。

应用标识为 `local.qiyan.chess`。引擎、数据库和习题默认使用该标识下的应用数据目录，也可在设置指定其他目录。PGN 文档保留上游默认文件夹名，可通过目录设置迁移。

使用统计已停用。更新菜单打开本项目 GitHub Releases 页面，不安装上游更新。

## 走法评级

`expectedScore()` 通过 Stockfish WDL 计算 `(胜 + 和 / 2) / 总数`；没有 WDL 时使用现有厘兵分数曲线。普通评级根据预期得分损失分类，边界为 2、5、10、20 个百分点。

最佳走法、唯一合法走法、弃子、唯一好棋和错失将杀等信息决定其余类别。同一分类器提供棋谱、棋盘角标、逐步说明和报告汇总。理论着法匹配 15 条精简开局路线中的局面与走法组合，不按走棋步数直接认定。

评级是依赖引擎深度与思考时间的启发式结果，没有实现 Chess.com 的私有评级模型。类别含义参考其[公开分类说明](https://support.chess.com/en/articles/8572705-how-are-moves-classified-what-is-a-blunder-or-brilliant-etc)。

## 实验性房间协议

`GamePort` 定义供后续独立房间服务使用的命令和完整快照。发送的命令带有协议版本和请求 ID，走棋与认输命令还带有预期房间版本；WebSocket 适配器验证快照，丢弃旧版本或重复版本，并将验证错误交给调用方。

当前没有随包提供房间服务器、匹配服务或手机安装包。服务端还需实现座位权限、合法走法、权威时钟、结果、请求去重和重连令牌；手机端也需替换桌面文件访问与引擎进程适配。

## 依赖与分发

Stockfish、DuckDB 绑定、Aix 和图像识别资源保留其原始许可与来源，详见[第三方声明](../THIRD-PARTY-NOTICES.md)。构建步骤见[BUILDING.zh-CN.md](BUILDING.zh-CN.md)。
