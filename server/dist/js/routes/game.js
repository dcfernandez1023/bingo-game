"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const createGame_1 = require("../controller/createGame");
const joinGame_1 = require("../controller/joinGame");
const router = express_1.default.Router();
router.post("/game", createGame_1.createGame);
router.post("/join", joinGame_1.joinGame);
exports.default = router;
