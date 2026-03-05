"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EVENT_TYPES, EVENT_TYPE_LABELS } from "@/lib/validations/calendar.schema";
import type { CalendarItem } from "@/components/calendar/CalendarWidget";

// ── Types ──────────────────────────────────────────────────────────
interface Course {
  id: string;
  title: string;
}

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarItem | null;
  courses: ReadonlyArray<Course>;
  onSuccess: () => void;
}

// ── Component ──────────────────────────────────────────────────────
export function EventDialog({
  open,
  onOpenChange,
  event,
  courses,
  onSuccess,
}: EventDialogProps) {
  const isEdit = Boolean(event);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form state
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [type, setType] = React.useState<string>("CUSTOM");
  const [courseId, setCourseId] = React.useState<string>("");
  const [isPublished, setIsPublished] = React.useState(true);

  // Populate form when editing
  React.useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? "");
      setDate(event.date.slice(0, 10));
      setEndDate(event.endDate?.slice(0, 10) ?? "");
      setType(event.type);
      setCourseId("");
      setIsPublished(true);
    } else {
      setTitle("");
      setDescription("");
      setDate("");
      setEndDate("");
      setType("CUSTOM");
      setCourseId("");
      setIsPublished(true);
    }
    setError(null);
  }, [event, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = {
      title: title.trim(),
      description: description.trim() || null,
      date,
      endDate: endDate || null,
      type,
      courseId: courseId || null,
      isPublished,
    };

    try {
      const url = isEdit
        ? `/api/admin/calendar/${event!.id}`
        : "/api/admin/calendar";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      onSuccess();
      onOpenChange(false);
    } catch {
      setError("Failed to save event. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!event || !confirm("Delete this event?")) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/calendar/${event.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? "Failed to delete");
        return;
      }

      onSuccess();
      onOpenChange(false);
    } catch {
      setError("Failed to delete event.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Event" : "New Event"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <Label htmlFor="event-title">Title *</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Orientation Day"
              maxLength={100}
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="event-desc">Description</Label>
            <Textarea
              id="event-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={3}
              maxLength={1000}
            />
          </div>

          {/* Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="event-date">Date *</Label>
              <Input
                id="event-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="event-end-date">End Date</Label>
              <Input
                id="event-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <Label htmlFor="event-type">Type</Label>
            <select
              id="event-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {EVENT_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          {/* Course scope */}
          <div>
            <Label htmlFor="event-course">Course</Label>
            <select
              id="event-course"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">All Courses (Global)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Published toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="event-published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="event-published" className="text-sm font-normal cursor-pointer">
              Published (visible to students)
            </Label>
          </div>

          <DialogFooter className="flex justify-between gap-2">
            {isEdit && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : isEdit ? "Update" : "Create"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
