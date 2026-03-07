"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageCircle,
  Plus,
  Loader2,
  X,
  User,
  MessagesSquare,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ForumThread {
  readonly id: string;
  readonly title: string;
  readonly createdAt: string;
  readonly student: {
    readonly name: string;
  };
  readonly _count: {
    readonly posts: number;
  };
}

interface ThreadPost {
  readonly id: string;
  readonly content: string;
  readonly createdAt: string;
  readonly student: {
    readonly id: string;
    readonly name: string;
  };
  readonly replies: ReadonlyArray<{
    readonly id: string;
    readonly content: string;
    readonly createdAt: string;
    readonly student: {
      readonly id: string;
      readonly name: string;
    };
  }>;
}

interface ThreadDetail {
  readonly id: string;
  readonly title: string;
  readonly student: {
    readonly id: string;
    readonly name: string;
  };
  readonly posts: ReadonlyArray<ThreadPost>;
}

/* ------------------------------------------------------------------ */
/*  Thread Detail View                                                 */
/* ------------------------------------------------------------------ */

function ThreadDetailView({
  thread,
  onBack,
}: {
  readonly thread: ThreadDetail;
  readonly onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
      >
        &larr; Back to threads
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {thread.title}
        </h2>
        <p className="text-xs text-gray-400">
          Started by {thread.student.name}
        </p>
      </div>

      {thread.posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
              {post.student.name[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {post.student.name}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {post.content}
          </p>

          {post.replies.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
              {post.replies.map((reply) => (
                <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    {reply.student.name}
                  </p>
                  <p className="text-sm text-gray-700">{reply.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  New Thread Form                                                    */
/* ------------------------------------------------------------------ */

function NewThreadForm({
  onClose,
  onSubmit,
  submitting,
}: {
  readonly onClose: () => void;
  readonly onSubmit: (title: string, content: string) => void;
  readonly submitting: boolean;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3 || content.trim().length < 10) return;
    onSubmit(title.trim(), content.trim());
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">New Thread</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close form"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="thread-title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            id="thread-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What would you like to discuss?"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            maxLength={200}
            disabled={submitting}
          />
          <p className="text-xs text-gray-400 mt-1">
            Min 3 characters ({title.length}/200)
          </p>
        </div>

        <div>
          <label
            htmlFor="thread-content"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Content
          </label>
          <textarea
            id="thread-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, questions, or ideas... (min 10 characters)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            maxLength={5000}
            disabled={submitting}
          />
          <p className="text-xs text-gray-400 mt-1">
            Min 10 characters ({content.length}/5000)
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="gap-1.5"
            disabled={
              submitting ||
              title.trim().length < 3 ||
              content.trim().length < 10
            }
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            {submitting ? "Creating..." : "Create Thread"}
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Thread Card                                                        */
/* ------------------------------------------------------------------ */

function ThreadCard({
  thread,
  onSelect,
}: {
  readonly thread: ForumThread;
  readonly onSelect: (threadId: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(thread.id)}
      className="w-full bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm truncate">
            {thread.title}
          </h3>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <User className="h-3 w-3" />
              {thread.student.name}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MessagesSquare className="h-3 w-3" />
              {thread._count.posts}{" "}
              {thread._count.posts === 1 ? "post" : "posts"}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(thread.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 ml-2" />
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function StudentForum() {
  const [threads, setThreads] = useState<ReadonlyArray<ForumThread>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedThread, setSelectedThread] = useState<ThreadDetail | null>(
    null,
  );
  const [loadingThread, setLoadingThread] = useState(false);

  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/student/community-forum");
      const json = await res.json();
      if (json.success) {
        setThreads(json.data);
      } else {
        setError(json.error ?? "Failed to load threads");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const handleCreateThread = useCallback(
    async (title: string, content: string) => {
      setSubmitting(true);
      setError(null);

      try {
        const res = await fetch("/api/student/community-forum", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });
        const json = await res.json();

        if (json.success) {
          setShowNewForm(false);
          await fetchThreads();
        } else {
          setError(json.error ?? "Failed to create thread");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [fetchThreads],
  );

  const handleSelectThread = useCallback(async (threadId: string) => {
    setLoadingThread(true);
    setError(null);

    try {
      const res = await fetch(`/api/student/forum/${threadId}`);
      const json = await res.json();

      if (json.success) {
        setSelectedThread(json.data);
      } else {
        setError(json.error ?? "Failed to load thread");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoadingThread(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Thread detail view
  if (selectedThread) {
    return (
      <ThreadDetailView
        thread={selectedThread}
        onBack={() => setSelectedThread(null)}
      />
    );
  }

  // Thread loading
  if (loadingThread) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Actions bar */}
      {!showNewForm && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {threads.length} {threads.length === 1 ? "thread" : "threads"}
          </p>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setShowNewForm(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            New Thread
          </Button>
        </div>
      )}

      {/* New thread form */}
      {showNewForm && (
        <NewThreadForm
          onClose={() => setShowNewForm(false)}
          onSubmit={handleCreateThread}
          submitting={submitting}
        />
      )}

      {/* Thread list */}
      {threads.length > 0 ? (
        <div className="space-y-2">
          {threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onSelect={handleSelectThread}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            No Discussions Yet
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
            Be the first to start a conversation. Share your thoughts,
            questions, or ideas with fellow students.
          </p>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setShowNewForm(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Start a Discussion
          </Button>
        </div>
      )}
    </div>
  );
}
