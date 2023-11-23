import cron from "node-cron";
import { Server as SocketIOServer } from "socket.io";
import GAME_MANAGER from "./GameManager";

export const scheduleCleanup = (io: SocketIOServer) => {
  cron
    .schedule("*/10 * * * *", () => {
      console.log("Running game cleanup");
      const currentDate = new Date().getTime();
      const gamesToDelete = [];
      for (const gameId of Object.keys(GAME_MANAGER.games)) {
        const game = GAME_MANAGER.games[gameId];
        const timeDifference = currentDate - game.createdOn;
        const minutesDifference = timeDifference / (1000 * 60);
        // Delete if game has existed longer than 1 day
        if (minutesDifference >= 1440) {
          gamesToDelete.push(gameId);
        }
      }
      for (const gameId of gamesToDelete) {
        console.log(`\tDeleting game ${gameId}`);
        delete GAME_MANAGER.games[gameId];
        io.to(gameId).emit("notify", null);
        io.socketsLeave(gameId);
      }
    })
    .start();
};
