"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientCors = void 0;
const constants_1 = require("../constants");
const clientCors = (req, res, next) => {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    if (constants_1.CLIENT_HOST) {
        res.setHeader("Access-Control-Allow-Origin", constants_1.CLIENT_HOST);
        console.log(`DEV CLIENT HOST: ${constants_1.CLIENT_HOST}`);
    }
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
};
exports.clientCors = clientCors;
