"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SubscriptionRow {
  readonly id: string;
  readonly studentName: string;
  readonly studentEmail: string;
  readonly courseTitle: string;
  readonly plan: string;
  readonly status: string;
  readonly amount: number;
  readonly paymentMethod: string | null;
  readonly referenceNumber: string | null;
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly createdAt: string;
  readonly approvedAt: string | null;
}

type FilterStatus = "" | "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";

/* ------------------------------------------------------------------ */
/*  Status badge                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { readonly status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    ACTIVE: "bg-green-100 text-green-700",
    EXPIRED: "bg-gray-100 text-gray-500",
    CANCELLED: "bg-red-100 text-red-600",
  };

  const icons: Record<string, React.ReactNode> = {
    PENDING: <Clock className="h-3 w-3" />,
    ACTIVE: <CheckCircle className="h-3 w-3" />,
    EXPIRED: <AlertTriangle className="h-3 w-3" />,
    CANCELLED: <XCircle className="h-3 w-3" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {icons[status]}
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<
    ReadonlyArray<SubscriptionRow>
  >([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("");
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const fetchData = useCallback(async () => {
    try {
      const url = filter
        ? `/api/admin/subscriptions?status=${filter}`
        : "/api/admin/subscriptions";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setSubscriptions(json.data);
      } else {
        setError(json.error ?? "Failed to load");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const handleAction = useCallback(
    async (id: string, action: "approve" | "reject") => {
      setActing(id);
      setError(null);

      try {
        const res = await fetch(`/api/admin/subscriptions/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });

        const json = await res.json();
        if (!json.success) {
          setError(json.error ?? `Failed to ${action}`);
          return;
        }

        startTransition(() => {
          fetchData();
        });
      } catch {
        setError("Network error");
      } finally {
        setActing(null);
      }
    },
    [fetchData],
  );

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {(
          [
            { value: "", label: "All" },
            { value: "PENDING", label: "Pending" },
            { value: "ACTIVE", label: "Active" },
            { value: "EXPIRED", label: "Expired" },
            { value: "CANCELLED", label: "Cancelled" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === tab.value
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
          <button
            type="button"
            className="ml-2 text-red-500 hover:text-red-800"
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Crown className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No subscriptions found</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((s) => {
                const isActing = acting === s.id;

                return (
                  <TableRow
                    key={s.id}
                    className={isActing ? "opacity-50" : ""}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {s.studentName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {s.studentEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {s.courseTitle}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {s.plan}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      ₱{s.amount.toLocaleString("en-PH")}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      <div>
                        <p>{s.paymentMethod ?? "—"}</p>
                        {s.referenceNumber && (
                          <p className="text-xs text-gray-400">
                            Ref: {s.referenceNumber}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={s.status} />
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(s.createdAt).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      {s.status === "PENDING" && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAction(s.id, "approve")}
                            disabled={isActing}
                            className="text-green-600 hover:text-green-700 gap-1"
                          >
                            {isActing ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3.5 w-3.5" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAction(s.id, "reject")}
                            disabled={isActing}
                            className="text-red-500 hover:text-red-700 gap-1"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {s.status === "ACTIVE" && s.endDate && (
                        <p className="text-xs text-gray-400 text-right">
                          Expires{" "}
                          {new Date(s.endDate).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
