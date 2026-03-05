"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function ResultsContent({ courseId, quizId }: { courseId: string; quizId: string }) {
  const searchParams = useSearchParams();
  const score = Number(searchParams.get("score") ?? 0);
  const passed = searchParams.get("passed") === "true";

  return (
    <div className="flex items-center justify-center py-16">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">{passed ? "\uD83C\uDFC6" : "\uD83D\uDCDA"}</div>
        <h1 className="text-2xl font-bold text-gray-800">{passed ? "You Passed!" : "Keep Practicing"}</h1>
        <p className="text-gray-500 mt-2">Your score</p>
        <div className={`text-5xl font-bold mt-3 ${passed ? "text-green-600" : "text-red-500"}`}>
          {score}%
        </div>
        <p className="text-gray-400 text-sm mt-2">
          {passed ? "Congratulations on passing!" : "Don't give up \u2014 review the material and try again."}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href={`/student/courses/${courseId}/quizzes/${quizId}`}
            className="bg-blue-600 text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-blue-700 transition">
            Retake Quiz
          </Link>
          <Link href={`/student/courses/${courseId}`}
            className="bg-gray-100 text-gray-700 py-2.5 px-6 rounded-lg font-semibold hover:bg-gray-200 transition">
            Back to Course
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function QuizResultsPage({
  params,
}: {
  params: { courseId: string; quizId: string };
}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-gray-400">Loading...</div>}>
      <ResultsContent courseId={params.courseId} quizId={params.quizId} />
    </Suspense>
  );
}
