[CmdletBinding()]
param([string]$OutputPath)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$packageRoot = Join-Path $projectRoot 'release\QiyanChess'
$version = (Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json).version
if (!$OutputPath) { $OutputPath = Join-Path $projectRoot "artifacts\QiyanChess-$version-windows-x64.zip" }
$OutputPath = [IO.Path]::GetFullPath($OutputPath)
New-Item -ItemType Directory -Path (Split-Path $OutputPath -Parent) -Force | Out-Null
$roots = @('QiyanChess.exe', 'duckdb.dll', 'vcruntime140.dll', 'vcruntime140_1.dll',
    'aixchess.duckdb_extension', 'LICENSE', 'LICENSE-Aix.txt', 'LICENSE-FontAwesome.txt',
    'LICENSE-DuckDB.txt', 'NOTICE-Microsoft-VC.txt', 'THIRD-PARTY-NOTICES.md',
    'README.md', 'README.zh-CN.md', 'CONTRIBUTING.md', 'CONTRIBUTING.zh-CN.md',
    '使用说明.txt', 'LOCAL-FORK.md', 'engine', 'sound', 'vision', 'docs', 'examples')
$files = @()
foreach ($name in $roots) {
    $path = Join-Path $packageRoot $name
    if (!(Test-Path -LiteralPath $path)) { throw "Required package item is missing: $name" }
    $item = Get-Item -LiteralPath $path
    if ($item.PSIsContainer) { $files += Get-ChildItem -LiteralPath $path -File -Recurse } else { $files += $item }
}
$files = @($files | Sort-Object FullName -Unique)
$prefix = $packageRoot.TrimEnd('\') + '\'
$inventory = @($files | ForEach-Object {
    [ordered]@{path=$_.FullName.Substring($prefix.Length).Replace('\','/'); bytes=$_.Length;
        sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()}
})
$sourceCommit = (& git -C $projectRoot rev-parse HEAD).Trim()
$manifest = [ordered]@{version=$version;sourceCommit=$sourceCommit;files=$inventory;manifestHashesItself=$false}
$manifestPath = Join-Path $packageRoot 'package-manifest.json'
[IO.File]::WriteAllText($manifestPath, ($manifest | ConvertTo-Json -Depth 6), [Text.UTF8Encoding]::new($false))
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$stream = [IO.File]::Open($OutputPath, [IO.FileMode]::CreateNew)
try {
    $archive = [IO.Compression.ZipArchive]::new($stream, [IO.Compression.ZipArchiveMode]::Create, $true)
    try {
        foreach ($file in $files) {
            $relative = $file.FullName.Substring($prefix.Length).Replace('\','/')
            [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, "QiyanChess/$relative", [IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $manifestPath, 'QiyanChess/package-manifest.json', [IO.Compression.CompressionLevel]::Optimal) | Out-Null
    } finally { $archive.Dispose() }
} finally { $stream.Dispose() }
$hash = (Get-FileHash -LiteralPath $OutputPath -Algorithm SHA256).Hash.ToLowerInvariant()
$line = "$hash  $([IO.Path]::GetFileName($OutputPath))"
$line | Set-Content -LiteralPath (Join-Path (Split-Path $OutputPath -Parent) 'SHA256SUMS.txt') -Encoding ascii
Write-Output $line
