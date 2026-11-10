$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$oldDuckDbLib = $env:DUCKDB_LIB_DIR
$oldDuckDbInclude = $env:DUCKDB_INCLUDE_DIR
Push-Location $projectRoot
try {
    & "$PSScriptRoot/prepare-windows-resources.ps1"
    $env:DUCKDB_LIB_DIR = Join-Path $projectRoot 'vendor\duckdb-runtime'
    $env:DUCKDB_INCLUDE_DIR = $env:DUCKDB_LIB_DIR
    node node_modules/typescript/bin/tsc --noEmit
    if ($LASTEXITCODE -ne 0) { throw 'Type checking failed' }
    node node_modules/vite/bin/vite.js build
    if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed' }
    cargo build --release --locked --manifest-path src-tauri/Cargo.toml
    if ($LASTEXITCODE -ne 0) { throw 'Native build failed' }
    & "$PSScriptRoot/package-windows.ps1"
} finally {
    $env:DUCKDB_LIB_DIR = $oldDuckDbLib
    $env:DUCKDB_INCLUDE_DIR = $oldDuckDbInclude
    Pop-Location
}
