import { Chess, makeUci, parseUci } from "chessops";
import { normalizeMove } from "chessops/chess";
import { makeFen } from "chessops/fen";
import type { Score } from "@/bindings";
import { positionFromFen } from "./chessops";
import { getWinChance } from "./score";
import { getNodeAtPath, type TreeNode } from "./treeReducer";

export const REVIEW_INFO = {
    brilliant: {
        symbol: "!!",
        label: "妙手",
        color: "cyan",
        description: "保持局势的优质弃子，且并非早已轻松获胜。",
    },
    great: {
        symbol: "!",
        label: "关键好棋",
        color: "blue",
        description: "找到关键走法或唯一能维持局势的好棋。",
    },
    best: {
        symbol: "★",
        label: "最佳走法",
        color: "teal",
        description: "与本次引擎首选走法相同。",
    },
    excellent: {
        symbol: "✓",
        label: "优秀",
        color: "green",
        description: "接近最佳，预期得分损失小于 2 个百分点。",
    },
    good: {
        symbol: "✓",
        label: "不错",
        color: "lime",
        description: "合理走法，预期得分损失为 2–5 个百分点。",
    },
    book: {
        symbol: "▤",
        label: "理论着法",
        color: "grape",
        description: "命中内置常见开局走法表；当前为精简开局表。",
    },
    forced: {
        symbol: "□",
        label: "唯一合法走法",
        color: "gray",
        description: "局面中只有一个合法走法，不能据此判断棋力高低。",
    },
    inaccuracy: {
        symbol: "?!",
        label: "小问题",
        color: "yellow",
        description: "不够准确，预期得分损失为 5–10 个百分点。",
    },
    mistake: {
        symbol: "?",
        label: "错误",
        color: "orange",
        description: "明显削弱局势，预期得分损失为 10–20 个百分点。",
    },
    miss: {
        symbol: "⊗",
        label: "错失机会",
        color: "pink",
        description: "对手失误后出现赢棋机会，但未能抓住，回到均势或更差。",
    },
    blunder: {
        symbol: "??",
        label: "严重失误",
        color: "red",
        description: "预期得分损失达到 20 个百分点，或错失明确将杀。",
    },
} as const;
export type ReviewKind = keyof typeof REVIEW_INFO;
export type MoveReview = { kind: ReviewKind; loss: number; before: number; after: number };

// Local curated opening lines. Match position + move, never just move number.
const openingMoves = new Set<string>();
const fenKey = (fen: string) => fen.split(" ").slice(0, 4).join(" ");
for (const line of [
    "e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7",
    "e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6 d2d4",
    "e2e4 e7e5 g1f3 g8f6 f3e5 d7d6 e5f3 f6e4",
    "e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6",
    "e2e4 c7c5 g1f3 b8c6 d2d4 c5d4 f3d4 g8f6 b1c3 e7e5",
    "e2e4 e7e6 d2d4 d7d5 b1c3 g8f6",
    "e2e4 c7c6 d2d4 d7d5 b1c3 d5e4 c3e4",
    "e2e4 d7d5 e4d5 d8d5 b1c3",
    "d2d4 d7d5 c2c4 e7e6 b1c3 g8f6",
    "d2d4 d7d5 c2c4 c7c6 g1f3 g8f6",
    "d2d4 g8f6 c2c4 e7e6 b1c3 f8b4",
    "d2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6",
    "d2d4 d7d5 g1f3 g8f6 c1f4",
    "c2c4 e7e5 b1c3 g8f6 g1f3 b8c6",
    "g1f3 d7d5 g2g3 g8f6 f1g2",
]) {
    const position = Chess.default();
    for (const uci of line.split(" ")) {
        openingMoves.add(
            `${fenKey(makeFen(position.toSetup()))}|${makeUci(normalizeMove(position, parseUci(uci)!))}`,
        );
        position.play(parseUci(uci)!);
    }
}

/** White's expected score, W + D/2. Fall back to the published Lichess CP curve. */
export function expectedScore(score: Score): number {
    if (score.value.type === "mate") return score.value.value > 0 ? 1 : 0;
    if (score.wdl) {
        const total = score.wdl.reduce((a, b) => a + b, 0);
        if (total > 0) return (score.wdl[0] + score.wdl[1] / 2) / total;
    }
    return getWinChance(score.value.value) / 100;
}

export function classifyMove(input: {
    before: number;
    after: number;
    isBest: boolean;
    forced?: boolean;
    book?: boolean;
    sacrifice?: boolean;
    great?: boolean;
    beforeOpponent?: number;
    missedMate?: boolean;
}): MoveReview {
    const loss = Math.max(0, input.before - input.after);
    let kind: ReviewKind;
    if (input.forced) kind = "forced";
    else if (
        input.isBest &&
        input.sacrifice &&
        loss < 0.02 &&
        input.before < 0.95 &&
        input.after >= 0.45
    )
        kind = "brilliant";
    else if (input.isBest && input.great && loss < 0.02) kind = "great";
    else if (input.isBest && input.book) kind = "book";
    else if (input.isBest) kind = "best";
    else if (input.missedMate || loss >= 0.2 - 1e-9) kind = "blunder";
    else if (
        input.beforeOpponent !== undefined &&
        input.beforeOpponent <= 0.6 &&
        input.before >= 0.75 &&
        input.after <= 0.6 &&
        loss >= 0.1
    )
        kind = "miss";
    else if (loss >= 0.1 - 1e-9) kind = "mistake";
    else if (loss >= 0.05 - 1e-9) kind = "inaccuracy";
    else if (input.sacrifice && loss < 0.02 && input.before < 0.95 && input.after >= 0.45)
        kind = "brilliant";
    else if (input.book) kind = "book";
    else if (loss < 0.02 - 1e-9) kind = "excellent";
    else kind = "good";
    return { kind, loss, before: input.before, after: input.after };
}

export function reviewAtPath(root: TreeNode, path: number[]): MoveReview | null {
    if (!path.length) return null;
    const node = getNodeAtPath(root, path);
    const parent = getNodeAtPath(root, path.slice(0, -1));
    if (!node.move || !parent.engineBestMove || !parent.score) return null;
    const [position] = positionFromFen(parent.fen);
    const [afterPosition] = positionFromFen(node.fen);
    if (!position || !afterPosition) return null;
    const turn = position.turn;
    const perspective = (white: number) => (turn === "white" ? white : 1 - white);
    const before = perspective(expectedScore(parent.score));
    let after: number;
    if (afterPosition.isCheckmate()) after = 1;
    else if (afterPosition.isEnd()) after = 0.5;
    else if (node.score) after = perspective(expectedScore(node.score));
    else return null;
    const grandparent = path.length > 1 ? getNodeAtPath(root, path.slice(0, -2)) : null;
    const uci = makeUci(normalizeMove(position, node.move));
    const engineMove = parseUci(parent.engineBestMove.uci);
    return classifyMove({
        before,
        after,
        isBest: !!engineMove && uci === makeUci(normalizeMove(position, engineMove)),
        forced:
            [...position.allDests()].reduce(
                (sum, [from, dests]) =>
                    sum +
                    [...dests].reduce(
                        (count, to) =>
                            count +
                            (position.board.get(from)?.role === "pawn" && (to < 8 || to >= 56)
                                ? 4
                                : 1),
                        0,
                    ),
                0,
            ) === 1,
        book: openingMoves.has(`${fenKey(parent.fen)}|${uci}`),
        sacrifice: node.annotations.includes("!!") || node.annotations.includes("!?"),
        great: node.annotations.includes("!"),
        beforeOpponent: grandparent?.score
            ? perspective(expectedScore(grandparent.score))
            : undefined,
        missedMate:
            parent.score.value.type === "mate" &&
            before === 1 &&
            node.score?.value.type !== "mate" &&
            after < 0.95,
    });
}
