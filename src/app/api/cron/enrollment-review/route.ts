import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAdminReviewReminder } from "@/lib/services/notification.service";

const REMINDER_THRESHOLD_HOURS = 12;
const DEADLINE_HOURS = 24;

interface ApiResponse {
  readonly success: boolean;
  readonly data: { reminders: number; pendingCount: number; overdueCount: number } | null;
  readonly error: string | null;
}

/**
 * Cron endpoint: checks for pending enrollments and notifies admins.
 *
 * - Enrollments pending > 12h: sends urgent reminder to all admins.
 * - Enrollments pending > 24h: flagged as overdue in the notification.
 *
 * Secured with CRON_SECRET Bearer token.
 * Schedule this to run every hour (e.g., via Vercel Cron or external scheduler).
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const now = new Date();
    const reminderCutoff = new Date(now.getTime() - REMINDER_THRESHOLD_HOURS * 60 * 60 * 1000);
    const deadlineCutoff = new Date(now.getTime() - DEADLINE_HOURS * 60 * 60 * 1000);

    // Find all PENDING enrollments older than 12 hours
    const staleEnrollments = await prisma.enrollment.findMany({
      where: {
        status: "PENDING",
        createdAt: { lt: reminderCutoff },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        course: { select: { title: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    if (staleEnrollments.length === 0) {
      return NextResponse.json({
        success: true,
        data: { reminders: 0, pendingCount: 0, overdueCount: 0 },
        error: null,
      });
    }

    // Calculate hours waiting for each enrollment
    const pendingDetails = staleEnrollments.map((e) => {
      const hoursWaiting = Math.round(
        (now.getTime() - e.createdAt.getTime()) / (1000 * 60 * 60),
      );

      return {
        id: e.id,
        fullName: e.fullName,
        email: e.email,
        courseTitle: e.course.title,
        hoursWaiting,
        submittedAt: e.createdAt.toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });

    const overdueCount = staleEnrollments.filter(
      (e) => e.createdAt < deadlineCutoff,
    ).length;

    const hasOverdue = overdueCount > 0;

    // Get all admin email addresses
    const admins = await prisma.admin.findMany({
      select: { name: true, email: true },
    });

    // Fallback to ADMIN_EMAIL env var if no admins in database
    const adminEmail = process.env.ADMIN_EMAIL;
    const recipients =
      admins.length > 0
        ? admins
        : adminEmail
          ? [{ name: "Admin", email: adminEmail }]
          : [];

    if (recipients.length === 0) {
      console.warn(
        "[Cron/enrollment-review] No admin recipients found. " +
          "Add admins to database or set ADMIN_EMAIL in .env.",
      );
      return NextResponse.json({
        success: true,
        data: {
          reminders: 0,
          pendingCount: pendingDetails.length,
          overdueCount,
        },
        error: null,
      });
    }

    // Send reminder to each admin
    let sentCount = 0;
    for (const admin of recipients) {
      await sendAdminReviewReminder({
        adminName: admin.name,
        adminEmail: admin.email,
        pendingEnrollments: pendingDetails,
        isUrgent: hasOverdue,
      });
      sentCount++;
    }

    console.log(
      `[Cron/enrollment-review] Sent ${sentCount} reminders for ${pendingDetails.length} pending enrollments (${overdueCount} overdue).`,
    );

    return NextResponse.json({
      success: true,
      data: {
        reminders: sentCount,
        pendingCount: pendingDetails.length,
        overdueCount,
      },
      error: null,
    });
  } catch (err) {
    console.error("[POST /api/cron/enrollment-review]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
