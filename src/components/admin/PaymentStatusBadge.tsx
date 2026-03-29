import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "@prisma/client";

const STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING_PAYMENT: {
    label: "Pending",
    className: "bg-amber-50 text-amber-800 hover:bg-amber-50 border-amber-200",
  },
  PAID: {
    label: "Paid",
    className: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
  },
  FAILED: {
    label: "Rejected",
    className: "bg-red-50 text-red-800 hover:bg-red-50 border-red-200",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200",
  },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
