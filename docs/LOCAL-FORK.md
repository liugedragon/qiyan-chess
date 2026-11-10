# Architecture and upstream changes

[简体中文](LOCAL-FORK.zh-CN.md) · [README](../README.md)

QiyanChess is derived from [En Croissant](https://github.com/franciscoBSalgueiro/en-croissant), starting from commit `499c447876f8d258b927959d84fae33224599289`. The original history, authors and GPL license remain in the repository.

## Components

| Area | Implementation |
| --- | --- |
| Desktop shell and native commands | Tauri and Rust in `src-tauri/` |
| Board, game and analysis UI | React/TypeScript in `src/`, inherited and extended from En Croissant |
| Chess rules and notation | `chessops` and the upstream game-state implementation |
| Engine analysis | UCI engine integration; the Windows package includes Stockfish 19 |
| Game database | DuckDB and the Aix chess extension |
| Detailed move reviews | `src/utils/move-review.ts`, shared by the board, move list and report |
| Experimental room protocol | `src/services/game-port.ts`, independent of Tauri and not connected to the desktop game UI |

## Fork behavior

The home screen has direct entry points for computer play, local two-player games and PGN review. Computer play defaults to no clock, Skill Level 5 and 500 ms per move. The bundled engine is registered in this application's engine configuration at startup.

The application identifier is `local.qiyan.chess`. Engine, database and puzzle storage use its application-data directory unless a custom directory is set. PGN documents retain the upstream default folder name and can be moved through directory settings.

Usage telemetry is disabled. The update menu opens this fork's GitHub Releases page instead of installing upstream updates.

## Move classification

`expectedScore()` uses Stockfish WDL as `(wins + draws / 2) / total`; when WDL is unavailable, it uses the existing centipawn curve. Ordinary move labels are based on expected-score loss, with boundaries at 2, 5, 10 and 20 percentage points.

Best-move, forced-move, sacrifice, unique-good-move and missed-mate information supplies the other classifications. The same classifier feeds the move list, board annotations, per-move explanation and report totals. Book moves match position-and-move pairs from 15 short opening lines; they are not inferred from move number alone.

Labels are heuristic and depend on engine depth and time. They do not implement Chess.com's private rating model. The user-facing category reference is [Chess.com's public move-classification guide](https://support.chess.com/en/articles/8572705-how-are-moves-classified-what-is-a-blunder-or-brilliant-etc).

## Experimental room protocol

`GamePort` defines commands and validated snapshots for a possible separate room service. Sent commands include a protocol version and request ID; move and resign commands also carry an expected room revision. The WebSocket adapter validates snapshots, ignores older or duplicate revisions and reports validation errors to its caller.

No room server, matchmaking service or mobile package is shipped. A server implementation would need to enforce seats, legal moves, authoritative clocks, results, request deduplication and reconnection tokens. Mobile clients would also need replacements for desktop file access and engine processes.

## Dependencies and redistribution

Stockfish, the DuckDB bindings, Aix and the vision resources retain their original licenses and source locations. See [third-party notices](../THIRD-PARTY-NOTICES.md). Build steps are in [BUILDING.md](BUILDING.md).
