"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, Loader2 } from "lucide-react";
import { StudentPaymentBadge } from "./StudentPaymentBadge";
import { AccessToggle } from "./AccessToggle";
import type { EnrolleeWithCourse } from "@/lib/repositories/enrollee.repository";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface EnrolleeManagementTableProps {
  readonly enrollees: ReadonlyArray<EnrolleeWithCourse>;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EnrolleeManagementTable({ enrollees }: EnrolleeManagementTableProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (
      !confirm(
        `Delete enrollee "${name}" and all their data (attendance, quiz attempts, submissions, certificates)? This cannot be undone.`,
      )
    ) {
      return;
    }

    setDeleting(id);
    setError(null);

    try {
      const res = await fetch(`/api/admin/enrollees/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Failed to delete");
        return;
      }

      startTransition(() => router.refresh());
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  if (enrollees.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg font-medium">No enrollees found</p>
        <p className="text-sm mt-1">
          Enrollees appear here after their applications are approved.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[180px]">Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-center">Access</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollees.map((e) => {
              const coursePrice = Number(e.enrollment.course.price);
              const amountPaid = Number(e.amountPaid);
              const balance = Math.max(0, coursePrice - amountPaid);
              const isDeleting = deleting === e.id;

              return (
                <TableRow
                  key={e.id}
                  className={`hover:bg-gray-50 ${isDeleting ? "opacity-50" : ""}`}
                >
                  <TableCell className="font-medium text-gray-900">
                    {e.name}
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {e.email}
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {e.enrollment.course.title}
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {e.schedule ? (
                      <Link
                        href={`/admin/schedules/${e.schedule.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {e.schedule.name}
                      </Link>
                    ) : (
                      e.batch ?? "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <StudentPaymentBadge status={e.paymentStatus} />
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-700 font-medium">
                    ₱
                    {amountPaid.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-700">
                    ₱
                    {balance.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    <AccessToggle
                      enrolleeId={e.id}
                      initialValue={e.accessGranted}
                    />
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {e.accessExpiry
                      ? new Date(e.accessExpiry).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(e.id, e.name)}
                        disabled={isDeleting}
                        className="text-red-500 hover:text-red-700"
                        title="Delete enrollee"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        title="View Profile"
                      >
                        <Link href={`/admin/enrollees/${e.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
