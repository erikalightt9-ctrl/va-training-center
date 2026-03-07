import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { EnrollmentPipelineCounts } from "@/lib/repositories/dashboard.repository";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PipelineStage {
  readonly label: string;
  readonly count: number;
  readonly colorClass: string;
  readonly href: string;
}

interface EnrollmentPipelineProps {
  readonly pipeline: EnrollmentPipelineCounts;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EnrollmentPipeline({ pipeline }: EnrollmentPipelineProps) {
  const stages: ReadonlyArray<PipelineStage> = [
    {
      label: "Pending",
      count: pipeline.pending,
      colorClass: "bg-gray-50 border-gray-200 text-gray-700",
      href: "/admin/enrollees?status=PENDING",
    },
    {
      label: "Payment Submitted",
      count: pipeline.paymentSubmitted,
      colorClass: "bg-amber-50 border-amber-200 text-amber-700",
      href: "/admin/enrollees?status=PAYMENT_SUBMITTED",
    },
    {
      label: "Payment Verified",
      count: pipeline.paymentVerified,
      colorClass: "bg-blue-50 border-blue-200 text-blue-700",
      href: "/admin/enrollees?status=PAYMENT_VERIFIED",
    },
    {
      label: "Enrolled",
      count: pipeline.enrolled,
      colorClass: "bg-emerald-50 border-emerald-200 text-emerald-700",
      href: "/admin/enrollees?status=ENROLLED",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h2 className="font-semibold text-gray-900 mb-4">Enrollment Pipeline</h2>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {stages.map((stage, index) => (
          <div key={stage.label} className="flex items-center gap-2 shrink-0">
            <Link
              href={stage.href}
              className={`rounded-xl border px-4 py-3 text-center hover:shadow-md transition-shadow min-w-[130px] ${stage.colorClass}`}
            >
              <p className="text-2xl font-bold">{stage.count}</p>
              <p className="text-xs font-medium mt-0.5">{stage.label}</p>
            </Link>
            {index < stages.length - 1 && (
              <ArrowRight className="h-4 w-4 text-gray-300 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
