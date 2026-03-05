"use client";

import { useState, useEffect } from "react";

interface Course {
  id: string;
  title: string;
}

interface Lesson {
  id: string;
  title: string;
  order: number;
  durationMin: number;
  isPublished: boolean;
  isFreePreview: boolean;
}

export default function AdminLessonsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState(1);
  const [durationMin, setDurationMin] = useState(0);
  const [isPublished, setIsPublished] = useState(false);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then((data) => { if (data.success) setCourses(data.data); })
      .catch(() => {});
  }, []);

  async function loadLessons(courseId: string) {
    const res = await fetch(`/api/admin/lessons?courseId=${courseId}`);
    const data = await res.json();
    if (data.success) setLessons(data.data);
  }

  useEffect(() => {
    if (selectedCourse) loadLessons(selectedCourse);
  }, [selectedCourse]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse,
          title,
          content,
          order,
          durationMin,
          isPublished,
          isFreePreview,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTitle("");
        setContent("");
        setOrder(lessons.length + 2);
        setIsFreePreview(false);
        setSuccess("Lesson created!");
        loadLessons(selectedCourse);
      } else {
        setError(data.error ?? "Failed to create lesson");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(lesson: Lesson) {
    await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !lesson.isPublished }),
    });
    loadLessons(selectedCourse);
  }

  async function toggleFreePreview(lesson: Lesson) {
    await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFreePreview: !lesson.isFreePreview }),
    });
    loadLessons(selectedCourse);
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm("Delete this lesson?")) return;
    await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
    loadLessons(selectedCourse);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lesson Manager</h1>
        <p className="text-gray-500 text-sm mt-1">Create and manage course lessons</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a course --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <>
          {/* Create lesson form */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Create Lesson</h2>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            {success && <p className="text-green-600 text-sm mb-3">{success}</p>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Order</label>
                    <input
                      type="number"
                      value={order}
                      onChange={(e) => setOrder(Number(e.target.value))}
                      min={1}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Duration (min)</label>
                    <input
                      type="number"
                      value={durationMin}
                      onChange={(e) => setDurationMin(Number(e.target.value))}
                      min={0}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={8}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                  />
                  <label htmlFor="published" className="text-sm text-gray-600">
                    Publish immediately
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="freePreview"
                    checked={isFreePreview}
                    onChange={(e) => setIsFreePreview(e.target.checked)}
                  />
                  <label htmlFor="freePreview" className="text-sm text-orange-600 font-medium">
                    Free preview lesson
                  </label>
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Create Lesson"}
              </button>
            </form>
          </div>

          {/* Lessons list */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-gray-700 mb-4">
              Lessons ({lessons.length})
            </h2>
            {lessons.length === 0 ? (
              <p className="text-gray-400 text-sm">No lessons yet.</p>
            ) : (
              <div className="space-y-2">
                {lessons.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-700">
                        #{l.order} {l.title}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          l.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {l.isPublished ? "Published" : "Draft"}
                      </span>
                      {l.isFreePreview && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                          Free Preview
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleFreePreview(l)}
                        className={`text-xs ${
                          l.isFreePreview
                            ? "text-orange-600 hover:text-orange-800"
                            : "text-gray-500 hover:text-orange-600"
                        }`}
                      >
                        {l.isFreePreview ? "Remove Preview" : "Make Preview"}
                      </button>
                      <button
                        onClick={() => togglePublish(l)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {l.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(l.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
