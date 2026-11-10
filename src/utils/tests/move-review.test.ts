import { describe, expect, it } from "vitest";
import { Chess, parseUci } from "chessops";
import { makeFen } from "chessops/fen";
import { positionFromFen } from "../chessops";
import { classifyMove, expectedScore, reviewAtPath } from "../move-review";
import { createNode, defaultTree } from "../treeReducer";

describe("detailed move ratings", () => {
    it("normalises engine and board castling notation", () => {
        const [position] = positionFromFen("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
        const root = defaultTree().root;
        root.fen = makeFen(position!.toSetup());
        root.score = { value: { type: "cp", value: 0 }, wdl: [100, 800, 100] };
        root.engineBestMove = { uci: "e1g1", san: "O-O" };
        const move = parseUci("e1h1")!;
        position!.play(move);
        const node = createNode({ fen: makeFen(position!.toSetup()), move, san: "O-O", halfMoves: 1 });
        node.score = root.score;
        root.children = [node];
        expect(reviewAtPath(root, [0])?.kind).toBe("best");
    });
    it.each([
        [0, "excellent"],
        [0.019, "excellent"],
        [0.02, "good"],
        [0.049, "good"],
        [0.05, "inaccuracy"],
        [0.099, "inaccuracy"],
        [0.1, "mistake"],
        [0.199, "mistake"],
        [0.2, "blunder"],
    ])("loss %s is %s", (loss, kind) => {
        expect(classifyMove({ before: 0.8, after: 0.8 - Number(loss), isBest: false }).kind).toBe(
            kind,
        );
    });
    it("handles best, forced, book, great and sound sacrifices", () => {
        const base = { before: 0.55, after: 0.55, isBest: true };
        expect(classifyMove(base).kind).toBe("best");
        expect(classifyMove({ ...base, forced: true }).kind).toBe("forced");
        expect(classifyMove({ ...base, book: true }).kind).toBe("book");
        expect(classifyMove({ ...base, great: true }).kind).toBe("great");
        expect(classifyMove({ ...base, sacrifice: true }).kind).toBe("brilliant");
        expect(classifyMove({ ...base, before: 0.99, after: 0.99, sacrifice: true }).kind).toBe(
            "best",
        );
        expect(classifyMove({ ...base, isBest: false, after: 0.1, sacrifice: true }).kind).toBe(
            "blunder",
        );
    });
    it("only marks a missed opportunity when the opponent created a winning chance", () => {
        const input = { before: 0.75, after: 0.59, isBest: false };
        expect(classifyMove({ ...input, beforeOpponent: 0.5 }).kind).toBe("miss");
        expect(classifyMove({ ...input, beforeOpponent: 0.8 }).kind).toBe("mistake");
    });
    it("uses WDL expected points rather than counting a draw as a loss", () => {
        expect(expectedScore({ value: { type: "cp", value: 0 }, wdl: [10, 980, 10] })).toBe(0.5);
    });
    it("does not rate unanalysed moves, and recognises a genuine opening position", () => {
        const position = Chess.default();
        const root = defaultTree().root;
        const move = parseUci("e2e4")!;
        position.play(move);
        root.children.push(
            createNode({ fen: makeFen(position.toSetup()), halfMoves: 1, move, san: "e4" }),
        );
        expect(reviewAtPath(root, [0])).toBeNull();
        root.engineBestMove = { uci: "e2e4", san: "e4" };
        root.score = { value: { type: "cp", value: 20 }, wdl: [100, 800, 100] };
        root.children[0].score = root.score;
        expect(reviewAtPath(root, [0])?.kind).toBe("book");
    });
});
