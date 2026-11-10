$ErrorActionPreference = 'Stop'
function Copy-ChangedFile([string]$Source, [string]$Destination) {
    if ((Test-Path -LiteralPath $Destination -PathType Leaf) -and
        (Get-FileHash -LiteralPath $Source -Algorithm SHA256).Hash -eq
        (Get-FileHash -LiteralPath $Destination -Algorithm SHA256).Hash) { return }
    Copy-Item -LiteralPath $Source -Destination $Destination
}
$projectRoot = Split-Path $PSScriptRoot -Parent
$outputDir = Join-Path $projectRoot 'release\QiyanChess'
$targetRoot = if ($env:CARGO_TARGET_DIR) { [IO.Path]::GetFullPath($env:CARGO_TARGET_DIR) } else { Join-Path $projectRoot 'src-tauri\target' }
$compiledExe = Join-Path $targetRoot 'release\en-croissant.exe'
if (!(Test-Path -LiteralPath $compiledExe)) { throw 'Build the release executable first.' }
New-Item -ItemType Directory -Force $outputDir | Out-Null
Copy-ChangedFile $compiledExe (Join-Path $outputDir 'QiyanChess.exe')
$crtDirectory = $env:QIYAN_VC_REDIST_DIR
if (!$crtDirectory) {
    $vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
    if (!(Test-Path -LiteralPath $vswhere)) { throw 'Set QIYAN_VC_REDIST_DIR to the licensed Visual Studio x64 release CRT directory.' }
    $visualStudio = & $vswhere -latest -products '*' -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
    if (!$visualStudio) { throw 'Visual Studio C++ Build Tools were not found.' }
    $versions = Get-ChildItem -LiteralPath (Join-Path $visualStudio 'VC\Redist\MSVC') -Directory |
        Where-Object { $_.Name -match '^\d+\.\d+\.\d+(?:\.\d+)?$' } |
        Sort-Object { [version]$_.Name } -Descending
    foreach ($version in $versions) {
        $architecture = Join-Path $version.FullName 'x64'
        if (Test-Path -LiteralPath $architecture) {
            $candidate = Get-ChildItem -LiteralPath $architecture -Directory |
                Where-Object { $_.Name -match '^Microsoft\.VC\d+\.CRT$' } | Select-Object -First 1
            if ($candidate) { $crtDirectory = $candidate.FullName; break }
        }
    }
}
if (!$crtDirectory) { throw 'A redistributable x64 release CRT was not found. Set QIYAN_VC_REDIST_DIR.' }
foreach ($library in @('vcruntime140.dll', 'vcruntime140_1.dll')) {
    $runtimeSource = Join-Path $crtDirectory $library
    $signature = Get-AuthenticodeSignature -LiteralPath $runtimeSource
    if ($signature.Status -ne 'Valid' -or $signature.SignerCertificate.Subject -notmatch 'O=Microsoft Corporation') {
        throw "Expected an unchanged Microsoft-signed release runtime: $library"
    }
    Copy-ChangedFile $runtimeSource (Join-Path $outputDir $library)
}
Copy-ChangedFile (Join-Path $projectRoot 'vendor\duckdb-runtime\duckdb.dll') (Join-Path $outputDir 'duckdb.dll')
foreach ($directory in @('vendor\engine', 'sound', 'src-tauri\resources\vision', 'docs', 'examples')) {
    Copy-Item -LiteralPath (Join-Path $projectRoot $directory) -Destination $outputDir -Recurse -Force
}
Copy-Item -LiteralPath (Join-Path $projectRoot 'aixchess.duckdb_extension') -Destination $outputDir
foreach ($file in @('LICENSE', 'LICENSE-Aix.txt', 'LICENSE-FontAwesome.txt', 'NOTICE-Microsoft-VC.txt', 'README.md', 'README.zh-CN.md', 'CONTRIBUTING.md', 'CONTRIBUTING.zh-CN.md')) {
    Copy-Item -LiteralPath (Join-Path $projectRoot $file) -Destination $outputDir
}
Copy-Item -LiteralPath (Join-Path $projectRoot 'vendor\duckdb-rs\LICENSE') -Destination (Join-Path $outputDir 'LICENSE-DuckDB.txt')
Copy-Item -LiteralPath (Join-Path $projectRoot 'docs\使用说明.txt') -Destination $outputDir
Copy-Item -LiteralPath (Join-Path $projectRoot 'docs\LOCAL-FORK.md') -Destination $outputDir
$notices = Get-Content -LiteralPath (Join-Path $projectRoot 'THIRD-PARTY-NOTICES.md') -Raw -Encoding utf8
$notices = $notices.Replace('](vendor/engine/', '](engine/').Replace('](src-tauri/resources/vision/', '](vision/').Replace('](vendor/duckdb-rs/LICENSE)', '](LICENSE-DuckDB.txt)')
Set-Content -LiteralPath (Join-Path $outputDir 'THIRD-PARTY-NOTICES.md') -Value $notices -Encoding utf8
Write-Output "Portable Windows app: $outputDir\QiyanChess.exe"
