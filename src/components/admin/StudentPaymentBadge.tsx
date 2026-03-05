import { Badge } from "@/components/ui/badge";
import type { StudentPaymentStatus } from "@prisma/client";

const STATUS_CONFIG: Record<StudentPaymentStatus, { label: string; className: string }> = {
  UNPAID: {
    label: "Unpaid",
    className: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
  },
  PARTIAL: {
    label: "Partial",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200",
  },
  PAID: {
    label: "Paid",
    className: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
  },
};

export function StudentPaymentBadge({ status }: { status: StudentPaymentStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
