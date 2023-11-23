import { getLocalIpV4 } from "./network";

export const getClientHostForDevEnv = () => {
  const devRunOption = process.argv[2];
  let clientHost: string = "";
  switch (devRunOption) {
    case "dev":
      clientHost = `http://localhost:3000`;
      break;
    case "local":
      clientHost = `http://${getLocalIpV4()}:3000`;
      break;
    default:
      clientHost = "";
  }
  return clientHost;
};
