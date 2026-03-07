import { z } from "zod";

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
