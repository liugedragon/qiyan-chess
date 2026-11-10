# Building QiyanChess on Windows

[简体中文](BUILDING.zh-CN.md) · [README](../README.md)

## Prerequisites

- Windows x64.
- Node.js 22 and pnpm 12.15.0, as pinned by `package.json`.
- The Rust MSVC toolchain for `x86_64-pc-windows-msvc`.
- Visual Studio C++ Build Tools and a Windows SDK.
- Microsoft Edge WebView2 Runtime to run the desktop application.

See the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for the native Windows toolchain. Have `node`, `pnpm` and `cargo` available in the build shell.

## Build the portable package

```powershell
git clone https://github.com/liugedragon/qiyan-chess.git
cd qiyan-chess
npx --yes pnpm@12.15.0 install --frozen-lockfile
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/prepare-windows-resources.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-windows.ps1
```

The first dependency/resource preparation requires network access. The resource preparation script downloads fixed release assets and verifies their hashes. The bundled engine and native runtime binaries are kept out of source Git; their corresponding sources and licenses are documented in [third-party notices](../THIRD-PARTY-NOTICES.md).

`build-windows.ps1` checks TypeScript, builds the frontend, compiles the Rust application with the locked dependencies, and assembles `release/QiyanChess/`. Run `release/QiyanChess/QiyanChess.exe` with the rest of that folder present.

For local development, run `npx --yes pnpm@12.15.0 dev` after preparing the resources. Run `pnpm test` for the TypeScript tests and `node scripts/smoke-engine.mjs` for the bundled-engine smoke checks. The engine checks use synthetic positions and confirm legal responses and a mate in one.

## Build inputs

- `pnpm-lock.yaml` pins the JavaScript dependency graph.
- `src-tauri/Cargo.lock` pins the Rust dependency graph.
- `vendor/duckdb-rs/` contains the vendored DuckDB Rust bindings used by this fork.
- Resource versions, checksums and source links are recorded alongside the resource preparation script and third-party notices.
- `src-tauri/resources/vision/` contains the ChessQ model and its separate license notices.

Do not commit `node_modules`, Rust build outputs, the portable release directory, local logs, user databases or account data. Include the applicable license and source notices when redistributing a built package.

## Troubleshooting

- **MSVC or linker errors:** use a shell with the Visual Studio C++ toolchain and Windows SDK installed.
- **Resource preparation fails:** check the reported URL/hash and network connection. Do not replace a checksum or substitute a newer upstream asset merely to bypass a mismatch.
- **Missing `duckdb.dll`, engine or extension at startup:** run the packaging script after the build and launch from the complete output folder.
- **A running executable cannot be overwritten:** close the application before rebuilding that output folder.

Verification scope and historical results are recorded in [VERIFICATION.md](VERIFICATION.md).

If an older Corepack reports a missing `bin/pnpm.cjs`, use the pinned `npx` command above or install pnpm 12.15.0 directly.
