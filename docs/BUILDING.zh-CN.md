# 在 Windows 构建棋研

[English](BUILDING.md) · [README](../README.zh-CN.md)

## 开发环境

- Windows x64。
- Node.js 22，以及 `package.json` 固定的 pnpm 12.15.0。
- `x86_64-pc-windows-msvc` Rust 工具链。
- Visual Studio C++ Build Tools 和 Windows SDK。
- 运行桌面程序所需的 Microsoft Edge WebView2 Runtime。

原生 Windows 工具链配置可参阅 [Tauri 前置要求](https://tauri.app/start/prerequisites/)。构建终端应能找到 `node`、`pnpm` 和 `cargo`。

## 构建便携版

```powershell
git clone https://github.com/liugedragon/qiyan-chess.git
cd qiyan-chess
npx --yes pnpm@12.15.0 install --frozen-lockfile
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/prepare-windows-resources.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-windows.ps1
```

首次安装依赖和准备资源需要联网。资源脚本下载固定发行版本并校验哈希。引擎与原生运行库二进制不进入源码 Git；对应源码和许可证见[第三方声明](../THIRD-PARTY-NOTICES.md)。

`build-windows.ps1` 依次检查 TypeScript、构建前端、按锁文件编译 Rust 程序，并组装 `release/QiyanChess/`。运行时从完整目录启动 `QiyanChess.exe`。

准备资源后，可用 `pnpm dev` 开发。`pnpm test` 运行 TypeScript 测试；`node scripts/smoke-engine.mjs` 用合成局面检查附带引擎的合法应手和一步将杀。

## 构建输入

- `pnpm-lock.yaml` 固定 JavaScript 依赖。
- `src-tauri/Cargo.lock` 固定 Rust 依赖。
- `vendor/duckdb-rs/` 是本衍生版使用的 DuckDB Rust 绑定源码。
- 固定资源版本、校验值和来源链接见资源脚本及第三方声明。
- `src-tauri/resources/vision/` 包含 ChessQ 模型和单独的许可文件。

不要提交 `node_modules`、Rust 构建产物、便携版目录、本地日志、用户数据库或账号数据。分发构建结果时须附带适用的许可证和源码说明。

## 常见问题

- **找不到 MSVC 或链接器：**安装 Visual Studio C++ 工具链与 Windows SDK，并使用配置好环境的终端。
- **资源准备失败：**检查脚本报告的下载地址、哈希和网络状态，不要为跳过校验而更换哈希或使用较新的上游包。
- **启动时缺少 `duckdb.dll`、引擎或扩展：**构建后重新运行打包脚本，并从完整目录启动。
- **无法覆盖正在运行的 EXE：**关闭该程序后再构建对应输出目录。

测试范围和历史结果见[验证记录](VERIFICATION.md)。

旧版 Corepack 如果提示找不到 `bin/pnpm.cjs`，使用上面的固定版本 `npx` 命令，或单独安装 pnpm 12.15.0。
