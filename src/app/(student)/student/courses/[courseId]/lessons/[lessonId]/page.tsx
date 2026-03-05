"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  content: string;
  durationMin: number;
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
    return <div className="flex items-center justify-center py-20 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/student/courses/${courseId}`} className="text-blue-600 hover:text-blue-800 text-sm">
          &larr; Back to Course
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{lesson.title}</h1>
        {lesson.durationMin > 0 && <p className="text-gray-500 text-sm mt-1">{lesson.durationMin} min read</p>}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
          {lesson.content}
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        {certificate && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
            <p className="font-semibold text-green-700">Congratulations! You&apos;ve earned a certificate!</p>
            <a href={`/api/student/certificates/${certificate.certNumber}/download`}
              className="mt-3 inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
              Download Certificate
            </a>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          {completed ? (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <span className="text-xl">{"\u2713"}</span> Lesson Completed
            </div>
          ) : (
            <button onClick={markComplete} disabled={completing}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {completing ? "Marking Complete..." : "Mark as Complete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
