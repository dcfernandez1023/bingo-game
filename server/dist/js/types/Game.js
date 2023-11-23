"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternPayloadSchema = exports.GameSchema = exports.MessageSchema = exports.PurchaseRequestPayloadSchema = exports.PurchaseRequestSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const Player_1 = require("./Player");
exports.PurchaseRequestSchema = zod_1.default.object({
    id: zod_1.default.string(),
    playerId: zod_1.default.string(),
    numCardsToPurchase: zod_1.default.number(),
    timestamp: zod_1.default.number(),
    isFulfilled: zod_1.default.boolean(),
});
exports.PurchaseRequestPayloadSchema = zod_1.default.object({
    numCardsToPurchase: zod_1.default.number(),
});
exports.MessageSchema = zod_1.default.object({
    id: zod_1.default.string(),
    senderId: zod_1.default.string(),
    message: zod_1.default.string(),
    timestamp: zod_1.default.number(),
});
exports.GameSchema = zod_1.default.object({
    id: zod_1.default.string(),
    sessionId: zod_1.default.string(),
    name: zod_1.default.string(),
    board: zod_1.default.array(zod_1.default.array(zod_1.default.number())),
    availableNumbers: zod_1.default.array(zod_1.default.number()),
    players: zod_1.default.record(zod_1.default.string(), Player_1.PlayerSchema),
    startedAt: zod_1.default.number(),
    isRoundActive: zod_1.default.boolean(),
    currentPattern: zod_1.default.array(zod_1.default.array(zod_1.default.number())),
    currentDrawn: zod_1.default.array(zod_1.default.string()),
    purchaseRequests: zod_1.default.array(exports.PurchaseRequestSchema),
    messages: zod_1.default.array(exports.MessageSchema),
    createdOn: zod_1.default.number(),
});
exports.PatternPayloadSchema = zod_1.default.object({
    row: zod_1.default.number(),
    col: zod_1.default.number(),
});
