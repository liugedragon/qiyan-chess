/** Platform-independent boundary for a future mobile client and room server.
 * No Tauri imports: this module can run in a browser or a phone WebView.
 * The server owns legality, clocks, seat authorization and result adjudication.
 */
import { z } from "zod";

export const uciMoveSchema = z.string().regex(/^[a-h][1-8][a-h][1-8][qrbn]?$/);
export const gameSnapshotSchema = z.object({
  protocolVersion: z.literal(1),
  roomId: z.string().min(1),
  revision: z.number().int().nonnegative(),
  initialFen: z.string().min(1),
  fen: z.string().min(1),
  moves: z.array(uciMoveSchema),
  whiteTimeMs: z.number().nonnegative().nullable(),
  blackTimeMs: z.number().nonnegative().nullable(),
  status: z.enum(["waiting", "playing", "finished"]),
  result: z.enum(["*", "1-0", "0-1", "1/2-1/2"]),
});
export type GameSnapshot = z.infer<typeof gameSnapshotSchema>;

export type RoomCommand =
  | { type: "create"; requestId: string; timeMs: number | null; incrementMs: number }
  | { type: "join"; requestId: string; roomId: string; resumeToken?: string }
  | { type: "sync"; requestId: string; roomId: string }
  | { type: "move"; requestId: string; roomId: string; expectedRevision: number; uci: string }
  | { type: "resign"; requestId: string; roomId: string; expectedRevision: number };

export interface GamePort {
  send(command: RoomCommand): void;
  subscribe(listener: (snapshot: GameSnapshot) => void): () => void;
  close(): void;
}

/** Adapter only; no server is shipped or contacted by the current desktop app.
 * Call join with a server-issued token after reconnecting, then request sync.
 * Tokens must stay in memory; deployments should use wss and server authentication.
 */
export class WebSocketGamePort implements GamePort {
  private listeners = new Set<(snapshot: GameSnapshot) => void>();
  private revisions = new Map<string, number>();
  constructor(private socket: WebSocket, private onError: (message: string) => void) {
    socket.addEventListener("message", this.receive);
  }
  private receive = (event: MessageEvent) => {
    try {
      const snapshot = gameSnapshotSchema.parse(JSON.parse(String(event.data)));
      if (snapshot.revision <= (this.revisions.get(snapshot.roomId) ?? -1)) return;
      this.revisions.set(snapshot.roomId, snapshot.revision);
      for (const listener of this.listeners) listener(snapshot);
    } catch { this.onError("Invalid room snapshot"); }
  };
  send(command: RoomCommand) {
    if (command.type === "move") uciMoveSchema.parse(command.uci);
    if (this.socket.readyState !== WebSocket.OPEN) throw new Error("Room connection is not open");
    this.socket.send(JSON.stringify({ protocolVersion: 1, ...command }));
  }
  subscribe(listener: (snapshot: GameSnapshot) => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
  close() {
    this.socket.removeEventListener("message", this.receive);
    this.listeners.clear();
    this.socket.close();
  }
}
