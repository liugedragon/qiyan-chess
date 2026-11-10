import { describe, expect, it } from "vitest";
import { gameSnapshotSchema, uciMoveSchema, WebSocketGamePort } from "./game-port";

const snapshot = {
  protocolVersion: 1, roomId: "room", revision: 1,
  initialFen: "start", fen: "position", moves: ["e2e4"],
  whiteTimeMs: 30000, blackTimeMs: 30000, status: "playing", result: "*",
};

describe("portable room protocol", () => {
  it("accepts promotions and rejects malformed moves and negative clocks", () => {
    expect(uciMoveSchema.safeParse("a7a8q").success).toBe(true);
    expect(uciMoveSchema.safeParse("e2e9").success).toBe(false);
    expect(gameSnapshotSchema.safeParse({ ...snapshot, whiteTimeMs: -1 }).success).toBe(false);
  });
  it("ignores duplicate and out-of-order snapshots and reports bad payloads", () => {
    const socket = new EventTarget() as WebSocket;
    const errors: string[] = [];
    const port = new WebSocketGamePort(socket, (message) => errors.push(message));
    const revisions: number[] = [];
    const unsubscribe = port.subscribe((s) => revisions.push(s.revision));
    for (const revision of [1, 1, 0, 2]) {
      socket.dispatchEvent(new MessageEvent("message", { data: JSON.stringify({ ...snapshot, revision }) }));
    }
    socket.dispatchEvent(new MessageEvent("message", { data: "bad JSON" }));
    expect(revisions).toEqual([1, 2]);
    expect(errors).toHaveLength(1);
    unsubscribe();
    socket.dispatchEvent(new MessageEvent("message", { data: JSON.stringify({ ...snapshot, revision: 3 }) }));
    expect(revisions).toEqual([1, 2]);
  });
});
