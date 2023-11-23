/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import axios, { AxiosError } from "axios";
import { type Socket, io } from "socket.io-client";

const HOST = process.env.REACT_APP_SERVER_HOST ?? "";
console.log(HOST);
let SOCKET: Socket | null = null;
let SOCKET_ERROR_HANDLER = (errorMessage: string) => {
  console.error(errorMessage);
};

export enum GAME_EVENTS {
  NOTIFY = "notify",
}

export const initSocket = (
  socketErrorHandler?: (errorMessage: string) => void,
) => {
  if (socketErrorHandler) SOCKET_ERROR_HANDLER = socketErrorHandler;
  if (!SOCKET) {
    const connectionOptions = { withCredentials: true };
    SOCKET =
      HOST.length > 0 ? io(HOST, connectionOptions) : io("", connectionOptions);
    SOCKET.on("error", (d) => SOCKET_ERROR_HANDLER(JSON.parse(d).error));
  }
  return SOCKET;
};

export const createGame = async (name: string): Promise<string> => {
  try {
    const res = await axios.post(
      `${HOST}/game`,
      { name },
      { withCredentials: true },
    );
    return res.data.message;
  } catch (e) {
    console.error(e);
    if ((e as Error).name === "AxiosError") {
      const errorResponse: { error: string } = (e as AxiosError).response
        ?.data as { error: string };
      return errorResponse.error;
    }
    return "";
  }
};

export const subscribeToGame = (
  callback: (event: GAME_EVENTS, data: string) => void,
): void => {
  SOCKET = initSocket();
  if (!SOCKET.hasListeners(GAME_EVENTS.NOTIFY)) {
    console.log("subscribng to game");
    SOCKET.on(GAME_EVENTS.NOTIFY, (d: string) => {
      console.log("in notify callback");
      callback(GAME_EVENTS.NOTIFY, d);
    });
    SOCKET.emit("subscribe");
  }
};

export const patternSelect = (row: number, col: number) => {
  SOCKET = initSocket();
  SOCKET.emit("pattern", JSON.stringify({ row, col }));
};

export const clearPattern = () => {
  SOCKET = initSocket();
  SOCKET.emit("clear_pattern");
};

export const startRound = () => {
  SOCKET = initSocket();
  SOCKET.emit("start_round");
};

export const endRound = () => {
  SOCKET = initSocket();
  SOCKET.emit("end_round");
};

export const shuffle = () => {
  SOCKET = initSocket();
  SOCKET.emit("shuffle");
};

export const joinGameREST = async (gameId: string) => {
  try {
    const body = { name: "", gameId: gameId };
    const res = await axios.post(`${HOST}/join`, body, {
      withCredentials: true,
    });
    if (res.data.message === "Success") window.location.href = "/player";
    else alert(res.data.message); // TODO handle this more gracefully
  } catch (e) {
    console.error(e);
    if ((e as Error).name === "AxiosError") {
      const errorResponse: { error: string } = (e as AxiosError).response
        ?.data as { error: string };
      alert(errorResponse.error);
    } else {
      alert((e as Error).message);
    }
  }
};

export const makeJoinGameRequest = (
  onPollCallback: (result: { status: string; playerId: string }) => void,
) => {
  SOCKET = initSocket();
  if (!SOCKET.hasListeners("join_game_poll")) {
    SOCKET.on("join_game_poll", (d) => onPollCallback(JSON.parse(d)));
    SOCKET.emit("join_game_poll");
  }
};

export const joinGameSocket = (
  name: string,
  callback: (result: string) => void,
) => {
  SOCKET = initSocket();
  SOCKET.on("join_game", (d) => callback(d));
  SOCKET.emit("join_game", JSON.stringify({ name: name, gameId: "" }));
};

export const requestCards = (numCardsToPurchase: number) => {
  SOCKET = initSocket();
  SOCKET.emit(
    "request_cards",
    JSON.stringify({ numCardsToPurchase: numCardsToPurchase }),
  );
};

export const handleCardRequest = (
  cardRequestId: string,
  action: "grant" | "decline",
) => {
  SOCKET = initSocket();
  SOCKET.emit(
    "handle_card_request",
    JSON.stringify({ cardRequestId: cardRequestId, action: action }),
  );
};

export const autofillCards = (onCompletion: (results: string[]) => void) => {
  SOCKET = initSocket();
  if (!SOCKET.hasListeners("autofill_card")) {
    SOCKET.on("autofill_card", (d) => onCompletion(d ? d.split(",") : []));
  }
  SOCKET.emit("autofill_card");
};

export const selectCell = (cardIndex: number, cell: string) => {
  SOCKET = initSocket();
  SOCKET.emit("select_cell", JSON.stringify({ cardIndex, cell }));
};

export const sendChatMessage = (message: string) => {
  SOCKET = initSocket();
  SOCKET.emit("send_chat_message", JSON.stringify({ message }));
};

export const initSendChatMessageResponseListener = (callback: () => void) => {
  SOCKET = initSocket();
  SOCKET.on("send_chat_message", () => callback());
};

export const endGame = (gameId: string, callback: () => void) => {
  SOCKET = initSocket();
  SOCKET.emit("delete_game", JSON.stringify({ gameId }));
  callback();
};
