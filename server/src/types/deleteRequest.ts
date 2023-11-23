import z from "zod";

export const DeleteGameRequestSchema = z.object({
  gameId: z.string(),
});

export type DeleteGameRequest = z.infer<typeof DeleteGameRequestSchema>;
