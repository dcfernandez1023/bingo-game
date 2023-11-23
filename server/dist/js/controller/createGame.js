"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGame = void 0;
const constants_1 = require("../constants");
const GameManager_1 = __importDefault(require("../core/GameManager"));
const InfoError_1 = __importDefault(require("../errors/InfoError"));
const createRequest_1 = require("../types/createRequest");
const createGame = (req, res, next) => {
    try {
        if (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        req.cookies[constants_1.SESSION_ID_COOKIE] &&
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            GameManager_1.default.isGame(req.cookies[constants_1.GAME_ID_COOKIE])) {
            // Do not create game if cookie is already set
            throw new InfoError_1.default("You are already the host of a live game. Go to /host to resume your game");
        }
        else {
            const gameReqData = createRequest_1.CreateGameRequestSchema.parse(req.body);
            const game = GameManager_1.default.createGame(gameReqData.name);
            if (!game)
                throw new InfoError_1.default("An unexpected error occurred when creating the game", "error");
            res.cookie(constants_1.SESSION_ID_COOKIE, game.sessionId, {
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                httpOnly: true,
                path: "/",
            });
            res.cookie(constants_1.GAME_ID_COOKIE, game.id, {
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                httpOnly: true,
                path: "/",
            });
            console.log(`[/game] Created game ${game.id}`);
            res.status(200).send({ message: "Success" });
        }
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
exports.createGame = createGame;
