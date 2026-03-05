import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Enrollee update schemas                                            */
/* ------------------------------------------------------------------ */

export const paymentUpdateSchema = z.object({
  amountPaid: z.number().min(0, "Amount must be non-negative"),
});

export const accessUpdateSchema = z.object({
  accessGranted: z.boolean(),
  accessExpiry: z.string().datetime({ offset: true }).nullable().optional(),
});

export const notesUpdateSchema = z.object({
  notes: z.string().max(2000, "Notes must be under 2000 characters"),
});

export const batchUpdateSchema = z.object({
  batch: z.string().max(100, "Batch must be under 100 characters"),
});

export const enrolleeGeneralUpdateSchema = z.object({
  batch: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  scheduleId: z.string().nullable().optional(),
});

/* ------------------------------------------------------------------ */
/*  Type exports                                                       */
/* ------------------------------------------------------------------ */

export type PaymentUpdateData = z.infer<typeof paymentUpdateSchema>;
export type AccessUpdateData = z.infer<typeof accessUpdateSchema>;
export type NotesUpdateData = z.infer<typeof notesUpdateSchema>;
export type BatchUpdateData = z.infer<typeof batchUpdateSchema>;
export type EnrolleeGeneralUpdateData = z.infer<typeof enrolleeGeneralUpdateSchema>;
