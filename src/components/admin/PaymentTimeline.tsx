"use client";

import {
  CheckCircle,
  Circle,
  FileText,
  CreditCard,
  ShieldCheck,
  GraduationCap,
  CalendarClock,
  Hash,
} from "lucide-react";

interface TimelinePayment {
  readonly method: string;
  readonly referenceNumber: string | null;
  readonly proofFilePath: string | null;
  readonly paidAt: string | null;
  readonly verifiedAt: string | null;
  readonly createdAt: string;
}

interface PaymentTimelineProps {
  readonly applicationDate: string;
  readonly enrollmentStatus: string;
  readonly statusUpdatedAt: string | null;
  readonly referenceCode: string | null;
  readonly payments: ReadonlyArray<TimelinePayment>;
  readonly studentCreatedAt: string;
  readonly accessExpiry: string | null;
}

interface TimelineStep {
  readonly label: string;
  readonly detail: string | null;
  readonly timestamp: string | null;
  readonly completed: boolean;
  readonly icon: typeof CheckCircle;
  readonly highlight?: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PaymentTimeline({
  applicationDate,
  enrollmentStatus,
  statusUpdatedAt,
  referenceCode,
  payments,
  studentCreatedAt,
  accessExpiry,
}: PaymentTimelineProps) {
  const isApproved = ["APPROVED", "ENROLLED"].includes(enrollmentStatus);
  const isEnrolled = enrollmentStatus === "ENROLLED";
  const latestPayment = payments[0] ?? null;
  const hasProofUploaded = latestPayment !== null;
  const isPaymentVerified = latestPayment?.verifiedAt !== null;

  const steps: TimelineStep[] = [
    {
      label: "Application Submitted",
      detail: null,
      timestamp: applicationDate,
      completed: true,
      icon: FileText,
    },
    {
      label: "Enrollment Approved",
      detail: null,
      timestamp: isApproved && statusUpdatedAt ? statusUpdatedAt : null,
      completed: isApproved,
      icon: CheckCircle,
    },
  ];

  // Show reference code step if one was generated
  if (referenceCode) {
    steps.push({
      label: "Reference Code Assigned",
      detail: referenceCode,
      timestamp: isApproved && statusUpdatedAt ? statusUpdatedAt : null,
      completed: true,
      icon: Hash,
      highlight: "amber",
    });
  }

  steps.push({
    label: "Payment Proof Uploaded",
    detail: hasProofUploaded
      ? `${latestPayment.method}${latestPayment.referenceNumber ? ` — Ref: ${latestPayment.referenceNumber}` : ""}`
      : null,
    timestamp: hasProofUploaded ? latestPayment.createdAt : null,
    completed: hasProofUploaded,
    icon: CreditCard,
  });

  steps.push({
    label: "Payment Verified",
    detail: null,
    timestamp: hasProofUploaded && isPaymentVerified ? latestPayment.verifiedAt : null,
    completed: hasProofUploaded && isPaymentVerified,
    icon: ShieldCheck,
  });

  steps.push({
    label: "Student Account Created",
    detail: null,
    timestamp: isEnrolled ? studentCreatedAt : null,
    completed: isEnrolled,
    icon: GraduationCap,
  });

  if (accessExpiry) {
    const isExpired = new Date(accessExpiry) < new Date();
    steps.push({
      label: isExpired ? "Access Expired" : "Access Expires",
      detail: null,
      timestamp: accessExpiry,
      completed: !isExpired,
      icon: CalendarClock,
      highlight: isExpired ? "red" : undefined,
    });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Enrollment Timeline</h2>
      <div className="relative">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          const Icon = step.icon;

          return (
            <div key={step.label} className="flex gap-3 relative">
              {/* Vertical line */}
              {!isLast && (
                <div
                  className={`absolute left-[15px] top-8 w-0.5 h-[calc(100%-8px)] ${
                    step.completed ? "bg-green-300" : "bg-gray-200"
                  }`}
                />
              )}

              {/* Icon */}
              <div className="shrink-0 z-10">
                {step.completed ? (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.highlight === "amber"
                        ? "bg-amber-100 text-amber-700"
                        : step.highlight === "red"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <Circle className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={`pb-5 ${!step.completed ? "opacity-50" : ""}`}>
                <p className="text-sm font-medium text-gray-900">{step.label}</p>
                {step.detail && (
                  <p
                    className={`text-xs mt-0.5 font-mono ${
                      step.highlight === "amber"
                        ? "text-amber-700 font-bold"
                        : "text-gray-500"
                    }`}
                  >
                    {step.detail}
                  </p>
                )}
                {step.timestamp && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(step.timestamp)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
