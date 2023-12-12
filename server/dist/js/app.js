"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const clientCors_1 = require("./middleware/clientCors");
const index_1 = __importDefault(require("./routes/index"));
const game_1 = __importDefault(require("./routes/game"));
const constants_1 = require("./constants");
const socketIO_1 = require("./socket/socketIO");
const host_1 = require("./util/host");
const scheduledJobs_1 = require("./core/scheduledJobs");
const PORT = (0, host_1.getPort)();
const HOST = (0, host_1.getHost)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(clientCors_1.clientCors);
app.use(express_1.default.static(path_1.default.resolve("..", "client/build")));
app.use(index_1.default);
app.use(game_1.default);
const server = http_1.default.createServer(app);
const pingOptions = {
    pingInterval: 1000,
    pingTimeout: 3000,
};
const io = new socket_io_1.Server(server, constants_1.CLIENT_HOST
    ? Object.assign({ cors: { origin: constants_1.CLIENT_HOST } }, pingOptions) : pingOptions);
(0, socketIO_1.initSocketServer)(io);
(0, scheduledJobs_1.scheduleCleanup)(io);
server.listen(PORT, HOST, () => {
    console.log(`Environment: ${process.argv[2]}`);
    console.log(`Host: ${HOST} | Port: ${PORT}`);
    console.log("Server started successfully");
});
