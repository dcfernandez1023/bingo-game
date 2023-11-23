"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSessionId = void 0;
const crypto_1 = require("crypto");
const HASH_SIZE = 10;
const generateSessionId = () => {
    const buffer = (0, crypto_1.randomBytes)(HASH_SIZE);
    return buffer.toString("hex");
};
exports.generateSessionId = generateSessionId;
