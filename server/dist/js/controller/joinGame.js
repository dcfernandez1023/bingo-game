"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinGame = void 0;
const InfoError_1 = __importDefault(require("../errors/InfoError"));
const joinRequest_1 = require("../types/joinRequest");
const constants_1 = require("../constants");
const GameManager_1 = __importDefault(require("../core/GameManager"));
const joinGame = (req, res, next) => {
    try {
        const joinReqData = joinRequest_1.JoinGameRequestSchema.parse(req.body);
        const gameId = joinReqData.gameId;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const playerIdFromCookie = req.cookies[constants_1.PLAYER_ID_COOKIE];
        if (GameManager_1.default.isGame(gameId) &&
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            !GameManager_1.default.games[gameId].isRoundActive) {
            const playerId = playerIdFromCookie &&
                GameManager_1.default.isPlayerInGame(gameId, playerIdFromCookie)
                ? playerIdFromCookie
                : GameManager_1.default.generatePlayerId(gameId);
            if (playerId) {
                res.cookie(constants_1.PLAYER_ID_COOKIE, playerId, {
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    httpOnly: true,
                    path: "/",
                });
                res.cookie(constants_1.GAME_ID_COOKIE, gameId, {
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    httpOnly: true,
                    path: "/",
                });
                console.log(`[/join] Player ${playerId} generated for game ${joinReqData.gameId}`);
                res.status(200).send({ message: "Success" });
            }
            else {
                throw new InfoError_1.default("An unexpected error occurred while joining the game", "error");
            }
        }
        else {
            throw new InfoError_1.default("Failed to join game. Either the game ID provided is invalid, you are currently the host of a game, or the round is active");
        }
        next();
    }
    catch (e) {
        console.error(e);
        res
            .status(500)
            .send({ error: e.message || "Failed to create game" });
    }
    finally {
        next();
    }
};
exports.joinGame = joinGame;
