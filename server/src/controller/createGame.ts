import express from "express";
import { SESSION_ID_COOKIE, GAME_ID_COOKIE } from "../constants";
import GAME_MANAGER from "../core/GameManager";
import InfoError from "../errors/InfoError";
import { CreateGameRequestSchema } from "../types/createRequest";

export const createGame = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.cookies[SESSION_ID_COOKIE] &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      GAME_MANAGER.isGame(req.cookies[GAME_ID_COOKIE])
    ) {
      // Do not create game if cookie is already set
      throw new InfoError(
        "You are already the host of a live game. Go to /host to resume your game",
      );
    } else {
      const gameReqData = CreateGameRequestSchema.parse(req.body);
      const game = GAME_MANAGER.createGame(gameReqData.name);
      if (!game)
        throw new InfoError(
          "An unexpected error occurred when creating the game",
          "error",
        );
      res.cookie(SESSION_ID_COOKIE, game.sessionId, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        path: "/",
      });
      res.cookie(GAME_ID_COOKIE, game.id, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        path: "/",
      });
      console.log(`[/game] Created game ${game.id}`);
      res.status(200).send({ message: "Success" });
    }
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .send({ error: (e as Error).message || "Failed to create game" });
  } finally {
    next();
  }
};
