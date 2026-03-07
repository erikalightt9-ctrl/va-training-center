import { NextResponse } from "next/server";
import { hasActiveSubscription } from "@/lib/repositories/subscription.repository";

/**
 * Check if a student has an active AI Premium subscription.
 * Returns null if the student is subscribed, or a 403 response if not.
 *
 * Usage in API routes:
 * ```
 * const denied = await requireSubscription(studentId);
 * if (denied) return denied;
 * ```
 */
export async function requireSubscription(
  studentId: string,
): Promise<NextResponse | null> {
  const isSubscribed = await hasActiveSubscription(studentId);

  if (!isSubscribed) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "AI Premium subscription required",
        code: "SUBSCRIPTION_REQUIRED",
      },
      { status: 403 },
    );
  }

  return null;
}
