import { Socket, Server as SocketIOServer } from "socket.io";
import cookie from "cookie";
import { initHandlers } from "./handlers";

export const initSocketServer = (io: SocketIOServer) => {
  io.engine.on("initial_headers", (headers) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    headers["Access-Control-Allow-Credentials"] = "true";
  });
  io.engine.on("headers", (headers) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    headers["Access-Control-Allow-Credentials"] = "true";
  });

  io.on("connection", (socket: Socket) => {
    try {
      console.log(`[connection] Socket ${socket.id} connected`);
      const rawCookies = socket.handshake.headers.cookie;
      const cookies = rawCookies ? cookie.parse(rawCookies) : {};

      const handlers = initHandlers(io, socket, cookies);

      socket.on("subscribe", (d: string) => void handlers.subscribe(d));
      socket.on("delete_game", (d: string) => handlers.deleteGame(d));
      socket.on("join_game_poll", (d: string) => handlers.joinGamePoll(d));
      socket.on("join_game", (d: string) => handlers.joinGame(d));
      socket.on("leave_game", (d: string) => handlers.leaveGame(d));
      socket.on("disconnect", (d: string) => handlers.disconnect(d));
      socket.on("pattern", (d: string) => handlers.pattern(d));
      socket.on("clear_pattern", (d: string) => handlers.clearPattern(d));
      socket.on("start_round", (d: string) => handlers.startRound(d));
      socket.on("end_round", (d: string) => handlers.endRound(d));
      socket.on("shuffle", (d: string) => handlers.shuffle(d));
      socket.on("request_cards", (d: string) => handlers.requestCards(d));
      socket.on("handle_card_request", (d: string) =>
        handlers.handleCardRequest(d),
      );
      socket.on("autofill_card", (d: string) => handlers.autofillCards(d));
      socket.on("select_cell", (d: string) => handlers.selectCell(d));
      socket.on("send_chat_message", (d: string) =>
        handlers.sendChatMessage(d),
      );
    } catch (e) {
      console.log(
        `Error while establishing initial socket connection: ${
          (e as Error).message
        }`,
      );
    }
  });
};
