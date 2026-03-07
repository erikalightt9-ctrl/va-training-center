import { prisma } from "@/lib/prisma";
import type { Subscription, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SubscriptionWithStudent = Subscription & {
  readonly student: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly enrollment: {
      readonly course: {
        readonly title: string;
      };
    };
  };
};

/* ------------------------------------------------------------------ */
/*  Plan pricing (PHP)                                                 */
/* ------------------------------------------------------------------ */

export const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  MONTHLY: 299,
  QUARTERLY: 699,
  LIFETIME: 1499,
};

export const PLAN_DURATIONS_DAYS: Record<SubscriptionPlan, number | null> = {
  MONTHLY: 30,
  QUARTERLY: 90,
  LIFETIME: null, // never expires
};

/* ------------------------------------------------------------------ */
/*  Read                                                               */
/* ------------------------------------------------------------------ */

/** Get the student's current active (non-expired) subscription */
export async function getActiveSubscription(
  studentId: string,
): Promise<Subscription | null> {
  const sub = await prisma.subscription.findFirst({
    where: {
      studentId,
      status: "ACTIVE",
    },
    orderBy: { createdAt: "desc" },
  });

  if (!sub) return null;

  // Check if non-lifetime subscription has expired
  if (sub.endDate && sub.endDate < new Date()) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "EXPIRED" },
    });
    return null;
  }

  return sub;
}

/** Quick boolean check for subscription status */
export async function hasActiveSubscription(
  studentId: string,
): Promise<boolean> {
  const sub = await getActiveSubscription(studentId);
  return sub !== null;
}

/** Get a pending subscription for a student (awaiting payment approval) */
export async function getPendingSubscription(
  studentId: string,
): Promise<Subscription | null> {
  return prisma.subscription.findFirst({
    where: {
      studentId,
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
  });
}

/** List all subscriptions (admin) */
export async function listSubscriptions(filters: {
  readonly status?: SubscriptionStatus;
  readonly page?: number;
  readonly limit?: number;
}): Promise<{
  readonly data: ReadonlyArray<SubscriptionWithStudent>;
  readonly total: number;
}> {
  const { status, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where = status ? { status } : {};

  const [data, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            enrollment: {
              select: { course: { select: { title: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.subscription.count({ where }),
  ]);

  return { data, total };
}

/* ------------------------------------------------------------------ */
/*  Create                                                             */
/* ------------------------------------------------------------------ */

/** Create a pending subscription (manual payment flow) */
export async function createSubscription(data: {
  readonly studentId: string;
  readonly plan: SubscriptionPlan;
  readonly paymentMethod?: string;
  readonly paymentProof?: string;
  readonly referenceNumber?: string;
}): Promise<Subscription> {
  return prisma.subscription.create({
    data: {
      studentId: data.studentId,
      plan: data.plan,
      status: "PENDING",
      amount: PLAN_PRICES[data.plan],
      paymentMethod: data.paymentMethod ?? null,
      paymentProof: data.paymentProof ?? null,
      referenceNumber: data.referenceNumber ?? null,
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Update                                                             */
/* ------------------------------------------------------------------ */

/** Admin approves a subscription payment — activates the subscription */
export async function approveSubscription(
  subscriptionId: string,
  adminId: string,
): Promise<Subscription> {
  const sub = await prisma.subscription.findUniqueOrThrow({
    where: { id: subscriptionId },
  });

  const startDate = new Date();
  const durationDays = PLAN_DURATIONS_DAYS[sub.plan];
  const endDate = durationDays
    ? new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000)
    : null;

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: "ACTIVE",
      startDate,
      endDate,
      approvedBy: adminId,
      approvedAt: new Date(),
    },
  });
}

/** Admin rejects a subscription payment */
export async function rejectSubscription(
  subscriptionId: string,
): Promise<Subscription> {
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: "CANCELLED" },
  });
}

/** Mark a subscription as expired */
export async function expireSubscription(
  subscriptionId: string,
): Promise<Subscription> {
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: "EXPIRED" },
  });
}
