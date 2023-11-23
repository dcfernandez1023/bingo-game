import z from "zod";

export const CardCellSchema = z.object({
  val: z.number(),
  isChecked: z.boolean(),
});

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  joinedAt: z.number(),
  cards: z.array(z.array(CardCellSchema)),
  currentPurchaseRequestId: z.string(),
});

export type Player = z.infer<typeof PlayerSchema>;
export type CardCell = z.infer<typeof CardCellSchema>;
