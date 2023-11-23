import z from "zod";
import { PlayerSchema } from "./player";

export const PurchaseRequestSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  numCardsToPurchase: z.number(),
  timestamp: z.number(),
  isFulfilled: z.boolean(),
});

export const MessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  message: z.string(),
  timestamp: z.number(),
});

export const GameSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  name: z.string(),
  board: z.array(z.array(z.number())),
  availableNumbers: z.array(z.number()),
  players: z.record(z.string(), PlayerSchema),
  startedAt: z.number(),
  isRoundActive: z.boolean(),
  currentPattern: z.array(z.array(z.number())),
  currentDrawn: z.array(z.string()),
  purchaseRequests: z.array(PurchaseRequestSchema),
  messages: z.array(MessageSchema),
  createdOn: z.number(),
});

export type Game = z.infer<typeof GameSchema>;
export type PurchaseRequest = z.infer<typeof PurchaseRequestSchema>;
export type Message = z.infer<typeof MessageSchema>;
