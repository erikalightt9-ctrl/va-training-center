import { Badge } from "@/components/ui/badge";
import type { EnrollmentStatus } from "@prisma/client";

const STATUS_CONFIG: Record<EnrollmentStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-800 hover:bg-amber-50 border-amber-200",
  },
  PAYMENT_SUBMITTED: {
    label: "Payment Submitted",
    className: "bg-orange-50 text-orange-800 hover:bg-orange-50 border-orange-200",
  },
  PAYMENT_VERIFIED: {
    label: "Payment Verified",
    className: "bg-teal-50 text-teal-800 hover:bg-teal-50 border-teal-200",
  },
  EMAIL_VERIFIED: {
    label: "Email Verified",
    className: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100 border-cyan-200",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-50 text-red-800 hover:bg-red-50 border-red-200",
  },
  ENROLLED: {
    label: "Enrolled",
    className: "bg-blue-50 text-blue-800 hover:bg-blue-50 border-blue-200",
  },
};

export function StatusBadge({ status }: { status: EnrollmentStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
