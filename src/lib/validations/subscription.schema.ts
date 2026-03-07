import { z } from "zod";

export const createSubscriptionSchema = z.object({
  plan: z.enum(["MONTHLY", "QUARTERLY", "LIFETIME"]),
  paymentMethod: z.string().min(1).max(50).optional(),
  referenceNumber: z.string().min(1).max(100).optional(),
});

export const adminSubscriptionActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type AdminSubscriptionAction = z.infer<typeof adminSubscriptionActionSchema>;
