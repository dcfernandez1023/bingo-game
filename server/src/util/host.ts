import { getLocalIpV4 } from "./network";

export const getHost = () => {
  const devRunOption = process.argv[2];
  switch (devRunOption) {
    case "prod":
      return process.env.HOST;
    case "local":
      return `${getLocalIpV4()}`;
    case "dev":
      return "localhost";
    default:
      return "";
  }
};

export const getPort = () => {
  const devRunOption = process.argv[2];
  return devRunOption === "prod" ? parseInt(process.env.PORT || "5000") : 5000;
};
