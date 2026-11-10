# Verification records

## 0.15.1-qiyan.1 — 2026-11-10

Environment: Windows x64, Node.js 22.18.0, TypeScript 7.0.2, Vitest 5.0.5, Rust/Cargo 1.91.1 and MSVC 14.44.

- TypeScript `--noEmit`: passed.
- Vitest: 11 files and 87 tests passed, with two workers.
- Oxlint: completed with warnings and no errors.
- `cargo build --release --locked`: passed. Two Rust warnings remain for an unused import and an unconstructed error variant.
- pnpm 12.15.0, invoked through the documented pinned `npx` command, accepted the frozen lockfile in offline lockfile-only mode.
- Windows PowerShell resource verification and packaging commands: passed.
- Resource preparation verified the pinned Stockfish 19, DuckDB 2.0.0, Aix `dev-97b5475`, and ChessQ model hashes.
- The bundled engine returned legal moves for the starting position and an e4 position, and found the synthetic mate-in-one.
- The rebuilt portable executable reports product version `0.15.1-qiyan.1`. Startup with the synthetic example PGN created a live main window. Process inspection confirmed DuckDB and the two VC runtime DLLs were loaded from the portable directory.
- Runtime dependency inspection found only packaged libraries and Windows system APIs; the VC runtime files retain valid Microsoft signatures.

The application executable is unsigned. A clean Windows machine without development tools, interactive UI/layout checks for this version, an actual Lichess login, OS deep-link clicks, and Linux/macOS packages have not been verified. WebView2 Runtime remains a prerequisite.


[README](../README.md) · [Build and test commands](BUILDING.md)

## Historical local build: 2026-10-27

Environment recorded at the time: Windows x64. These notes describe the earlier local build, not a clean-machine check of a later GitHub release.

| Check | Recorded result |
| --- | --- |
| TypeScript, Vite and Rust release build | Passed |
| Initial rule, score, clock and room-protocol tests | 37 tests passed |
| Game-state and protocol tests after engine-best-move metadata changes | 31 tests passed |
| Stockfish process checks | Legal moves from the starting position and after `e4`; a mate-in-one position was solved |
| Desktop launch | Chinese home screen and bundled engine loaded |
| Computer game | `1. e4 e5 2. Nf3 Nc6 3. Nxe5 Nxe5` was played through the window; the engine answered each of three human moves |
| Report generation | Generated without a reference database at 500 ms per position after switching from the game to analysis |
| Report contents | WDL curve and both accuracy values appeared; `Nxe5` was classified as `??` with `Bb5` recommended at depth 17; `e4` was shown as the best move at depth 18 |

## Detailed-rating update: earlier local build

TypeScript checks, frontend build and Rust release build were recorded as successful. The application launched and loaded the synthetic rating-example PGN. Tests covered rating boundaries, WDL expected score, opening matching, missing-analysis behavior, missed opportunities and castling normalization.

The detailed report controls were not fully verified through automated window interaction in that run. No mobile package or remote game server was produced; the room-protocol adapter had tests but was not connected to the desktop game UI.

## Reproducing checks

Follow [BUILDING.md](BUILDING.md). The repository provides `pnpm test` and `node scripts/smoke-engine.mjs`; desktop checks must be performed against the built portable folder. New release records list the version, environment, commands and results for the binary being checked.
