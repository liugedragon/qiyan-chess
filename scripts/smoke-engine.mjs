import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Chess } from "chessops/chess";
import { parseFen } from "chessops/fen";
import { parseUci } from "chessops";

const engine = spawn(fileURLToPath(new URL("../vendor/engine/stockfish.exe", import.meta.url)), [], { windowsHide: true });
let output = "";
const waiters = [];
engine.stdout.on("data", (data) => {
  output += data;
  for (const waiter of [...waiters]) {
    const match = output.match(waiter.pattern);
    if (match) { waiters.splice(waiters.indexOf(waiter), 1); waiter.resolve(match); }
  }
});
engine.stderr.pipe(process.stderr);
const deadline = setTimeout(() => { engine.kill(); throw new Error("Engine smoke test timed out"); }, 30000);
function wait(pattern) {
  const match = output.match(pattern);
  return match ? Promise.resolve(match) : new Promise((resolve) => waiters.push({ pattern, resolve }));
}
function send(command) { engine.stdin.write(`${command}\n`); }
try {
  send("uci"); await wait(/uciok/);
  send("setoption name Threads value 2"); send("isready"); await wait(/readyok/);
  const cases = [
    ["start", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
    ["after e4", "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"],
    ["mate in one", "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1"],
  ];
  for (const [name, fen] of cases) {
    output = ""; send(`position fen ${fen}`); send("go movetime 300");
    const match = await wait(/bestmove (\S+)/);
    const position = Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
    const move = parseUci(match[1]);
    if (!move || !position.isLegal(move)) throw new Error(`Illegal engine move: ${match[1]}`);
    position.play(move);
    if (name === "mate in one" && !position.isCheckmate()) throw new Error("Missed mate in one");
    console.log(`PASS ${name}: ${match[1]}`);
  }
} finally { clearTimeout(deadline); send("quit"); }
