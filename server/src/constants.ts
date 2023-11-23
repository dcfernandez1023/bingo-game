import { getClientHostForDevEnv } from "./util/clientHost";

export const SESSION_ID_COOKIE = "bingoGameSessionId";
export const GAME_ID_COOKIE = "bingoGameId";
export const PLAYER_ID_COOKIE = "bingoGamePlayerId";
export const CLIENT_HOST = getClientHostForDevEnv();
