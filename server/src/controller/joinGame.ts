import express from "express";
import InfoError from "../errors/InfoError";
import { JoinGameRequestSchema } from "../types/joinRequest";
import { PLAYER_ID_COOKIE, GAME_ID_COOKIE } from "../constants";
import GAME_MANAGER from "../core/GameManager";

export const joinGame = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const joinReqData = JoinGameRequestSchema.parse(req.body);
    const gameId = joinReqData.gameId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const playerIdFromCookie = req.cookies[PLAYER_ID_COOKIE] as string;
    if (
      GAME_MANAGER.isGame(gameId) &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      !GAME_MANAGER.games[gameId].isRoundActive
    ) {
      const playerId =
        playerIdFromCookie &&
        GAME_MANAGER.isPlayerInGame(gameId, playerIdFromCookie)
          ? playerIdFromCookie
          : GAME_MANAGER.generatePlayerId(gameId);
      if (playerId) {
        res.cookie(PLAYER_ID_COOKIE, playerId, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          path: "/",
        });
        res.cookie(GAME_ID_COOKIE, gameId, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          path: "/",
        });
        console.log(
          `[/join] Player ${playerId} generated for game ${joinReqData.gameId}`,
        );
        res.status(200).send({ message: "Success" });
      } else {
        throw new InfoError(
          "An unexpected error occurred while joining the game",
          "error",
        );
      }
    } else {
      throw new InfoError(
        "Failed to join game. Either the game ID provided is invalid, you are currently the host of a game, or the round is active",
      );
    }
    next();
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .send({ error: (e as Error).message || "Failed to create game" });
  } finally {
    next();
  }
};
