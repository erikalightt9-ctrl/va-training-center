import { z } from "zod";

export const chatMessageSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"] as const),
        content: z.string().min(1).max(1000),
      })
    )
    .min(1)
    .max(20),
});

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type ChatInput = z.infer<typeof chatMessageSchema>;
