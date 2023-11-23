"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InfoError extends Error {
    constructor(message, errorType) {
        super(message);
        this.errorType = errorType || "info";
        Object.setPrototypeOf(this, InfoError.prototype);
    }
}
exports.default = InfoError;
