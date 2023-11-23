import z from "zod";

export const JoinGameRequestSchema = z.object({
  name: z.string(),
  gameId: z.string(),
});

export type JoinGameRequest = z.infer<typeof JoinGameRequestSchema>;
