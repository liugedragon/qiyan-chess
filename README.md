# QiyanChess

[简体中文](README.zh-CN.md) · [Download for Windows](https://github.com/liugedragon/qiyan-chess/releases/latest) · [Report an issue](https://github.com/liugedragon/qiyan-chess/issues)

QiyanChess (棋研) is a desktop application for playing and reviewing chess games. Play against the bundled Stockfish 19 engine, open a PGN, and review the position, suggested moves and evaluation changes.

This is a fork of [En Croissant](https://github.com/franciscoBSalgueiro/en-croissant). Its chess GUI, PGN handling, engine analysis, database and repertoire tools come from that project. QiyanChess adds Chinese home-screen shortcuts, bundled-engine setup and a shared move-review classification across the board, move list and report.

## Download and start

1. Download the Windows x64 portable ZIP from [Releases](https://github.com/liugedragon/qiyan-chess/releases/latest).
2. Extract the complete archive to a folder you can write to.
3. Run `QiyanChess.exe`.

Keep the whole folder together. The engine, database extension, DLL, sounds and vision resources are required; the EXE alone is insufficient. Microsoft Edge WebView2 Runtime must be installed.

Local play and analysis with the bundled engine do not require an account or an API key. Online services and additional downloads use the network.

## Play and review

- **Play the computer:** choose **人机对战** on the home screen. Defaults are no time limit, Stockfish Skill Level 5 and 500 ms per move; these can be changed in the game settings.
- **Play locally:** choose **本地双人** to share one board on the same computer.
- **Review a game:** import a PGN, or choose **复盘分析** after a game. Generate a report with Stockfish, then select a move or an evaluation-graph position to inspect alternatives.
- **Keep your games:** save or export PGN from the file menu. A [synthetic example game](examples/评级示例.pgn) is included for trying the report.

Move ratings use engine analysis and heuristics. Longer analysis can change the result. The labels and accuracy values are not the same rating model used by Chess.com.

## Data and updates

Settings allow custom game, engine, database and puzzle directories. Application data uses the separate `local.qiyan.chess` identifier. The default PGN documents folder retains the upstream `EnCroissant` name; check the directory settings when moving existing games.

Usage telemetry is disabled in this distribution. The update menu opens this repository's Releases page for manual downloads. Back up your PGN files and any databases before replacing an older application folder.

## Documentation

- [Windows build instructions](docs/BUILDING.md)
- [Architecture and upstream changes](docs/LOCAL-FORK.md)
- [Verification records](docs/VERIFICATION.md)
- [Contributing](CONTRIBUTING.md)
- [Third-party notices](THIRD-PARTY-NOTICES.md)

The published package targets Windows x64. Remote game rooms and mobile packages are not included in this release.

## License and credits

Application source is licensed under [GPL-3.0-only](LICENSE), with the upstream history and author attribution retained. Stockfish and other bundled components retain their own licenses. The ChessQ model weights are separately licensed under **PolyForm Noncommercial 1.0.0**; DINOv2-related materials use Apache 2.0. See [third-party notices](THIRD-PARTY-NOTICES.md) for the component licenses and source locations.
