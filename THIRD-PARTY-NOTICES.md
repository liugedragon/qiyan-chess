# Third-party notices

QiyanChess is a modified distribution of [En Croissant](https://github.com/franciscoBSalgueiro/en-croissant), by Francisco Salgueiro and contributors. The application source is licensed under **GPL-3.0-only**; see [LICENSE](LICENSE). Original notices and authorship remain in the source history. Fork changes are recorded in this repository and its release notes.

The components below retain their own licenses. In particular, the ChessQ recognition weights use PolyForm Noncommercial terms, separately from the application's GPL license.

| Component | Version or source | License |
| --- | --- | --- |
| En Croissant application | Upstream revision `499c447876f8d258b927959d84fae33224599289` | GPL-3.0-only |
| Stockfish | Official `sf_19` Windows x86-64 universal distribution | GPL-3.0-or-later |
| DuckDB runtime | `v2.0.0` | MIT |
| Microsoft Visual C++ release runtime | x64 `14.44.35211.0` | Microsoft Software License Terms for the runtime components |
| DuckDB Rust bindings | Base revision `4acbea84794582c4cd962ee971a3d7a5dcb72e39`, with the vendored changes in this repository | MIT |
| Aix DuckDB extension | `dev-97b5475`, source `97b5475b8f9ceef9fa1ee65c2814e3e71797805c` | GPL v3 |
| `aix-chess-compression` | `0.1.1`, source `9cacddc25f7a842699e1aa63b615e4604eec92b3` | GPL-3.0-or-later |
| ChessQ Lite V4 model weights | `chessq-lite-v4.safetensors` | PolyForm Noncommercial 1.0.0 |
| DINOv2 encoder components | Incorporated in the ChessQ weights | Apache-2.0 |
| Chessground | `10.5.0`, Lichess Team | GPL-3.0-or-later |
| chessops | `0.15.1`, Niklas Fiekas | GPL-3.0-or-later |
| Font Awesome chessboard icon | Font Awesome Free `6.7.1`, Fonticons, Inc. | CC BY 4.0 for the SVG icon |

Additional JavaScript and Rust dependency versions are recorded in `pnpm-lock.yaml` and `src-tauri/Cargo.lock`.

## Stockfish

Copyright (C) 2004-2026 The Stockfish developers; the complete author list is in `vendor/stockfish/stockfish/AUTHORS` and the [official source release](https://github.com/official-stockfish/Stockfish/tree/sf_19).

The portable package contains the unmodified official universal executable as `engine/stockfish.exe`, accompanied by `engine/LICENSE-Stockfish.txt`. Its source, Makefile and build scripts are retained under `vendor/stockfish/stockfish`; the original license is `Copying.txt` in that directory. The corresponding upstream source is also available from the [`sf_19` source archive](https://github.com/official-stockfish/Stockfish/archive/refs/tags/sf_19.tar.gz).

The executable's SHA-256 is `45bc8e4969147db9c2eb533810637994619bff0eacc81ccfd9854394901bcbd0`. The official download archive has SHA-256 `3c8bf1f9ea66a09350a40df4f632288285ac206d99f33ab5842c408fc30b48a7`.

The release embeds its NNUE network. Source builds obtain the named `nn-1a298aa575a0.nnue` network with the upstream `scripts/net.sh`, using the Stockfish network service or the official networks repository. The script and network filename are retained with the source.

## DuckDB

Copyright 2021-2026 Stichting DuckDB Foundation. The MIT notice is included as `LICENSE-DuckDB.txt` in the portable package and as `vendor/duckdb-rs/LICENSE` in the source tree.

The runtime comes from the [official DuckDB 2.0.0 shared-libraries archive](https://github.com/duckdb/duckdb/releases/download/v2.0.0/duckdb-shared-libs-windows-amd64.tar.gz), SHA-256 `2b83169128239de5f45fe21de80f99bf436e53aa4bb24020dd951a1ba8d4b95f`. The runtime source is available at [DuckDB v2.0.0](https://github.com/duckdb/duckdb/tree/v2.0.0).

The vendored [Rust bindings](https://github.com/duckdb/duckdb-rs/tree/4acbea84794582c4cd962ee971a3d7a5dcb72e39) and their local build changes are included in `vendor/duckdb-rs`.

## Microsoft Visual C++ runtime

The Windows portable package includes unmodified `vcruntime140.dll` and `vcruntime140_1.dll`, x64 file version `14.44.35211.0`, from Visual Studio 2022's `VC/Redist/MSVC` release-CRT directory. Copyright (C) Microsoft Corporation. All rights reserved. Both files preserve their Microsoft digital signatures and original version information.

These runtime files retain Microsoft's license terms. QiyanChess application source remains GPL-3.0-only. [NOTICE-Microsoft-VC.txt](NOTICE-Microsoft-VC.txt) records the component notices and full license references. Microsoft's [Distributable Code list](https://learn.microsoft.com/en-us/visualstudio/releases/2022/redistribution#visual-c-runtime-files) defines redistribution conditions for licensed Visual Studio users; its [deployment guidance](https://learn.microsoft.com/en-us/cpp/windows/redistributing-visual-cpp-files?view=msvc-170) describes application-local DLL deployment.

## Aix

Aix was created by Thomas Daniels; the En Croissant fork is maintained by Francisco Salgueiro. The GPL license text is included unchanged in [LICENSE-Aix.txt](LICENSE-Aix.txt).

The Windows extension shipped with this release is the [pinned `dev-97b5475` asset](https://github.com/franciscoBSalgueiro/aix/releases/download/dev-97b5475/aixchess-v2.0.0-extension-windows_amd64.duckdb_extension). Its SHA-256 is `6242e596503fcaac1399ae7d0844a39905bf5f7b2978c4e38250e57462bfc927`. Its corresponding source is [revision `97b5475b8f9ceef9fa1ee65c2814e3e71797805c`](https://github.com/franciscoBSalgueiro/aix/tree/97b5475b8f9ceef9fa1ee65c2814e3e71797805c).

The linked Rust compression crate has a separately pinned [source revision](https://github.com/franciscoBSalgueiro/aix/tree/9cacddc25f7a842699e1aa63b615e4604eec92b3/aix-chess-compression), recorded in `src-tauri/Cargo.lock`.

## ChessQ and DINOv2

Required Notice: Copyright (c) 2026 Joël Seytre.

The fine-tuned ChessQueries / ChessQ Lite V4 weights retain [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0). Permitted uses are defined by that license. Redistribution must retain its terms and required notices.

These weights incorporate DINOv2 pretrained encoder components. DINOv2: Copyright (c) Meta Platforms, Inc. and affiliates; [upstream project](https://github.com/facebookresearch/dinov2), Apache License 2.0.

The source tree keeps the original `LICENSE-ChessQ`, `LICENSE-DINOv2`, and `NOTICE-ChessQ` beside the weights under `src-tauri/resources/vision`. The portable package preserves all three under `vision`.

## Chessground, chessops and artwork

The board interaction layer uses [Chessground](https://github.com/lichess-org/chessground), by the Lichess Team. Chess rules and notation use [chessops](https://github.com/niklasf/chessops), by Niklas Fiekas. Their GPL notices remain applicable to their code. Board, piece and sound assets inherited from En Croissant remain with their upstream source and attribution.

The SVG path in `src/components/icons/Chessboard.tsx` is from **Font Awesome Free 6.7.1**, Copyright 2024 Fonticons, Inc. The icon is rendered through the application's React wrapper. See [Font Awesome Free licensing](https://fontawesome.com/license/free), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), and the unmodified [LICENSE-FontAwesome.txt](LICENSE-FontAwesome.txt).
