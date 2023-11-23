"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerSchema = exports.CardCellSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CardCellSchema = zod_1.default.object({
    val: zod_1.default.number(),
    isChecked: zod_1.default.boolean(),
});
exports.PlayerSchema = zod_1.default.object({
    id: zod_1.default.string(),
    name: zod_1.default.string(),
    joinedAt: zod_1.default.number(),
    cards: zod_1.default.array(zod_1.default.array(exports.CardCellSchema)),
    currentPurchaseRequestId: zod_1.default.string(),
});
