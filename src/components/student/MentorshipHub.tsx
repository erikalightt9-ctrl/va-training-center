"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Send,
  Loader2,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
  Lightbulb,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CourseInfo {
  readonly id: string;
  readonly title: string;
}

interface CourseTrainerEntry {
  readonly role: string;
  readonly course: CourseInfo;
}

interface MentorProfile {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly bio: string | null;
  readonly specializations: ReadonlyArray<string>;
  readonly courses: ReadonlyArray<CourseTrainerEntry>;
}

interface MentorshipRequestRecord {
  readonly id: string;
  readonly trainerId: string;
  readonly status: string;
  readonly message: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly trainer: {
    readonly name: string;
    readonly specializations: ReadonlyArray<string>;
  };
}

interface MentorshipData {
  readonly mentors: ReadonlyArray<MentorProfile>;
  readonly requests: ReadonlyArray<MentorshipRequestRecord>;
}

/* ------------------------------------------------------------------ */
/*  Status badge                                                       */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-600",
  ACCEPTED: "bg-green-100 text-green-700",
  DECLINED: "bg-red-50 text-red-700",
  COMPLETED: "bg-blue-50 text-blue-700",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-3 w-3" />,
  ACCEPTED: <CheckCircle2 className="h-3 w-3" />,
  DECLINED: <XCircle className="h-3 w-3" />,
  COMPLETED: <Award className="h-3 w-3" />,
};

function StatusBadge({ status }: { readonly status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700";
  const icon = STATUS_ICONS[status] ?? null;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${style}`}
    >
      {icon}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Request Modal                                                      */
/* ------------------------------------------------------------------ */

function RequestModal({
  mentor,
  onClose,
  onSubmit,
  submitting,
}: {
  readonly mentor: MentorProfile;
  readonly onClose: () => void;
  readonly onSubmit: (trainerId: string, message: string) => void;
  readonly submitting: boolean;
}) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) return;
    onSubmit(mentor.id, message.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            Request Mentorship
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Send a mentorship request to{" "}
          <span className="font-medium text-gray-900">{mentor.name}</span>.
          Share why you would like their guidance.
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell the mentor what you'd like to learn, your goals, and why you chose them... (min 10 characters)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none h-32 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            maxLength={500}
            disabled={submitting}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {message.length}/500 characters
            </span>
            <div className="flex gap-2">
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
                disabled={submitting || message.trim().length < 10}
              >
                {submitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {submitting ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mentor Card                                                        */
/* ------------------------------------------------------------------ */

function MentorCard({
  mentor,
  hasPending,
  onRequest,
}: {
  readonly mentor: MentorProfile;
  readonly hasPending: boolean;
  readonly onRequest: (mentor: MentorProfile) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 rounded-full w-10 h-10 flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {mentor.name}
            </h3>
            <p className="text-xs text-gray-500">{mentor.email}</p>
          </div>
        </div>
      </div>

      {mentor.bio && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{mentor.bio}</p>
      )}

      {/* Specializations */}
      {mentor.specializations.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {mentor.specializations.map((spec) => (
              <span
                key={spec}
                className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Courses taught */}
      {mentor.courses.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <BookOpen className="h-3 w-3" />
            <span>Courses</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {mentor.courses.map((ct) => (
              <span
                key={ct.course.id}
                className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
              >
                {ct.course.title}
              </span>
            ))}
          </div>
        </div>
      )}

      <Button
        size="sm"
        className="w-full gap-1.5"
        onClick={() => onRequest(mentor)}
        disabled={hasPending}
      >
        {hasPending ? (
          <>
            <Clock className="h-3.5 w-3.5" />
            Request Pending
          </>
        ) : (
          <>
            <Send className="h-3.5 w-3.5" />
            Request Mentorship
          </>
        )}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MentorshipHub() {
  const [data, setData] = useState<MentorshipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/student/mentorship");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error ?? "Failed to load mentorship data");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitRequest = useCallback(
    async (trainerId: string, message: string) => {
      setSubmitting(true);
      setError(null);

      try {
        const res = await fetch("/api/student/mentorship", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trainerId, message }),
        });
        const json = await res.json();

        if (json.success) {
          setSelectedMentor(null);
          await fetchData();
        } else {
          setError(json.error ?? "Failed to submit request");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [fetchData],
  );

  // Pending trainer IDs for current student
  const pendingTrainerIds = new Set(
    data?.requests
      .filter((r) => r.status === "PENDING")
      .map((r) => r.trainerId) ?? [],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 rounded-xl border border-red-200 p-6 text-center">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  const mentors = data?.mentors ?? [];
  const requests = data?.requests ?? [];

  return (
    <div className="space-y-6">
      {/* About the Program */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <h2 className="font-semibold text-gray-900">About the Program</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-900">1-on-1 Guidance</p>
              <p>Get personalized advice from experienced industry trainers.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <BookOpen className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-900">How It Works</p>
              <p>
                Browse mentors, send a request with your goals, and get matched.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Award className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Career Growth</p>
              <p>
                Accelerate your career with focused mentorship and feedback.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Available Mentors */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">
          Available Mentors ({mentors.length})
        </h2>
        {mentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                hasPending={pendingTrainerIds.has(mentor.id)}
                onRequest={setSelectedMentor}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No mentors are currently available. Check back later.
            </p>
          </div>
        )}
      </div>

      {/* My Requests */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">
          My Requests ({requests.length})
        </h2>
        {requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {req.trainer.name}
                    </p>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-gray-500 truncate">{req.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(req.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Send className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              You have not sent any mentorship requests yet. Browse the mentors
              above to get started.
            </p>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {selectedMentor && (
        <RequestModal
          mentor={selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onSubmit={handleSubmitRequest}
          submitting={submitting}
        />
      )}
    </div>
  );
}
