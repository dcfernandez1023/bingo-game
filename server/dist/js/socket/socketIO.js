"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = void 0;
const cookie_1 = __importDefault(require("cookie"));
const handlers_1 = require("./handlers");
const initSocketServer = (io) => {
    io.engine.on("initial_headers", (headers) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        headers["Access-Control-Allow-Credentials"] = "true";
    });
    io.engine.on("headers", (headers) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        headers["Access-Control-Allow-Credentials"] = "true";
    });
    io.on("connection", (socket) => {
        try {
            console.log(`[connection] Socket ${socket.id} connected`);
            const rawCookies = socket.handshake.headers.cookie;
            const cookies = rawCookies ? cookie_1.default.parse(rawCookies) : {};
            const handlers = (0, handlers_1.initHandlers)(io, socket, cookies);
            socket.on("subscribe", (d) => void handlers.subscribe(d));
            socket.on("delete_game", (d) => handlers.deleteGame(d));
            socket.on("join_game_poll", (d) => handlers.joinGamePoll(d));
            socket.on("join_game", (d) => handlers.joinGame(d));
            socket.on("leave_game", (d) => handlers.leaveGame(d));
            socket.on("disconnect", (d) => handlers.disconnect(d));
            socket.on("pattern", (d) => handlers.pattern(d));
            socket.on("clear_pattern", (d) => handlers.clearPattern(d));
            socket.on("start_round", (d) => handlers.startRound(d));
            socket.on("end_round", (d) => handlers.endRound(d));
            socket.on("shuffle", (d) => handlers.shuffle(d));
            socket.on("request_cards", (d) => handlers.requestCards(d));
            socket.on("handle_card_request", (d) => handlers.handleCardRequest(d));
            socket.on("autofill_card", (d) => handlers.autofillCards(d));
            socket.on("select_cell", (d) => handlers.selectCell(d));
            socket.on("send_chat_message", (d) => handlers.sendChatMessage(d));
        }
        catch (e) {
            console.log(`Error while establishing initial socket connection: ${e.message}`);
        }
    });
};
exports.initSocketServer = initSocketServer;
