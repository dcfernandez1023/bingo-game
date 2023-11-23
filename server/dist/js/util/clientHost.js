"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientHostForDevEnv = void 0;
const network_1 = require("./network");
const getClientHostForDevEnv = () => {
    const devRunOption = process.argv[2];
    let clientHost = "";
    switch (devRunOption) {
        case "dev":
            clientHost = `http://localhost:3000`;
            break;
        case "local":
            clientHost = `http://${(0, network_1.getLocalIpV4)()}:3000`;
            break;
        default:
            clientHost = "";
    }
    return clientHost;
};
exports.getClientHostForDevEnv = getClientHostForDevEnv;
