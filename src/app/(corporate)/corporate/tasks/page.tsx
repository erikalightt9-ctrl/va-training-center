"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CheckSquare,
  Square,
  Plus,
  Loader2,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

interface Task {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly dueDate: string | null;
  readonly assigneeName: string | null;
  readonly createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const STATUS_COLS: ReadonlyArray<{ status: TaskStatus; label: string; color: string; icon: React.ReactNode }> = [
  { status: "TODO",        label: "To Do",      color: "border-gray-200",  icon: <Square      className="h-4 w-4 text-gray-400" /> },
  { status: "IN_PROGRESS", label: "In Progress", color: "border-blue-300",  icon: <Clock       className="h-4 w-4 text-blue-500" /> },
  { status: "DONE",        label: "Done",        color: "border-green-300", icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> },
];

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  LOW:    "bg-gray-100 text-gray-500",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH:   "bg-red-100 text-red-600",
};

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ------------------------------------------------------------------ */
/*  Task Card                                                           */
/* ------------------------------------------------------------------ */

function TaskCard({ task, onStatusChange }: {
  readonly task: Task;
  readonly onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  const overdue = task.status !== "DONE" && isOverdue(task.dueDate);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3.5 space-y-2.5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-medium leading-snug ${task.status === "DONE" ? "line-through text-gray-400" : "text-gray-900"}`}>
          {task.title}
        </p>
        <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLOR[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-xs ${overdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
              {overdue ? <AlertCircle className="h-3 w-3" /> : <CalendarDays className="h-3 w-3" />}
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.assigneeName && (
            <span className="text-xs text-gray-400">{task.assigneeName}</span>
          )}
        </div>

        {/* Quick status toggle */}
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          className="text-xs border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add Task Modal                                                     */
/* ------------------------------------------------------------------ */

function AddTaskModal({ onClose, onAdd }: {
  readonly onClose: () => void;
  readonly onAdd: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onAdd({
      title: title.trim(),
      description: description.trim() || null,
      status: "TODO",
      priority,
      dueDate: dueDate || null,
      assigneeName: null,
    });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Task title…"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Optional details…"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CorporateTasksPage() {
  const [tasks, setTasks] = useState<ReadonlyArray<Task>>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const r = await fetch("/api/corporate/tasks");
      const json = await r.json();
      if (json.success) setTasks(json.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadTasks(); }, [loadTasks]);

  async function handleStatusChange(id: string, status: TaskStatus) {
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await fetch(`/api/corporate/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.error(err);
      void loadTasks(); // rollback on error
    }
  }

  async function handleAdd(data: Omit<Task, "id" | "createdAt">) {
    try {
      const r = await fetch("/api/corporate/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await r.json();
      if (json.success && json.data) {
        setTasks((prev) => [json.data as Task, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const counts = STATUS_COLS.reduce(
    (acc, col) => ({ ...acc, [col.status]: tasks.filter((t) => t.status === col.status).length }),
    {} as Record<TaskStatus, number>,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">Assign and track team tasks with deadlines</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* Kanban board */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUS_COLS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className={`bg-gray-50 rounded-xl border-2 ${col.color} p-4 space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {col.icon}
                    <span className="text-sm font-semibold text-gray-700">{col.label}</span>
                  </div>
                  <span className="text-xs bg-white border border-gray-200 text-gray-500 rounded-full px-2 py-0.5">
                    {counts[col.status] ?? 0}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[200px]">
                  {colTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-300">
                      <CheckSquare className="h-8 w-8 mb-2" />
                      <p className="text-xs">No tasks</p>
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center gap-6 text-xs text-gray-400">
        <span>{tasks.length} total tasks</span>
        <span>{tasks.filter((t) => t.status !== "DONE" && isOverdue(t.dueDate)).length} overdue</span>
        <span>{tasks.filter((t) => t.status === "DONE").length} completed</span>
      </div>

      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
}
