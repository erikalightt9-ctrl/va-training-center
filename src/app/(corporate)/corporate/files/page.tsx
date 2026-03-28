"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  FolderOpen,
  Upload,
  File,
  FileText,
  Image,
  Film,
  Download,
  Trash2,
  Loader2,
  Search,
  AlertCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OrgFile {
  readonly id: string;
  readonly name: string;
  readonly size: number;
  readonly mimeType: string;
  readonly url: string;
  readonly uploadedBy: string | null;
  readonly createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimeType, className }: { readonly mimeType: string; readonly className?: string }) {
  if (mimeType.startsWith("image/")) return <Image className={className} />;
  if (mimeType.startsWith("video/")) return <Film className={className} />;
  if (mimeType.includes("pdf") || mimeType.includes("text")) return <FileText className={className} />;
  return <File className={className} />;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CorporateFilesPage() {
  const [files, setFiles] = useState<ReadonlyArray<OrgFile>>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    try {
      const r = await fetch("/api/corporate/files");
      const json = await r.json();
      if (json.success) setFiles(json.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadFiles(); }, [loadFiles]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      Array.from(fileList).forEach((f) => formData.append("file", f));
      const r = await fetch("/api/corporate/files", { method: "POST", body: formData });
      const json = await r.json();
      if (json.success) {
        await loadFiles();
      } else {
        setError(json.error ?? "Upload failed");
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this file? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const r = await fetch(`/api/corporate/files/${id}`, { method: "DELETE" });
      const json = await r.json();
      if (json.success) {
        setFiles((prev) => prev.filter((f) => f.id !== id));
      } else {
        setError(json.error ?? "Delete failed");
      }
    } catch {
      setError("Delete failed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Files</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage documents and training materials · {files.length} files · {formatBytes(totalSize)}
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleUpload}
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Files
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search files…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Drop zone hint */}
      {files.length === 0 && !loading && (
        <div
          className="border-2 border-dashed border-gray-200 rounded-xl p-16 text-center cursor-pointer hover:border-yellow-300 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <FolderOpen className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No files uploaded yet</p>
          <p className="text-xs text-gray-400 mt-1">Click to upload or drag files here</p>
        </div>
      )}

      {/* File list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map((file) => (
            <div key={file.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
              {/* Icon */}
              <div className="p-2 bg-yellow-50 rounded-lg shrink-0">
                <FileIcon mimeType={file.mimeType} className="h-4 w-4 text-yellow-600" />
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {formatBytes(file.size)} · {formatDate(file.createdAt)}
                  {file.uploadedBy ? ` · ${file.uploadedBy}` : ""}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={() => handleDelete(file.id)}
                  disabled={deletingId === file.id}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  {deletingId === file.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Trash2 className="h-4 w-4" />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : search ? (
        <div className="text-center py-12 text-sm text-gray-400">
          No files match &quot;{search}&quot;
        </div>
      ) : null}
    </div>
  );
}
