import z from "zod";

export const LeaveGameRequestSchema = z.object({
  gameId: z.string(),
});

export type LeaveGameRequest = z.infer<typeof LeaveGameRequestSchema>;
