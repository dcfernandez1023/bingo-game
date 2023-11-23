"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalIpV4 = void 0;
const os_1 = require("os");
const getLocalIpV4 = () => {
    const nets = (0, os_1.networkInterfaces)();
    const results = {}; // Or just '{}', an empty object
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
            if (net.family === familyV4Value && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    return results["Wi-Fi"][0] || "";
};
exports.getLocalIpV4 = getLocalIpV4;
