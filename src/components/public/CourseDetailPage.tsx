import Link from "next/link";
import { CheckCircle2, Clock, DollarSign, ArrowRight, Play, BookOpen, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Course } from "@prisma/client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PreviewLesson {
  readonly id: string;
  readonly title: string;
  readonly order: number;
  readonly durationMin: number;
}

interface CourseDetailPageProps {
  readonly course: Course;
  readonly previewLessons?: ReadonlyArray<PreviewLesson>;
}

/* ------------------------------------------------------------------ */
/*  AI Tools per Course                                                */
/* ------------------------------------------------------------------ */

const AI_TOOLS: Record<string, ReadonlyArray<string>> = {
  MEDICAL_VA: [
    "AI-assisted clinical documentation",
    "Smart patient scheduling automation",
    "Automated appointment reminders",
    "AI-powered medical transcription",
    "Intelligent EHR data entry",
    "AI-generated patient communication templates",
  ],
  REAL_ESTATE_VA: [
    "AI-powered listing descriptions",
    "Automated CMA report generation",
    "Smart CRM workflow automation",
    "AI-assisted social media content",
    "Intelligent lead follow-up sequences",
    "AI-generated market analysis summaries",
  ],
  US_BOOKKEEPING_VA: [
    "AI-assisted data entry and categorization",
    "Automated bank reconciliation tools",
    "Smart invoice processing",
    "AI-generated financial summaries",
    "Intelligent anomaly and error detection",
    "Automated report formatting and delivery",
  ],
};

function getAiToolsForCourse(slug: string): ReadonlyArray<string> {
  return AI_TOOLS[slug] ?? AI_TOOLS.MEDICAL_VA;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CourseDetailPage({ course, previewLessons = [] }: CourseDetailPageProps) {
  const priceNum = parseFloat(course.price.toString());

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-blue-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-block bg-blue-700 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full">
              Training Program
            </span>
            <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-200 text-xs font-semibold px-3 py-1 rounded-full">
              <Bot className="h-3 w-3" />
              AI-Enhanced
            </span>
          </div>
          <h1 className="text-4xl font-extrabold mb-4">{course.title}</h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-2xl">
            {course.description}
          </p>
          <div className="flex flex-wrap gap-4 mb-8 text-sm">
            <span className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
              <Clock className="h-4 w-4 text-blue-300" />
              {course.durationWeeks} weeks
            </span>
            <span className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
              <DollarSign className="h-4 w-4 text-blue-300" />
              ₱{priceNum.toLocaleString()} total
            </span>
            {previewLessons.length > 0 && (
              <span className="flex items-center gap-2 bg-orange-500/20 rounded-lg px-4 py-2 text-orange-200">
                <Play className="h-4 w-4" />
                {previewLessons.length} free lesson{previewLessons.length > 1 ? "s" : ""} available
              </span>
            )}
          </div>
          <Button asChild size="lg" className="bg-white text-blue-900 font-bold hover:bg-slate-50/50">
            <Link href="/enroll">
              Enroll Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">What You Will Learn</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {course.outcomes.map((outcome, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <p className="text-gray-700 text-sm">{outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tools Callout */}
      <section className="py-12 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-900/40 rounded-lg p-2">
              <Bot className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">
                AI Tools You&apos;ll Learn
              </h2>
              <p className="text-sm text-gray-500">
                Every module includes hands-on AI tool training
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {getAiToolsForCourse(course.slug).map((tool) => (
              <div
                key={tool}
                className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-blue-100"
              >
                <Bot className="h-4 w-4 text-blue-400 shrink-0" />
                <span className="text-sm text-gray-700">{tool}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            AI handles the speed work — you provide the judgment, verification, and client delivery.
          </p>
        </div>
      </section>

      {/* Free Preview Lessons */}
      {previewLessons.length > 0 && (
        <section className="py-16 px-4 bg-orange-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-orange-900/40 rounded-lg p-2">
                <BookOpen className="h-5 w-5 text-orange-400" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                Try Before You Enroll
              </h2>
            </div>
            <p className="text-gray-600 text-sm mb-8">
              Get a taste of what you&apos;ll learn. These lessons are completely free — no sign-up required.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {previewLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/courses/${course.slug.toLowerCase().replace(/_/g, "-")}/preview/${lesson.id}`}
                  className="group bg-white rounded-xl border border-orange-200 p-5 hover:shadow-md hover:border-orange-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium text-orange-400 bg-orange-900/40 rounded-full px-2.5 py-0.5">
                      Free Lesson
                    </span>
                    <span className="text-xs text-gray-400">
                      Lesson {lesson.order}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-orange-400 transition-colors mb-2">
                    {lesson.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    {lesson.durationMin > 0 && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lesson.durationMin} min
                      </span>
                    )}
                    <span className="text-xs font-medium text-orange-400 group-hover:text-orange-400 flex items-center gap-1">
                      Preview Free <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Card */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Program Investment</h2>
            <div className="text-5xl font-extrabold text-blue-400 my-4">
              ₱{priceNum.toLocaleString()}
            </div>
            <p className="text-gray-500 text-sm mb-6">
              {course.durationWeeks}-week program · One-time payment · Flexible installment available
            </p>
            <ul className="text-sm text-gray-600 text-left space-y-2 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                Complete course materials and resources
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                Hands-on AI tools training
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                VA + AI Proficiency Certificate
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                Job placement assistance
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                Lifetime community access
              </li>
            </ul>
            <Button asChild size="lg" className="w-full bg-blue-700 hover:bg-blue-800">
              <Link href="/enroll">Apply Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
