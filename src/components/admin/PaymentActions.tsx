"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, ShieldCheck } from "lucide-react";

interface PaymentActionsProps {
  paymentId: string;
  status: string;
}

export function PaymentActions({ paymentId, status }: PaymentActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  if (status !== "PENDING_PAYMENT") return null;

  const handleVerify = async (approved: boolean) => {
    setActionType(approved ? "approve" : "reject");
    setShowConfirm(false);

    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });

      if (res.ok) {
        startTransition(() => {
          router.refresh();
        });
      }
    } catch {
      // Error handled silently, page will refresh
    } finally {
      setActionType(null);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          className="bg-green-600 hover:bg-green-700 text-white gap-1"
          onClick={() => setShowConfirm(true)}
          disabled={isPending}
        >
          {actionType === "approve" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ShieldCheck className="h-3 w-3" />
          )}
          Verify &amp; Activate
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="gap-1"
          onClick={() => handleVerify(false)}
          disabled={isPending}
        >
          {actionType === "reject" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          Reject
        </Button>
      </div>

      {/* Confirmation dialog overlay */}
      {showConfirm && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-start gap-3 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Verify &amp; Activate</p>
              <p className="text-xs text-gray-500 mt-1">
                This will create a student account and grant 90-day access. Continue?
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleVerify(true)}
              disabled={isPending}
            >
              {actionType === "approve" ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : null}
              Confirm
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
