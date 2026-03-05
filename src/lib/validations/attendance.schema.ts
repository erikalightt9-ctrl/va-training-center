import { z } from "zod";

export const clockActionSchema = z.object({
  action: z.enum(["clock-in", "clock-out"]),
});

export type ClockAction = z.infer<typeof clockActionSchema>;
