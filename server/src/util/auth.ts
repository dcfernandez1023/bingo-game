import { randomBytes } from "crypto";

const HASH_SIZE = 10;

export const generateSessionId = (): string => {
  const buffer = randomBytes(HASH_SIZE);
  return buffer.toString("hex");
};
