/* eslint-disable @typescript-eslint/no-unused-vars */
import { Socket, Server as SocketIOServer } from "socket.io";
import {
  GAME_ID_COOKIE,
  PLAYER_ID_COOKIE,
  SESSION_ID_COOKIE,
} from "../constants";
import GAME_MANAGER from "../core/GameManager";
import InfoError from "../errors/InfoError";
import { DeleteGameRequestSchema } from "../types/deleteRequest";
import { JoinGameRequestSchema } from "../types/joinRequest";
import { LeaveGameRequestSchema } from "../types/leaveRequest";
import {
  PatternPayloadSchema,
  PurchaseRequestPayload,
  PurchaseRequestPayloadSchema,
} from "../types/Game";

export const initHandlers = (
  io: SocketIOServer,
  socket: Socket,
  cookies: Record<string, string>,
) => {
  console.log("Initializing socket handlers");
  return {
    subscribe: (d: string) => subscribe(d, io, socket, cookies),
    deleteGame: (d: string) => deleteGame(d, io, socket, cookies),
    joinGamePoll: (d: string) => joinGamePoll(d, io, socket, cookies),
    joinGame: (d: string) => joinGame(d, io, socket, cookies),
    leaveGame: (d: string) => leaveGame(d, io, socket, cookies),
    disconnect: (d: string) => disconnect(d, io, socket, cookies),
    pattern: (d: string) => pattern(d, io, socket, cookies),
    clearPattern: (d: string) => clearPattern(d, io, socket, cookies),
    startRound: (d: string) => startRound(d, io, socket, cookies),
    endRound: (d: string) => endRound(d, io, socket, cookies),
    shuffle: (d: string) => shuffle(d, io, socket, cookies),
    requestCards: (d: string) => requestCards(d, io, socket, cookies),
    handleCardRequest: (d: string) => handleCardRequest(d, io, socket, cookies),
    autofillCards: (d: string) => autofillCards(d, io, socket, cookies),
    selectCell: (d: string) => selectCell(d, io, socket, cookies),
    sendChatMessage: (d: string) => sendChatMessage(d, io, socket, cookies),
  };
};

export const subscribe = async (
  d: string,
  io: SocketIOServer,
  socket: Socket,
  cookies: Record<string, string>,
) => {
  try {
    const { gameId } = extractCookies(cookies);
    if (gameId && GAME_MANAGER.isGame(gameId)) {
      await socket.join(gameId);
      io.to(gameId).emit("notify", JSON.stringify(GAME_MANAGER.games[gameId]));
    } else {
      throw new InfoError(
        "Failed to subscribe to game. No game ID was found or the game does not exist",
      );
    }
  } catch (e) {
    console.error(e);
    socket.emit("error", JSON.stringify({ error: (e as Error).message }));
  }
};

export const deleteGame = (
  d: string,
  io: SocketIOServer,
  socket: Socket,
  cookies: Record<string, string>,
) => {
  try {
    const deleteRequestData = DeleteGameRequestSchema.parse(JSON.parse(d));
    const { sessionId } = extractCookies(cookies);
    const result = GAME_MANAGER.delete(deleteRequestData.gameId, sessionId);
    if (result) {
      io.to(deleteRequestData.gameId).emit("notify", null);
      io.socketsLeave(deleteRequestData.gameId);
    } else {
      console.log(
        `[delete_game] Deleted game ${deleteRequestData.gameId} successfully`,
      );
      throw new Error("Failed to delete game");
    }
  } catch (e) {
    console.error(e);
    socket.emit("error", JSON.stringify({ error: (e as Error).message }));
  }
};

export const joinGamePoll = (
  d: string,
  io: SocketIOServer,
  socket: Socket,
  cookies: Record<string, string>,
) => {
  try {
    const { gameId, playerId } = extractCookies(cookies);
    const game = GAME_MANAGER.games[gameId];
    if (game) {
      if (game.players[playerId])
        socket.emit(
          "join_game_poll",
          JSON.stringify({ status: "existing", playerId: playerId }),
        );
      else
        socket.emit(
          "join_game_poll",
          JSON.stringify({ status: "new", playerId: playerId }),
        );
    } else {
      socket.emit(
        "join_game_poll",
        JSON.stringify({ status: "no such game", playerId: playerId }),
      );
    }
  } catch (e) {
    console.error(e);
    socket.emit("error", JSON.stringify({ error: (e as Error).message }));
  }
};

export const joinGame = async (
  d: string,
  io: SocketIOServer,
  socket: Socket,
  cookies: Record<string, string>,
) => {
  try {
    const joinGameData = JoinGameRequestSchema.parse(JSON.parse(d));
    const { gameId, playerId } = extractCookies(cookies);
    if (
      socket.rooms.size >= 2 ||
      (GAME_MANAGER.isGame(gameId) && GAME_MANAGER.games[gameId].isRoundActive)
    ) {
      throw new InfoError(
        "Failed to join game. Either the game ID is not valid, you are already in a game, or the game is in an active round",
      );
    }
    const result = GAME_MANAGER.join(joinGameData.name, gameId, playerId);
    console.log(
      result
        ? `[join_game] Player ${playerId} joined game ${gameId}`
        : `[join_game] Player ${playerId} not joining game ${gameId}`,
    );
    if (result) {
      await socket.join(gameId); // Joins the socket room
      console.log(`[join_game] Socket ${socket.id} joined room ${gameId}`);
      io.to(gameId).emit(JSON.stringify(GAME_MANAGER.games[gameId]));
      socket.emit("join_game", "success");
    } else {
      throw new InfoError(
        "An unexpected error occurred while trying to join the game",
        "error",
      );
    }
  } catch (e) {
    console.error(e);
    socket.emit("error", JSON.stringify({ error: (e as Error).message }));
  }
};

export const leaveGame = (
  d: string,
  io: SocketIOServer,
  socket: Socket,
  cookies: Record<string, string>,
) => {
  try {
    const leaveGameData = LeaveGameRequestSchema.parse(JSON.parse(d));
    const { playerId } = extractCookies(cookies);
    const result = GAME_MANAGER.leave(leaveGameData.gameId, playerId);
    if (result) {
      console.log(
        `[leave_game] Player ${playerId} Left game ${leaveGameData.gameId} successfully`,
      );
      const socketToDelete = io.sockets.sockets.get(socket.id);
      if (socketToDelete) {
        socketToDelete.disconnect();
        console.log(`[leave_game] Socket ${socket.id} left`);
        socket.emit(
          "notify",
          JSON.stringify(GAME_MANAGER.games[leaveGameData.gameId]),
        );
      }
    } else {
      socket.emit("leave_game", "failed");
    }
  } catch (e) {
    console.error(e);
    socket.emit("error", JSON.stringify({ error: (e as Error).message }));
  }
};

export const disconnect = (
  d: string,
  io: SocketIOServer,
  socket: Socket,
  cookies: Record<string, string>,
) => {
  try {
    console.log(`[disconnect] Socket ${socket.id} disconnected`);
  } catch (e) {
    console.error(e);
    console.log(`[disconnect] Socket ${socket.id} failed to disconnect`);
  }
};

export const pattern = (
  d: string,
  io: SocketIOServer,
  socket: Socket,
  cookies: Record<string, string>,
) => {
  try {
    const { gameId, sessionId } = extractCookies(cookies);
    const patternPayload = PatternPayloadSchema.parse(JSON.parse(d));
    const updatedGame = GAME_MANAGER.editPattern(
      gameId,
      sessionId,
      patternPayload.row,
      patternPayload.col,
    );
    if (updatedGame) io.to(gameId).emit("notify", JSON.stringify(updatedGame));
    else throw new Error("Failed to update game");
  } catch (e) {
    console.error(e);
    socket.emit("error", JSON.stringify({ error: (e as Error).message }));
  }
};

export const clearPattern = (
  d: string,
  io: SocketIOServer,
  socket: Socket,
  cookies: Record<string, string>,
) => {
  try {
    const { gameId, sessionId } = extractCookies(cookies);
    const updatedGame = GAME_MANAGER.clearPattern(gameId, sessionId);
    if (updatedGame) io.to(gameId).emit("notify", JSON.stringify(updatedGame));
    else throw new Error("Failed to update game");
  } catch (e) {
    console.error(e);
    socket.emit("error", JSON.stringify({ error: (e as Error).message }));
  }
};

export const startRound = (
  d: string,
  io: SocketIOServer,
  socket: Socket,
  cookies: Record<string, string>,
) => {
  try {
    const { gameId, sessionId } = extractCookies(cookies);
    const updatedGame = GAME_MANAGER.startRound(gameId, sessionId);
    if (updatedGame) io.to(gameId).emit("notify", JSON.stringify(updatedGame));
    else throw new Error("Failed to update game");
  } catch (e) {
    console.error(e);
    socket.emit("error", JSON.stringify({ error: (e as Error).message }));
  }
};

export const endRound = (
  d: string,
  io: SocketIOServer,
  socket: Socket,
  cookies: Record<string, string>,
) => {
  try {
    const { gameId, sessionId } = extractCookies(cookies);
    const updatedGame = GAME_MANAGER.endRound(gameId, sessionId);
    if (updatedGame) io.to(gameId).emit("notify", JSON.stringify(updatedGame));
    else throw new Error("Failed to update game");
  } catch (e) {
    console.error(e);
    socket.emit("error", JSON.stringify({ error: (e as Error).message }));
  }
};

export const shuffle = (
  d: string,
  io: SocketIOServer,
  socket: Socket,
  cookies: Record<string, string>,
) => {
  try {
    const { gameId, sessionId } = extractCookies(cookies);
    const updatedGame = GAME_MANAGER.shuffle(gameId, sessionId);
    if (updatedGame) io.to(gameId).emit("notify", JSON.stringify(updatedGame));
    else throw new Error("Failed to update game");
  } catch (e) {
    console.error(e);
    socket.emit("error", JSON.stringify({ error: (e as Error).message }));
  }
};

export const requestCards = (
  d: string,
  io: SocketIOServer,
  socket: Socket,
  cookies: Record<string, string>,
) => {
  try {
    const { playerId, gameId } = extractCookies(cookies);
    const payload: PurchaseRequestPayload = PurchaseRequestPayloadSchema.parse(
      JSON.parse(d),
    );
    const updatedGame = GAME_MANAGER.requestCards(
      gameId,
      playerId,
      payload.numCardsToPurchase,
    );
    if (updatedGame) io.to(gameId).emit("notify", JSON.stringify(updatedGame));
    else throw new Error("Failed to update game");
  } catch (e) {
    console.error(e);
    socket.emit("error", JSON.stringify({ error: (e as Error).message }));
  }
};

export const handleCardRequest = (
  d: string,
  io: SocketIOServer,
  socket: Socket,
  cookies: Record<string, string>,
) => {
  try {
    const payload = JSON.parse(d) as {
      cardRequestId: string;
      action: "grant" | "decline";
    };
    if (!payload.cardRequestId) return;

    const { gameId, sessionId } = extractCookies(cookies);
    let updatedGame;
    if (payload.action === "grant") {
      updatedGame = GAME_MANAGER.grantCards(
        gameId,
        sessionId,
        payload.cardRequestId,
      );
    } else {
      updatedGame = GAME_MANAGER.declineCards(
        gameId,
        sessionId,
        payload.cardRequestId,
      );
    }
    if (updatedGame) io.to(gameId).emit("notify", JSON.stringify(updatedGame));
    else throw new Error("Failed to update game");
  } catch (e) {
    console.error(e);
    socket.emit("error", JSON.stringify({ error: (e as Error).message }));
  }
};

export const autofillCards = (
  d: string,
  io: SocketIOServer,
  socket: Socket,
  cookies: Record<string, string>,
) => {
  try {
    const { playerId, gameId } = extractCookies(cookies);
    const { updatedGame, autofillResults } = GAME_MANAGER.autofill_cards(
      gameId,
      playerId,
    );
    // if (updatedGame) io.to(gameId).emit("notify", JSON.stringify(updatedGame));
    if (updatedGame) {
      socket.emit("notify", JSON.stringify(updatedGame));
      socket.emit("autofill_card", autofillResults);
    } else throw new Error("Failed to update game");
  } catch (e) {
    console.error(e);
    socket.emit("error", JSON.stringify({ error: (e as Error).message }));
  }
};

export const selectCell = (
  d: string,
  io: SocketIOServer,
  socket: Socket,
  cookies: Record<string, string>,
) => {
  try {
    const payload = JSON.parse(d) as {
      cardIndex: number;
      cell: string;
    };
    const { playerId, gameId } = extractCookies(cookies);
    const updatedGame = GAME_MANAGER.selectCell(
      gameId,
      playerId,
      payload.cardIndex,
      payload.cell,
    );
    // if (updatedGame) io.to(gameId).emit("notify", JSON.stringify(updatedGame));
    if (updatedGame) socket.emit("notify", JSON.stringify(updatedGame));
    else throw new Error("Failed to update game");
  } catch (e) {
    console.error(e);
    socket.emit("error", JSON.stringify({ error: (e as Error).message }));
  }
};

export const sendChatMessage = (
  d: string,
  io: SocketIOServer,
  socket: Socket,
  cookies: Record<string, string>,
) => {
  try {
    const payload = JSON.parse(d) as {
      message: string;
    };
    if (!payload.message) throw new Error("Missing message");
    const { gameId, playerId, sessionId } = extractCookies(cookies);
    const senderId =
      sessionId && GAME_MANAGER.isAuthorized(gameId, sessionId)
        ? "HOST"
        : playerId;
    if (!gameId) throw new Error("Game ID not provided");
    const updatedGame = GAME_MANAGER.sendChatMessage(
      gameId,
      senderId,
      payload.message,
    );
    if (updatedGame) {
      io.to(gameId).emit("notify", JSON.stringify(updatedGame));
    } else {
      throw new Error("Failed to send message");
    }
  } catch (e) {
    console.error(e);
    socket.emit("error", JSON.stringify({ error: (e as Error).message }));
  }
};

const extractCookies = (cookies: Record<string, string>) => {
  const gameId = cookies[GAME_ID_COOKIE];
  const sessionId = cookies[SESSION_ID_COOKIE];
  const playerId = cookies[PLAYER_ID_COOKIE];
  return { gameId, sessionId, playerId };
};
