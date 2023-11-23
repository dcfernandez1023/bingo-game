import express from "express";
import { CLIENT_HOST } from "../constants";

export const clientCors = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (CLIENT_HOST) {
    res.setHeader("Access-Control-Allow-Origin", CLIENT_HOST);
    console.log(`DEV CLIENT HOST: ${CLIENT_HOST}`);
  }
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
};
