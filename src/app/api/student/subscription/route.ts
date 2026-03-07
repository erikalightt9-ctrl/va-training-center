import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getActiveSubscription,
  getPendingSubscription,
  createSubscription,
  PLAN_PRICES,
} from "@/lib/repositories/subscription.repository";
import { createSubscriptionSchema } from "@/lib/validations/subscription.schema";

/* ------------------------------------------------------------------ */
/*  GET — Current subscription status                                  */
/* ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id || token.role !== "student") {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const studentId = token.id as string;

    const [active, pending] = await Promise.all([
      getActiveSubscription(studentId),
      getPendingSubscription(studentId),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        isSubscribed: active !== null,
        activeSubscription: active
          ? {
              id: active.id,
              plan: active.plan,
              startDate: active.startDate?.toISOString() ?? null,
              endDate: active.endDate?.toISOString() ?? null,
            }
          : null,
        pendingSubscription: pending
          ? {
              id: pending.id,
              plan: pending.plan,
              createdAt: pending.createdAt.toISOString(),
            }
          : null,
        plans: {
          MONTHLY: PLAN_PRICES.MONTHLY,
          QUARTERLY: PLAN_PRICES.QUARTERLY,
          LIFETIME: PLAN_PRICES.LIFETIME,
        },
      },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/student/subscription]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST — Submit subscription (manual proof flow)                     */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id || token.role !== "student") {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const studentId = token.id as string;

    // Check for existing active subscription
    const existing = await getActiveSubscription(studentId);
    if (existing) {
      return NextResponse.json(
        { success: false, data: null, error: "You already have an active subscription" },
        { status: 409 },
      );
    }

    // Check for existing pending subscription
    const pending = await getPendingSubscription(studentId);
    if (pending) {
      return NextResponse.json(
        { success: false, data: null, error: "You already have a pending subscription awaiting approval" },
        { status: 409 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, data: null, error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const parsed = createSubscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: parsed.error.issues[0]?.message ?? "Invalid input",
        },
        { status: 422 },
      );
    }

    const subscription = await createSubscription({
      studentId,
      plan: parsed.data.plan,
      paymentMethod: parsed.data.paymentMethod,
      referenceNumber: parsed.data.referenceNumber,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        amount: Number(subscription.amount),
      },
      error: null,
    });
  } catch (err) {
    console.error("[POST /api/student/subscription]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
