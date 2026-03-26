"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionList } from "@/components/page-builder/SectionList";
import type { PageSection } from "@/components/page-builder/SectionEditor";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type PageType = "LANDING" | "CONTACT" | "CUSTOM";

interface PageData {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly type: PageType;
  readonly isPublished: boolean;
  readonly metaTitle: string | null;
  readonly metaDescription: string | null;
  readonly sections: readonly PageSection[];
  readonly updatedAt: string;
}

interface EditablePageState {
  title: string;
  slug: string;
  type: PageType;
  isPublished: boolean;
  metaTitle: string;
  metaDescription: string;
  sections: readonly PageSection[];
}

interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T | null;
  readonly error: string | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function pageToEditState(page: PageData): EditablePageState {
  return {
    title: page.title,
    slug: page.slug,
    type: page.type,
    isPublished: page.isPublished,
    metaTitle: page.metaTitle ?? "",
    metaDescription: page.metaDescription ?? "",
    sections: page.sections ?? [],
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PageEditorPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = use(params);

  const [page, setPage] = useState<PageData | null>(null);
  const [form, setForm] = useState<EditablePageState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/corporate/pages/${pageId}`);
      const json = (await res.json()) as ApiResponse<PageData>;
      if (!json.success || !json.data) {
        setLoadError(json.error ?? "Page not found.");
        return;
      }
      setPage(json.data);
      setForm(pageToEditState(json.data));
      setIsDirty(false);
    } catch {
      setLoadError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    void fetchPage();
  }, [fetchPage]);

  function updateForm<K extends keyof EditablePageState>(key: K, value: EditablePageState[K]): void {
    setForm((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
    setIsDirty(true);
    setSaveSuccess(false);
    setSaveError(null);
  }

  function handleSectionUpdate(updated: PageSection): void {
    setForm((prev) => {
      if (!prev) return prev;
      const sections = prev.sections.map((s) => (s.id === updated.id ? updated : s));
      return { ...prev, sections };
    });
    setIsDirty(true);
    setSaveSuccess(false);
  }

  function handleSectionDelete(id: string): void {
    setForm((prev) => {
      if (!prev) return prev;
      const sections = prev.sections
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, order: i }));
      return { ...prev, sections };
    });
    setIsDirty(true);
    setSaveSuccess(false);
  }

  function handleSectionReorder(sections: readonly PageSection[]): void {
    setForm((prev) => {
      if (!prev) return prev;
      return { ...prev, sections };
    });
    setIsDirty(true);
    setSaveSuccess(false);
  }

  function handleSectionAdd(section: PageSection): void {
    setForm((prev) => {
      if (!prev) return prev;
      return { ...prev, sections: [...prev.sections, section] };
    });
    setIsDirty(true);
    setSaveSuccess(false);
  }

  async function handleSave(): Promise<void> {
    if (!form) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        type: form.type,
        isPublished: form.isPublished,
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
        sections: form.sections,
      };

      const res = await fetch(`/api/corporate/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ApiResponse<PageData>;

      if (!json.success || !json.data) {
        setSaveError(json.error ?? "Failed to save page.");
        return;
      }

      setPage(json.data);
      setIsDirty(false);
      setSaveSuccess(true);

      // Auto-clear success after 3s
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  /* ── Loading / error states ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (loadError || !form) {
    return (
      <div className="space-y-4">
        <Link href="/corporate/builder">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Pages
          </Button>
        </Link>
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {loadError ?? "Page not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Back link */}
      <Link href="/corporate/builder">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Pages
        </Button>
      </Link>

      {/* Top bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        {/* Title + dirty indicator */}
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <Label htmlFor="page-title" className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
              Page Title
            </Label>
            <Input
              id="page-title"
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
              placeholder="My Page"
              maxLength={200}
              className="text-lg font-semibold"
            />
          </div>

          <div className="shrink-0 flex items-center gap-3 pt-6">
            {isDirty && (
              <span className="text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                Unsaved changes
              </span>
            )}
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        {/* Slug + type row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="page-slug" className="text-sm font-medium text-gray-700">
              Slug
            </Label>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-gray-400">/</span>
              <Input
                id="page-slug"
                value={form.slug}
                onChange={(e) =>
                  updateForm("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                }
                placeholder="my-page"
                maxLength={100}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="page-type" className="text-sm font-medium text-gray-700">
              Page Type
            </Label>
            <select
              id="page-type"
              value={form.type}
              onChange={(e) => updateForm("type", e.target.value as PageType)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="CUSTOM">Custom</option>
              <option value="LANDING">Landing Page</option>
              <option value="CONTACT">Contact Page</option>
            </select>
          </div>
        </div>

        {/* Publish toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-700">
              {form.isPublished ? "Published" : "Draft"}
            </p>
            <p className="text-xs text-gray-400">
              {form.isPublished
                ? "This page is live and visible to visitors."
                : "This page is hidden from public view."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.isPublished}
            onClick={() => updateForm("isPublished", !form.isPublished)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              form.isPublished ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                form.isPublished ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* SEO fields — collapsible */}
        <div className="border-t border-gray-100 pt-2">
          <button
            type="button"
            onClick={() => setSeoOpen((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            {seoOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            SEO Settings
          </button>

          {seoOpen && (
            <div className="mt-3 space-y-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="meta-title" className="text-sm font-medium text-gray-700">
                  Meta Title
                </Label>
                <Input
                  id="meta-title"
                  value={form.metaTitle}
                  onChange={(e) => updateForm("metaTitle", e.target.value)}
                  placeholder="Page title for search engines"
                  maxLength={200}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="meta-description" className="text-sm font-medium text-gray-700">
                  Meta Description
                </Label>
                <textarea
                  id="meta-description"
                  value={form.metaDescription}
                  onChange={(e) => updateForm("metaDescription", e.target.value)}
                  placeholder="Short description for search engine results"
                  maxLength={400}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
                <p className="text-xs text-gray-400 text-right">
                  {form.metaDescription.length} / 400
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Status messages */}
        {saveSuccess && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Page saved successfully!
          </div>
        )}
        {saveError && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {saveError}
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Sections ({form.sections.length})
          </h2>
        </div>

        <SectionList
          sections={form.sections}
          onUpdate={handleSectionUpdate}
          onDelete={handleSectionDelete}
          onReorder={handleSectionReorder}
          onAdd={handleSectionAdd}
        />
      </div>

      {/* Sticky save bar when dirty */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg px-6 py-3 flex items-center justify-between">
          <span className="text-sm text-amber-600 font-medium">You have unsaved changes</span>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (page) {
                  setForm(pageToEditState(page));
                  setIsDirty(false);
                }
              }}
              disabled={saving}
            >
              Discard
            </Button>
            <Button type="button" size="sm" onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
