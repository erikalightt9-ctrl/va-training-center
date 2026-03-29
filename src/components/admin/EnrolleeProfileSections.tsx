"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { StudentPaymentBadge } from "./StudentPaymentBadge";
import {
  BookOpen,
  ClipboardList,
  FileCheck,
  Clock,
  CalendarClock,
  Save,
  Loader2,
} from "lucide-react";
import type { StudentPaymentStatus } from "@prisma/client";
import { PaymentTimeline } from "./PaymentTimeline";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PaymentRecord {
  readonly id: string;
  readonly amount: string;
  readonly method: string;
  readonly status: string;
  readonly referenceNumber: string | null;
  readonly notes: string | null;
  readonly paidAt: string | null;
  readonly verifiedAt: string | null;
  readonly verifiedBy: string | null;
  readonly proofFilePath: string | null;
  readonly createdAt: string;
}

interface ActivityEntry {
  readonly id: string;
  readonly type: "lesson" | "quiz" | "submission" | "attendance";
  readonly title: string;
  readonly detail: string;
  readonly timestamp: string;
}

interface ScheduleInfo {
  readonly id: string;
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly daysOfWeek: number[];
}

interface EnrolleeProfileData {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly batch: string | null;
  readonly scheduleId: string | null;
  readonly schedule: ScheduleInfo | null;
  readonly paymentStatus: StudentPaymentStatus;
  readonly amountPaid: string;
  readonly accessGranted: boolean;
  readonly accessExpiry: string | null;
  readonly notes: string | null;
  readonly createdAt: string;
  readonly enrollment: {
    readonly fullName: string;
    readonly email: string;
    readonly contactNumber: string;
    readonly address: string;
    readonly educationalBackground: string;
    readonly workExperience: string;
    readonly employmentStatus: string;
    readonly technicalSkills: string[];
    readonly whyEnroll: string;
    readonly status: string;
    readonly statusUpdatedAt: string | null;
    readonly statusUpdatedBy: string | null;
    readonly referenceCode: string | null;
    readonly paymentStatus: string;
    readonly createdAt: string;
    readonly course: {
      readonly id: string;
      readonly title: string;
      readonly price: string;
    };
    readonly payments: ReadonlyArray<PaymentRecord>;
  };
  readonly activityLog: ReadonlyArray<ActivityEntry>;
}

interface EnrolleeProfileSectionsProps {
  readonly enrollee: EnrolleeProfileData;
}

/* ------------------------------------------------------------------ */
/*  Activity icon map                                                  */
/* ------------------------------------------------------------------ */

const ACTIVITY_ICONS: Record<string, typeof BookOpen> = {
  lesson: BookOpen,
  quiz: ClipboardList,
  submission: FileCheck,
  attendance: Clock,
};

/* ------------------------------------------------------------------ */
/*  Field component                                                    */
/* ------------------------------------------------------------------ */

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 last:border-0">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="col-span-2 text-sm text-gray-900 break-words">{value ?? "—"}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function EnrolleeProfileSections({ enrollee }: EnrolleeProfileSectionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Payment state
  const [amountPaid, setAmountPaid] = useState(Number(enrollee.amountPaid));
  const [paymentSaving, setPaymentSaving] = useState(false);

  // Access state
  const [accessGranted, setAccessGranted] = useState(enrollee.accessGranted);
  const [accessExpiry, setAccessExpiry] = useState(enrollee.accessExpiry?.split("T")[0] ?? "");
  const [accessSaving, setAccessSaving] = useState(false);

  // Schedule state
  const [selectedScheduleId, setSelectedScheduleId] = useState(enrollee.scheduleId ?? "");
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [availableSchedules, setAvailableSchedules] = useState<
    ReadonlyArray<{ id: string; name: string; startDate: string; enrolledCount: number; maxCapacity: number }>
  >([]);

  // Fetch available schedules for the enrollee's course
  useEffect(() => {
    const courseId = enrollee.enrollment.course.id;
    fetch(`/api/admin/schedules?courseId=${courseId}&status=OPEN&limit=50`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.schedules?.data) {
          setAvailableSchedules(
            data.data.schedules.data.map((s: { id: string; name: string; startDate: string; _count: { students: number }; maxCapacity: number }) => ({
              id: s.id,
              name: s.name,
              startDate: s.startDate,
              enrolledCount: s._count.students,
              maxCapacity: s.maxCapacity,
            }))
          );
        }
      })
      .catch(() => {/* silently fail */});
  }, [enrollee.enrollment.course.id]);

  // Notes state
  const [notes, setNotes] = useState(enrollee.notes ?? "");
  const [notesSaving, setNotesSaving] = useState(false);

  const coursePrice = Number(enrollee.enrollment.course.price);
  const balance = Math.max(0, coursePrice - amountPaid);

  /* ── Handlers ──────────────────────────────────────────────────── */

  const savePayment = async () => {
    setPaymentSaving(true);
    try {
      const res = await fetch(`/api/admin/enrollees/${enrollee.id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountPaid }),
      });
      if (res.ok) {
        startTransition(() => router.refresh());
      }
    } finally {
      setPaymentSaving(false);
    }
  };

  const saveAccess = async () => {
    setAccessSaving(true);
    try {
      const res = await fetch(`/api/admin/enrollees/${enrollee.id}/access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessGranted,
          accessExpiry: accessExpiry ? new Date(accessExpiry).toISOString() : null,
        }),
      });
      if (res.ok) {
        startTransition(() => router.refresh());
      }
    } finally {
      setAccessSaving(false);
    }
  };

  const saveSchedule = async () => {
    setScheduleSaving(true);
    try {
      const res = await fetch(`/api/admin/enrollees/${enrollee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: selectedScheduleId || null,
        }),
      });
      if (res.ok) {
        startTransition(() => router.refresh());
      }
    } finally {
      setScheduleSaving(false);
    }
  };

  const saveNotes = async () => {
    setNotesSaving(true);
    try {
      const res = await fetch(`/api/admin/enrollees/${enrollee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        startTransition(() => router.refresh());
      }
    } finally {
      setNotesSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── Left: main content ─────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-6">
        {/* Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Overview</h2>
          <dl>
            <Field label="Full Name" value={enrollee.enrollment.fullName} />
            <Field label="Email" value={enrollee.email} />
            <Field label="Phone" value={enrollee.enrollment.contactNumber} />
            <Field label="Address" value={enrollee.enrollment.address} />
            <Field label="Education" value={enrollee.enrollment.educationalBackground} />
            <Field label="Experience" value={enrollee.enrollment.workExperience || "Not provided"} />
            <Field label="Employment" value={enrollee.enrollment.employmentStatus.replace(/_/g, " ")} />
            <Field label="Skills" value={enrollee.enrollment.technicalSkills.join(", ") || "None"} />
            <Field label="Why Enroll" value={enrollee.enrollment.whyEnroll} />
            <Field label="Course" value={enrollee.enrollment.course.title} />
            <Field
              label="Enrolled"
              value={new Date(enrollee.createdAt).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          </dl>
        </div>

        {/* Enrollment Timeline */}
        <PaymentTimeline
          applicationDate={enrollee.enrollment.createdAt}
          enrollmentStatus={enrollee.enrollment.status}
          statusUpdatedAt={enrollee.enrollment.statusUpdatedAt}
          referenceCode={enrollee.enrollment.referenceCode}
          payments={enrollee.enrollment.payments}
          studentCreatedAt={enrollee.createdAt}
          accessExpiry={enrollee.accessExpiry}
        />

        {/* Payment Tracking */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Payment Tracking</h2>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Course Price</p>
              <p className="text-lg font-bold text-gray-900">
                ₱{coursePrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Amount Paid</p>
              <p className="text-lg font-bold text-green-700">
                ₱{amountPaid.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Balance</p>
              <p className="text-lg font-bold text-red-700">
                ₱{balance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="amountPaid" className="text-sm font-medium text-gray-700 block mb-1">
                Update Amount Paid
              </label>
              <Input
                id="amountPaid"
                type="number"
                min={0}
                step={0.01}
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
              />
            </div>
            <Button onClick={savePayment} disabled={paymentSaving || isPending} size="sm" className="gap-1">
              {paymentSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
          </div>

          {/* Payment history */}
          {enrollee.enrollment.payments.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Payment History</h3>
              <div className="space-y-2">
                {enrollee.enrollment.payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                  >
                    <div>
                      <span className="font-medium">₱{Number(p.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                      <span className="text-gray-500 ml-2">via {p.method}</span>
                      {p.referenceNumber && (
                        <span className="text-gray-400 ml-2">Ref: {p.referenceNumber}</span>
                      )}
                    </div>
                    <span className="text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Activity Log</h2>
          {enrollee.activityLog.length > 0 ? (
            <div className="space-y-3">
              {enrollee.activityLog.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.type] ?? BookOpen;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">{activity.detail}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(activity.timestamp).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              No activity recorded yet.
            </p>
          )}
        </div>
      </div>

      {/* ── Right sidebar ──────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Status card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Status</h2>
          <dl className="space-y-3">
            <Field label="Payment" value={<StudentPaymentBadge status={enrollee.paymentStatus} />} />
            <Field
              label="Access"
              value={
                <span className={enrollee.accessGranted ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                  {enrollee.accessGranted ? "Granted" : "Not Granted"}
                </span>
              }
            />
            {enrollee.accessExpiry && (
              <Field
                label="Expires"
                value={new Date(enrollee.accessExpiry).toLocaleDateString("en-PH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
            )}
          </dl>
        </div>

        {/* Access Control */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Access Control</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Grant Access</span>
              <Switch
                checked={accessGranted}
                onCheckedChange={setAccessGranted}
              />
            </div>
            <div>
              <label htmlFor="accessExpiry" className="text-sm font-medium text-gray-700 block mb-1">
                Access Expiry
              </label>
              <Input
                id="accessExpiry"
                type="date"
                value={accessExpiry}
                onChange={(e) => setAccessExpiry(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Leave empty for no expiry</p>
            </div>
            <Button onClick={saveAccess} disabled={accessSaving || isPending} size="sm" className="w-full gap-1">
              {accessSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Access
            </Button>
          </div>
        </div>

        {/* Schedule Assignment */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Training Schedule
          </h2>

          {enrollee.schedule ? (
            <div className="bg-blue-50 rounded-lg p-3 mb-3 text-sm">
              <p className="font-medium text-blue-900">{enrollee.schedule.name}</p>
              <p className="text-blue-700 text-xs mt-1">
                {new Date(enrollee.schedule.startDate).toLocaleDateString("en-PH", {
                  month: "short", day: "numeric",
                })}
                {" – "}
                {new Date(enrollee.schedule.endDate).toLocaleDateString("en-PH", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
              <p className="text-blue-700 text-xs">
                {enrollee.schedule.startTime} – {enrollee.schedule.endTime}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-3">No schedule assigned</p>
          )}

          <div className="space-y-2">
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">No schedule</option>
              {availableSchedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.enrolledCount}/{s.maxCapacity} enrolled)
                </option>
              ))}
              {/* Show current schedule if not in the open list */}
              {enrollee.schedule && !availableSchedules.some((s) => s.id === enrollee.schedule?.id) && (
                <option value={enrollee.schedule.id}>
                  {enrollee.schedule.name} (current)
                </option>
              )}
            </select>
            <Button
              onClick={saveSchedule}
              disabled={scheduleSaving || isPending}
              size="sm"
              className="w-full gap-1"
            >
              {scheduleSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Assign Schedule
            </Button>
          </div>
        </div>

        {/* Internal Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Internal Notes</h2>
          <Textarea
            placeholder="Add internal notes about this enrollee..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            className="mb-3"
          />
          <Button onClick={saveNotes} disabled={notesSaving || isPending} size="sm" className="w-full gap-1">
            {notesSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Notes
          </Button>
        </div>
      </div>
    </div>
  );
}
