import express from "express";
import { createGame } from "../controller/createGame";
import { joinGame } from "../controller/joinGame";

const router = express.Router();

router.post("/game", createGame);
router.post("/join", joinGame);

export default router;
