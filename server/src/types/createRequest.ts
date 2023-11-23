import z from "zod";

export const CreateGameRequestSchema = z.object({
  name: z.string(),
});

export type CreateGameRequest = z.infer<typeof CreateGameRequestSchema>;
