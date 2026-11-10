[CmdletBinding()]
param([string]$ProjectRoot)
$ErrorActionPreference = 'Stop'
if (!$ProjectRoot) { $ProjectRoot = Split-Path $PSScriptRoot -Parent }
$projectPath = (Resolve-Path -LiteralPath $ProjectRoot).Path
$resources = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'resources.lock.json') -Raw | ConvertFrom-Json
$cachePath = Join-Path $projectPath 'vendor\.cache'
New-Item -ItemType Directory -Path $cachePath -Force | Out-Null

function Assert-ProjectPath([string]$Path) {
    $full = [IO.Path]::GetFullPath($Path)
    $prefix = $projectPath.TrimEnd('\') + '\'
    if (!$full.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) { throw "Resource path is outside the project: $full" }
}
function Test-ResourceFile([string]$Path, [string]$Sha256) {
    if (!(Test-Path -LiteralPath $Path -PathType Leaf)) { return $false }
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash -eq $Sha256
}
function Get-VerifiedArchive($Asset, [string]$Filename) {
    $destination = Join-Path $cachePath $Filename
    Assert-ProjectPath $destination
    if (Test-ResourceFile $destination $Asset.sha256) { return $destination }
    $temporary = "$destination.download-$PID"
    Assert-ProjectPath $temporary
    try {
        Invoke-WebRequest -Uri $Asset.url -OutFile $temporary -UseBasicParsing
        if (!(Test-ResourceFile $temporary $Asset.sha256)) { throw "Archive checksum mismatch: $Filename" }
        Move-Item -LiteralPath $temporary -Destination $destination -Force
    } finally {
        if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary }
    }
    return $destination
}

$enginePath = Join-Path $projectPath $resources.stockfish.path
Assert-ProjectPath $enginePath
if (!(Test-ResourceFile $enginePath $resources.stockfish.sha256)) {
    $archivePath = Get-VerifiedArchive $resources.stockfish.archive 'stockfish-19-windows-universal.zip'
    New-Item -ItemType Directory -Path (Split-Path $enginePath -Parent) -Force | Out-Null
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [IO.Compression.ZipFile]::OpenRead($archivePath)
    $temporary = "$enginePath.download-$PID"
    try {
        $entry = $zip.GetEntry($resources.stockfish.entry)
        if ($null -eq $entry) { throw 'Stockfish executable is missing from the verified archive.' }
        $inputStream = $entry.Open()
        try {
            $outputStream = [IO.File]::Open($temporary, [IO.FileMode]::Create)
            try { $inputStream.CopyTo($outputStream) } finally { $outputStream.Dispose() }
        } finally { $inputStream.Dispose() }
        if (!(Test-ResourceFile $temporary $resources.stockfish.sha256)) { throw 'Stockfish executable checksum mismatch.' }
        Move-Item -LiteralPath $temporary -Destination $enginePath -Force
    } finally {
        $zip.Dispose()
        if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary }
    }
}
Write-Host "Verified Stockfish $($resources.stockfish.version)"

$runtimePath = Join-Path $projectPath $resources.duckdb.directory
Assert-ProjectPath $runtimePath
$runtimeReady = $true
foreach ($file in $resources.duckdb.files.PSObject.Properties) {
    if (!(Test-ResourceFile (Join-Path $runtimePath $file.Name) $file.Value.sha256)) { $runtimeReady = $false }
}
if (!$runtimeReady) {
    $archivePath = Get-VerifiedArchive $resources.duckdb.archive 'duckdb-2.0.0-windows-amd64.tar.gz'
    New-Item -ItemType Directory -Path $runtimePath -Force | Out-Null
    $members = @($resources.duckdb.files.PSObject.Properties.Name)
    & tar -xf $archivePath -C $runtimePath @members
    if ($LASTEXITCODE -ne 0) { throw 'DuckDB runtime extraction failed.' }
    foreach ($file in $resources.duckdb.files.PSObject.Properties) {
        if (!(Test-ResourceFile (Join-Path $runtimePath $file.Name) $file.Value.sha256)) { throw "DuckDB checksum mismatch: $($file.Name)" }
    }
}
Write-Host "Verified DuckDB $($resources.duckdb.version)"
& node (Join-Path $PSScriptRoot 'prepare-aix-extension.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Aix extension preparation failed.' }
$modelPath = Join-Path $projectPath $resources.vision.path
if (!(Test-ResourceFile $modelPath $resources.vision.sha256)) { throw 'ChessQ model is missing or has an unexpected checksum. Restore it from Git.' }
Write-Host 'Verified ChessQ model'
