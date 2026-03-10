import { z } from "zod";

export const submitRatingSchema = z.object({
  trainerId: z.string().min(1, "Trainer ID is required"),
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  review: z
    .string()
    .max(2000, "Review must be 2000 characters or fewer")
    .optional()
    .nullable(),
});

export type SubmitRatingData = z.infer<typeof submitRatingSchema>;
