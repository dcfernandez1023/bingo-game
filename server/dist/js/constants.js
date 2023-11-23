"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIENT_HOST = exports.PLAYER_ID_COOKIE = exports.GAME_ID_COOKIE = exports.SESSION_ID_COOKIE = void 0;
const clientHost_1 = require("./util/clientHost");
exports.SESSION_ID_COOKIE = "bingoGameSessionId";
exports.GAME_ID_COOKIE = "bingoGameId";
exports.PLAYER_ID_COOKIE = "bingoGamePlayerId";
exports.CLIENT_HOST = (0, clientHost_1.getClientHostForDevEnv)();
