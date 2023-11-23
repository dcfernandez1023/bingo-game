"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendChatMessage = exports.selectCell = exports.autofillCards = exports.handleCardRequest = exports.requestCards = exports.shuffle = exports.endRound = exports.startRound = exports.clearPattern = exports.pattern = exports.disconnect = exports.leaveGame = exports.joinGame = exports.joinGamePoll = exports.deleteGame = exports.subscribe = exports.initHandlers = void 0;
const constants_1 = require("../constants");
const GameManager_1 = __importDefault(require("../core/GameManager"));
const InfoError_1 = __importDefault(require("../errors/InfoError"));
const deleteRequest_1 = require("../types/deleteRequest");
const joinRequest_1 = require("../types/joinRequest");
const leaveRequest_1 = require("../types/leaveRequest");
const Game_1 = require("../types/Game");
const initHandlers = (io, socket, cookies) => {
    console.log("Initializing socket handlers");
    return {
        subscribe: (d) => (0, exports.subscribe)(d, io, socket, cookies),
        deleteGame: (d) => (0, exports.deleteGame)(d, io, socket, cookies),
        joinGamePoll: (d) => (0, exports.joinGamePoll)(d, io, socket, cookies),
        joinGame: (d) => (0, exports.joinGame)(d, io, socket, cookies),
        leaveGame: (d) => (0, exports.leaveGame)(d, io, socket, cookies),
        disconnect: (d) => (0, exports.disconnect)(d, io, socket, cookies),
        pattern: (d) => (0, exports.pattern)(d, io, socket, cookies),
        clearPattern: (d) => (0, exports.clearPattern)(d, io, socket, cookies),
        startRound: (d) => (0, exports.startRound)(d, io, socket, cookies),
        endRound: (d) => (0, exports.endRound)(d, io, socket, cookies),
        shuffle: (d) => (0, exports.shuffle)(d, io, socket, cookies),
        requestCards: (d) => (0, exports.requestCards)(d, io, socket, cookies),
        handleCardRequest: (d) => (0, exports.handleCardRequest)(d, io, socket, cookies),
        autofillCards: (d) => (0, exports.autofillCards)(d, io, socket, cookies),
        selectCell: (d) => (0, exports.selectCell)(d, io, socket, cookies),
        sendChatMessage: (d) => (0, exports.sendChatMessage)(d, io, socket, cookies),
    };
};
exports.initHandlers = initHandlers;
const subscribe = (d, io, socket, cookies) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { gameId } = extractCookies(cookies);
        if (gameId && GameManager_1.default.isGame(gameId)) {
            yield socket.join(gameId);
            io.to(gameId).emit("notify", JSON.stringify(GameManager_1.default.games[gameId]));
        }
        else {
            throw new InfoError_1.default("Failed to subscribe to game. No game ID was found or the game does not exist");
        }
    }
    catch (e) {
        console.error(e);
        socket.emit("error", JSON.stringify({ error: e.message }));
    }
});
exports.subscribe = subscribe;
const deleteGame = (d, io, socket, cookies) => {
    try {
        const deleteRequestData = deleteRequest_1.DeleteGameRequestSchema.parse(JSON.parse(d));
        const { sessionId } = extractCookies(cookies);
        const result = GameManager_1.default.delete(deleteRequestData.gameId, sessionId);
        if (result) {
            io.to(deleteRequestData.gameId).emit("notify", null);
            io.socketsLeave(deleteRequestData.gameId);
        }
        else {
            console.log(`[delete_game] Deleted game ${deleteRequestData.gameId} successfully`);
            throw new Error("Failed to delete game");
        }
    }
    catch (e) {
        console.error(e);
        socket.emit("error", JSON.stringify({ error: e.message }));
    }
};
exports.deleteGame = deleteGame;
const joinGamePoll = (d, io, socket, cookies) => {
    try {
        const { gameId, playerId } = extractCookies(cookies);
        const game = GameManager_1.default.games[gameId];
        if (game) {
            if (game.players[playerId])
                socket.emit("join_game_poll", JSON.stringify({ status: "existing", playerId: playerId }));
            else
                socket.emit("join_game_poll", JSON.stringify({ status: "new", playerId: playerId }));
        }
        else {
            socket.emit("join_game_poll", JSON.stringify({ status: "no such game", playerId: playerId }));
        }
    }
    catch (e) {
        console.error(e);
        socket.emit("error", JSON.stringify({ error: e.message }));
    }
};
exports.joinGamePoll = joinGamePoll;
const joinGame = (d, io, socket, cookies) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const joinGameData = joinRequest_1.JoinGameRequestSchema.parse(JSON.parse(d));
        const { gameId, playerId } = extractCookies(cookies);
        if (socket.rooms.size >= 2 ||
            (GameManager_1.default.isGame(gameId) && GameManager_1.default.games[gameId].isRoundActive)) {
            throw new InfoError_1.default("Failed to join game. Either the game ID is not valid, you are already in a game, or the game is in an active round");
        }
        const result = GameManager_1.default.join(joinGameData.name, gameId, playerId);
        console.log(result
            ? `[join_game] Player ${playerId} joined game ${gameId}`
            : `[join_game] Player ${playerId} not joining game ${gameId}`);
        if (result) {
            yield socket.join(gameId); // Joins the socket room
            console.log(`[join_game] Socket ${socket.id} joined room ${gameId}`);
            io.to(gameId).emit(JSON.stringify(GameManager_1.default.games[gameId]));
            socket.emit("join_game", "success");
        }
        else {
            throw new InfoError_1.default("An unexpected error occurred while trying to join the game", "error");
        }
    }
    catch (e) {
        console.error(e);
        socket.emit("error", JSON.stringify({ error: e.message }));
    }
});
exports.joinGame = joinGame;
const leaveGame = (d, io, socket, cookies) => {
    try {
        const leaveGameData = leaveRequest_1.LeaveGameRequestSchema.parse(JSON.parse(d));
        const { playerId } = extractCookies(cookies);
        const result = GameManager_1.default.leave(leaveGameData.gameId, playerId);
        if (result) {
            console.log(`[leave_game] Player ${playerId} Left game ${leaveGameData.gameId} successfully`);
            const socketToDelete = io.sockets.sockets.get(socket.id);
            if (socketToDelete) {
                socketToDelete.disconnect();
                console.log(`[leave_game] Socket ${socket.id} left`);
                socket.emit("notify", JSON.stringify(GameManager_1.default.games[leaveGameData.gameId]));
            }
        }
        else {
            socket.emit("leave_game", "failed");
        }
    }
    catch (e) {
        console.error(e);
        socket.emit("error", JSON.stringify({ error: e.message }));
    }
};
exports.leaveGame = leaveGame;
const disconnect = (d, io, socket, cookies) => {
    try {
        console.log(`[disconnect] Socket ${socket.id} disconnected`);
    }
    catch (e) {
        console.error(e);
        console.log(`[disconnect] Socket ${socket.id} failed to disconnect`);
    }
};
exports.disconnect = disconnect;
const pattern = (d, io, socket, cookies) => {
    try {
        const { gameId, sessionId } = extractCookies(cookies);
        const patternPayload = Game_1.PatternPayloadSchema.parse(JSON.parse(d));
        const updatedGame = GameManager_1.default.editPattern(gameId, sessionId, patternPayload.row, patternPayload.col);
        if (updatedGame)
            io.to(gameId).emit("notify", JSON.stringify(updatedGame));
        else
            throw new Error("Failed to update game");
    }
    catch (e) {
        console.error(e);
        socket.emit("error", JSON.stringify({ error: e.message }));
    }
};
exports.pattern = pattern;
const clearPattern = (d, io, socket, cookies) => {
    try {
        const { gameId, sessionId } = extractCookies(cookies);
        const updatedGame = GameManager_1.default.clearPattern(gameId, sessionId);
        if (updatedGame)
            io.to(gameId).emit("notify", JSON.stringify(updatedGame));
        else
            throw new Error("Failed to update game");
    }
    catch (e) {
        console.error(e);
        socket.emit("error", JSON.stringify({ error: e.message }));
    }
};
exports.clearPattern = clearPattern;
const startRound = (d, io, socket, cookies) => {
    try {
        const { gameId, sessionId } = extractCookies(cookies);
        const updatedGame = GameManager_1.default.startRound(gameId, sessionId);
        if (updatedGame)
            io.to(gameId).emit("notify", JSON.stringify(updatedGame));
        else
            throw new Error("Failed to update game");
    }
    catch (e) {
        console.error(e);
        socket.emit("error", JSON.stringify({ error: e.message }));
    }
};
exports.startRound = startRound;
const endRound = (d, io, socket, cookies) => {
    try {
        const { gameId, sessionId } = extractCookies(cookies);
        const updatedGame = GameManager_1.default.endRound(gameId, sessionId);
        if (updatedGame)
            io.to(gameId).emit("notify", JSON.stringify(updatedGame));
        else
            throw new Error("Failed to update game");
    }
    catch (e) {
        console.error(e);
        socket.emit("error", JSON.stringify({ error: e.message }));
    }
};
exports.endRound = endRound;
const shuffle = (d, io, socket, cookies) => {
    try {
        const { gameId, sessionId } = extractCookies(cookies);
        const updatedGame = GameManager_1.default.shuffle(gameId, sessionId);
        if (updatedGame)
            io.to(gameId).emit("notify", JSON.stringify(updatedGame));
        else
            throw new Error("Failed to update game");
    }
    catch (e) {
        console.error(e);
        socket.emit("error", JSON.stringify({ error: e.message }));
    }
};
exports.shuffle = shuffle;
const requestCards = (d, io, socket, cookies) => {
    try {
        const { playerId, gameId } = extractCookies(cookies);
        const payload = Game_1.PurchaseRequestPayloadSchema.parse(JSON.parse(d));
        const updatedGame = GameManager_1.default.requestCards(gameId, playerId, payload.numCardsToPurchase);
        if (updatedGame)
            io.to(gameId).emit("notify", JSON.stringify(updatedGame));
        else
            throw new Error("Failed to update game");
    }
    catch (e) {
        console.error(e);
        socket.emit("error", JSON.stringify({ error: e.message }));
    }
};
exports.requestCards = requestCards;
const handleCardRequest = (d, io, socket, cookies) => {
    try {
        const payload = JSON.parse(d);
        if (!payload.cardRequestId)
            return;
        const { gameId, sessionId } = extractCookies(cookies);
        let updatedGame;
        if (payload.action === "grant") {
            updatedGame = GameManager_1.default.grantCards(gameId, sessionId, payload.cardRequestId);
        }
        else {
            updatedGame = GameManager_1.default.declineCards(gameId, sessionId, payload.cardRequestId);
        }
        if (updatedGame)
            io.to(gameId).emit("notify", JSON.stringify(updatedGame));
        else
            throw new Error("Failed to update game");
    }
    catch (e) {
        console.error(e);
        socket.emit("error", JSON.stringify({ error: e.message }));
    }
};
exports.handleCardRequest = handleCardRequest;
const autofillCards = (d, io, socket, cookies) => {
    try {
        const { playerId, gameId } = extractCookies(cookies);
        const { updatedGame, autofillResults } = GameManager_1.default.autofill_cards(gameId, playerId);
        // if (updatedGame) io.to(gameId).emit("notify", JSON.stringify(updatedGame));
        if (updatedGame) {
            socket.emit("notify", JSON.stringify(updatedGame));
            socket.emit("autofill_card", autofillResults);
        }
        else
            throw new Error("Failed to update game");
    }
    catch (e) {
        console.error(e);
        socket.emit("error", JSON.stringify({ error: e.message }));
    }
};
exports.autofillCards = autofillCards;
const selectCell = (d, io, socket, cookies) => {
    try {
        const payload = JSON.parse(d);
        const { playerId, gameId } = extractCookies(cookies);
        const updatedGame = GameManager_1.default.selectCell(gameId, playerId, payload.cardIndex, payload.cell);
        // if (updatedGame) io.to(gameId).emit("notify", JSON.stringify(updatedGame));
        if (updatedGame)
            socket.emit("notify", JSON.stringify(updatedGame));
        else
            throw new Error("Failed to update game");
    }
    catch (e) {
        console.error(e);
        socket.emit("error", JSON.stringify({ error: e.message }));
    }
};
exports.selectCell = selectCell;
const sendChatMessage = (d, io, socket, cookies) => {
    try {
        const payload = JSON.parse(d);
        if (!payload.message)
            throw new Error("Missing message");
        const { gameId, playerId, sessionId } = extractCookies(cookies);
        const senderId = sessionId && GameManager_1.default.isAuthorized(gameId, sessionId)
            ? "HOST"
            : playerId;
        if (!gameId)
            throw new Error("Game ID not provided");
        const updatedGame = GameManager_1.default.sendChatMessage(gameId, senderId, payload.message);
        if (updatedGame) {
            io.to(gameId).emit("notify", JSON.stringify(updatedGame));
        }
        else {
            throw new Error("Failed to send message");
        }
    }
    catch (e) {
        console.error(e);
        socket.emit("error", JSON.stringify({ error: e.message }));
    }
};
exports.sendChatMessage = sendChatMessage;
const extractCookies = (cookies) => {
    const gameId = cookies[constants_1.GAME_ID_COOKIE];
    const sessionId = cookies[constants_1.SESSION_ID_COOKIE];
    const playerId = cookies[constants_1.PLAYER_ID_COOKIE];
    return { gameId, sessionId, playerId };
};
