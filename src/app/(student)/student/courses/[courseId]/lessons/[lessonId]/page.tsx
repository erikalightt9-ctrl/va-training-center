"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
import { LessonDiscussionThread } from "@/components/shared/LessonDiscussionThread";
import LessonAssignments from "@/components/student/LessonAssignments";

interface Lesson {
  id: string;
  title: string;
  content: string;
  durationMin: number;
  videoUrl?: string | null;
  completed: boolean;
}

export default function LessonViewerPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [certificate, setCertificate] = useState<{ certNumber: string } | null>(null);
  const [error, setError] = useState("");
  const [actorId, setActorId] = useState("");
  const [actorType, setActorType] = useState("");

  useEffect(() => {
    params.then(({ courseId: cId, lessonId: lId }) => {
      setCourseId(cId);
      setLessonId(lId);
      fetch(`/api/student/courses/${cId}/lessons`)
        .then((r) => r.json())
        .then((data) => {
          const found = data.data?.find((l: Lesson) => l.id === lId);
          if (found) {
            setLesson(found);
            setCompleted(found.completed);
          }
        });
    });

    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((session) => {
        if (session?.user?.id) {
          setActorId(session.user.id);
          setActorType("STUDENT");
        }
      })
      .catch(() => {/* ignore */});
  }, [params]);

  async function markComplete() {
    setCompleting(true);
    try {
      const res = await fetch(`/api/student/lessons/${lessonId}/complete`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setCompleted(true);
        if (data.data?.certificate) {
          setCertificate(data.data.certificate);
        }
      }
    } catch {
      setError("Failed to mark lesson complete");
    } finally {
      setCompleting(false);
    }
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center text-ds-muted">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ds-primary mx-auto mb-3" />
          <p className="text-sm">Loading lesson...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">

      {/* Breadcrumb + title */}
      <div>
        <Link
          href={`/student/courses/${courseId}`}
          className="inline-flex items-center gap-1.5 text-sm text-ds-primary hover:text-blue-700 transition-colors mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Course
        </Link>
        <h1 className="text-xl font-bold text-ds-text">{lesson.title}</h1>
        <div className="flex items-center gap-3 mt-1 text-sm text-ds-muted">
          {lesson.durationMin > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />{lesson.durationMin} min
            </span>
          )}
          {completed && (
            <span className="flex items-center gap-1 text-emerald-600 font-medium text-xs bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3 w-3" /> Completed
            </span>
          )}
        </div>
      </div>

      {/* Video */}
      {lesson.videoUrl && (
        <div className="aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            src={lesson.videoUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Lesson content */}
      <div className="bg-ds-card rounded-xl border border-ds-border p-6">
        <div className="text-ds-text text-sm leading-relaxed whitespace-pre-wrap">
          {lesson.content}
        </div>

        {error && <p className="text-red-700 text-sm mt-4">{error}</p>}

        {/* Certificate banner */}
        {certificate && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-semibold text-emerald-600">
              Congratulations! You&apos;ve earned a certificate!
            </p>
            <a
              href={`/api/student/certificates/${certificate.certNumber}/download`}
              className="mt-3 inline-block bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Download Certificate
            </a>
          </div>
        )}

        {/* Complete button */}
        <div className="mt-8 flex justify-end">
          {completed ? (
            <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
              <CheckCircle2 className="h-4 w-4" /> Lesson Completed
            </div>
          ) : (
            <button
              onClick={markComplete}
              disabled={completing}
              className="bg-ds-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {completing ? "Marking Complete..." : "Mark as Complete"}
            </button>
          )}
        </div>
      </div>

      {/* Linked assignments */}
      {lessonId && <LessonAssignments lessonId={lessonId} />}

      {/* Discussion thread */}
      {courseId && lessonId && actorId && (
        <LessonDiscussionThread
          courseId={courseId}
          lessonId={lessonId}
          currentActorId={actorId}
          currentActorType={actorType}
        />
      )}
    </div>
  );
}
