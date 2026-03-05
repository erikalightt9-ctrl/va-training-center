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
import { ExternalLink } from "lucide-react";
import { StudentPaymentBadge } from "./StudentPaymentBadge";
import { AccessToggle } from "./AccessToggle";
import type { EnrolleeWithCourse } from "@/lib/repositories/enrollee.repository";

interface EnrolleeManagementTableProps {
  readonly enrollees: ReadonlyArray<EnrolleeWithCourse>;
}

export function EnrolleeManagementTable({ enrollees }: EnrolleeManagementTableProps) {
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
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollees.map((e) => {
            const coursePrice = Number(e.enrollment.course.price);
            const amountPaid = Number(e.amountPaid);
            const balance = Math.max(0, coursePrice - amountPaid);

            return (
              <TableRow key={e.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-900">
                  {e.name}
                </TableCell>
                <TableCell className="text-gray-600 text-sm">{e.email}</TableCell>
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
                  ₱{amountPaid.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right text-sm text-gray-700">
                  ₱{balance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-center">
                  <AccessToggle enrolleeId={e.id} initialValue={e.accessGranted} />
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
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/enrollees/${e.id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
