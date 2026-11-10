# 贡献说明

[English](CONTRIBUTING.md) · [README](README.zh-CN.md)

请在[本仓库 Issues](https://github.com/liugedragon/qiyan-chess/issues)报告问题或讨论修改。报告中写明应用版本、Windows 版本、复现步骤和相关错误。需要棋谱时，尽量提供最小合成 PGN；上传附件前移除账号信息、本地路径和私人棋谱。

## 开发

按 [Windows 构建说明](docs/BUILDING.zh-CN.md)准备环境并创建分支。运行 `pnpm test` 和 `pnpm lint`，构建便携版，并检查本次改动涉及的桌面操作。`pnpm format` 用于格式化；变更翻译键时，使用项目 i18n 命令同步相应翻译。

PR 应说明问题、修改后的行为和验证方法。棋谱状态、评级和协议改动应有回归测试；未进行的平台或交互检查请明确注明。

构建缓存、生成的二进制、用户数据库、令牌和个人对局文件不进入 Git。保留上游版权和许可声明。应用源码的贡献沿用 GPL-3.0-only，不更改第三方组件或模型权重的独立许可证。

棋研与 [En Croissant](https://github.com/franciscoBSalgueiro/en-croissant)分别维护。拟提交给上游的修改应遵循上游贡献流程。
