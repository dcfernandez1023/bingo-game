import { networkInterfaces } from "os";

export const getLocalIpV4 = (): string => {
  const nets = networkInterfaces();
  const results: { [key: string]: string[] } = {}; // Or just '{}', an empty object

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
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
