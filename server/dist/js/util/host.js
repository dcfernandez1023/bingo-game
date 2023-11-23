"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPort = exports.getHost = void 0;
const network_1 = require("./network");
const getHost = () => {
    const devRunOption = process.argv[2];
    switch (devRunOption) {
        case "prod":
            return process.env.HOST;
        case "local":
            return `${(0, network_1.getLocalIpV4)()}`;
        case "dev":
            return "localhost";
        default:
            return "";
    }
};
exports.getHost = getHost;
const getPort = () => {
    const devRunOption = process.argv[2];
    return devRunOption === "prod" ? parseInt(process.env.PORT || "5000") : 5000;
};
exports.getPort = getPort;
