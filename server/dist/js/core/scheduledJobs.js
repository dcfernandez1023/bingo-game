"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleCleanup = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const GameManager_1 = __importDefault(require("./GameManager"));
const scheduleCleanup = (io) => {
    node_cron_1.default
        .schedule("*/1 * * * *", () => {
        console.log("Running game cleanup");
        const currentDate = new Date().getTime();
        const gamesToDelete = [];
        for (const gameId of Object.keys(GameManager_1.default.games)) {
            const game = GameManager_1.default.games[gameId];
            const timeDifference = currentDate - game.createdOn;
            const minutesDifference = timeDifference / (1000 * 60);
            // Delete if game has existed longer than 1 day
            if (minutesDifference >= 1440) {
                gamesToDelete.push(gameId);
            }
        }
        for (const gameId of gamesToDelete) {
            console.log(`\tDeleting game ${gameId}`);
            delete GameManager_1.default.games[gameId];
            io.to(gameId).emit("notify", null);
            io.socketsLeave(gameId);
        }
    })
        .start();
};
exports.scheduleCleanup = scheduleCleanup;
