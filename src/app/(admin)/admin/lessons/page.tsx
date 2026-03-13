"use client";

import { useState, useEffect } from "react";
import { Video, Sparkles, Loader2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Course {
  readonly id: string;
  readonly title: string;
}

type TierFilter = "ALL" | "BASIC" | "PROFESSIONAL" | "ADVANCED";

interface Lesson {
  readonly id: string;
  readonly title: string;
  readonly order: number;
  readonly durationMin: number;
  readonly isPublished: boolean;
  readonly isFreePreview: boolean;
  readonly tier: TierFilter;
  readonly videoUrl: string | null;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TIER_TABS: readonly { readonly value: TierFilter; readonly label: string }[] = [
  { value: "ALL", label: "All Tiers" },
  { value: "BASIC", label: "Basic" },
  { value: "PROFESSIONAL", label: "Professional" },
  { value: "ADVANCED", label: "Advanced" },
] as const;

const TIER_BADGE_STYLES: Readonly<Record<string, string>> = {
  BASIC: "bg-gray-100 text-gray-700",
  PROFESSIONAL: "bg-blue-100 text-blue-700",
  ADVANCED: "bg-purple-100 text-purple-700",
};

const TIER_OPTIONS: readonly { readonly value: string; readonly label: string }[] = [
  { value: "BASIC", label: "Basic" },
  { value: "PROFESSIONAL", label: "Professional" },
  { value: "ADVANCED", label: "Advanced" },
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminLessonsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeTier, setActiveTier] = useState<TierFilter>("ALL");

  // Create form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState(1);
  const [durationMin, setDurationMin] = useState(0);
  const [isPublished, setIsPublished] = useState(false);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [tier, setTier] = useState<string>("BASIC");
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // AI generation state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTier, setAiTier] = useState<string>("ALL");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSuccess, setAiSuccess] = useState("");

  useEffect(() => {
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then((data) => { if (data.success) setCourses(data.data); })
      .catch(() => {});
  }, []);

  async function loadLessons(courseId: string, tierFilter?: TierFilter) {
    const filterTier = tierFilter ?? activeTier;
    const url = filterTier === "ALL"
      ? `/api/admin/lessons?courseId=${courseId}`
      : `/api/admin/lessons?courseId=${courseId}&tier=${filterTier}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) setLessons(data.data);
  }

  useEffect(() => {
    if (selectedCourse) loadLessons(selectedCourse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse, activeTier]);

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
          tier,
          videoUrl: videoUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTitle("");
        setContent("");
        setOrder(lessons.length + 2);
        setIsFreePreview(false);
        setVideoUrl("");
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

  async function handleAiGenerate() {
    setGenerating(true);
    setAiError("");
    setAiSuccess("");
    try {
      const res = await fetch("/api/admin/lessons/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourse, tier: aiTier }),
      });
      const data = await res.json();
      if (data.success) {
        setAiSuccess(`Generated ${data.data.totalLessonsCreated} lessons as drafts!`);
        setShowAiModal(false);
        loadLessons(selectedCourse);
      } else {
        setAiError(data.error ?? "AI generation failed");
      }
    } catch {
      setAiError("Network error during AI generation");
    } finally {
      setGenerating(false);
    }
  }

  const filteredLessons = activeTier === "ALL"
    ? lessons
    : lessons.filter((l) => l.tier === activeTier);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lesson Manager</h1>
        <p className="text-gray-500 text-sm mt-1">Create and manage course lessons by tier</p>
      </div>

      {/* Course selector */}
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
          {/* Tier filter tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {TIER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTier(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTier === tab.value
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <div className="ml-auto">
              <button
                onClick={() => { setShowAiModal(true); setAiError(""); setAiSuccess(""); }}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition"
              >
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </button>
            </div>
          </div>

          {/* AI success message */}
          {aiSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
              {aiSuccess}
            </div>
          )}

          {/* Create lesson form */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Create Lesson</h2>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            {success && <p className="text-green-600 text-sm mb-3">{success}</p>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Tier</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500"
                  >
                    {TIER_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
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
              <div>
                <label className="text-xs font-medium text-gray-600">Video URL (optional)</label>
                <input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/embed/..."
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
              Lessons ({filteredLessons.length})
            </h2>
            {filteredLessons.length === 0 ? (
              <p className="text-gray-400 text-sm">No lessons yet for this tier.</p>
            ) : (
              <div className="space-y-2">
                {filteredLessons.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        #{l.order} {l.title}
                        {l.videoUrl && (
                          <Video className="h-3.5 w-3.5 text-blue-500" aria-label="Has video" />
                        )}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          TIER_BADGE_STYLES[l.tier] ?? "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {l.tier}
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

      {/* AI Generation Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Generate Lessons with AI
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              AI will generate structured lesson modules as drafts for your review.
            </p>

            {aiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-4">
                {aiError}
              </div>
            )}

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Select Tier</label>
              <select
                value={aiTier}
                onChange={(e) => setAiTier(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Tiers (Basic + Professional + Advanced)</option>
                <option value="BASIC">Basic Only</option>
                <option value="PROFESSIONAL">Professional Only</option>
                <option value="ADVANCED">Advanced Only</option>
              </select>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 mb-4">
              <p className="text-xs text-purple-700">
                {aiTier === "ALL"
                  ? "This will generate ~12 lessons (4 per tier) as unpublished drafts."
                  : "This will generate ~4 lessons as unpublished drafts."}
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowAiModal(false)}
                disabled={generating}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAiGenerate}
                disabled={generating}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
