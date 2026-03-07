import { z } from "zod";

export const mentorshipRequestSchema = z.object({
  trainerId: z.string().min(1, "Trainer selection is required"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be at most 500 characters"),
});

export type MentorshipRequestInput = z.infer<typeof mentorshipRequestSchema>;
