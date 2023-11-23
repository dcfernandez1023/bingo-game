import express, { Express } from "express";
import "dotenv/config";
import http from "http";
import cookieParser from "cookie-parser";
import { Server as SocketIOServer } from "socket.io";
import path from "path";
import { clientCors } from "./middleware/clientCors";
import indexRoutes from "./routes/index";
import gameRoutes from "./routes/game";
import { CLIENT_HOST } from "./constants";
import { initSocketServer } from "./socket/socketIO";
import { getHost, getPort } from "./util/host";
import { scheduleCleanup } from "./core/scheduledJobs";

const PORT = getPort();
const HOST = getHost();

const app: Express = express();

app.use(express.json());
app.use(cookieParser());
app.use(clientCors);
app.use(express.static(path.resolve("..", "client/build")));
app.use(indexRoutes);
app.use(gameRoutes);

const server = http.createServer(app);

const io = new SocketIOServer(
  server,
  CLIENT_HOST
    ? {
        cors: { origin: CLIENT_HOST },
      }
    : {},
);
initSocketServer(io);
scheduleCleanup(io);

server.listen(PORT, HOST, () => {
  console.log(`Environment: ${process.argv[2]}`);
  console.log(`Host: ${HOST} | Port: ${PORT}`);
  console.log("Server started successfully");
});
