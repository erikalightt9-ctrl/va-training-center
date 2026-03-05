import { z } from "zod";

export const EVENT_TYPES = [
  "ANNOUNCEMENT",
  "DEADLINE",
  "ORIENTATION",
  "HOLIDAY",
  "CUSTOM",
] as const;

export const EVENT_TYPE_LABELS: Record<(typeof EVENT_TYPES)[number], string> = {
  ANNOUNCEMENT: "Announcement",
  DEADLINE: "Deadline",
  ORIENTATION: "Orientation",
  HOLIDAY: "Holiday",
  CUSTOM: "Custom",
};

export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or fewer"),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or fewer")
    .optional()
    .nullable(),
  date: z.string().min(1, "Date is required"),
  endDate: z.string().optional().nullable(),
  type: z.enum(EVENT_TYPES).default("CUSTOM"),
  courseId: z.string().optional().nullable(),
  isPublished: z.boolean().default(true),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventData = z.infer<typeof createEventSchema>;
export type UpdateEventData = z.infer<typeof updateEventSchema>;
