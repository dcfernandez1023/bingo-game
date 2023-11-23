"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteGameRequestSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.DeleteGameRequestSchema = zod_1.default.object({
    gameId: zod_1.default.string(),
});
