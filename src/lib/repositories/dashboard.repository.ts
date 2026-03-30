import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RevenueSnapshot {
  readonly totalRevenue: number;
  readonly paidPaymentsCount: number;
  readonly pendingVerificationCount: number;
  readonly recentRevenue: number;
}

export interface EnrollmentPipelineCounts {
  readonly pending: number;
  readonly paymentSubmitted: number;
  readonly paymentVerified: number;
  readonly enrolled: number;
}

export interface RecentActivity {
  readonly id: string;
  readonly type: "enrollment" | "payment" | "certificate";
  readonly description: string;
  readonly timestamp: Date;
  readonly href: string;
}

export interface PresentStudent {
  readonly id: string;
  readonly studentName: string;
  readonly courseTitle: string;
  readonly clockIn: string;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getRevenueSnapshot(tenantId?: string | null): Promise<RevenueSnapshot> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Scope by tenant via enrollment → organizationId when tenantId is provided
  const tenantEnrollmentFilter = tenantId
    ? { enrollment: { organizationId: tenantId } }
    : {};

  const [paidPayments, pendingCount, recentPaid] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "PAID", ...tenantEnrollmentFilter },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.count({
      where: { status: "PENDING_PAYMENT", ...tenantEnrollmentFilter },
    }),
    prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: thirtyDaysAgo }, ...tenantEnrollmentFilter },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalRevenue: Number(paidPayments._sum.amount ?? 0),
    paidPaymentsCount: paidPayments._count,
    pendingVerificationCount: pendingCount,
    recentRevenue: Number(recentPaid._sum.amount ?? 0),
  };
}

export async function getEnrollmentPipeline(tenantId?: string | null): Promise<EnrollmentPipelineCounts> {
  const tenantFilter = tenantId ? { organizationId: tenantId } : {};

  const [pending, paymentSubmitted, paymentVerified, enrolled] =
    await Promise.all([
      prisma.enrollment.count({ where: { status: "PENDING", ...tenantFilter } }),
      prisma.enrollment.count({ where: { status: "PAYMENT_SUBMITTED", ...tenantFilter } }),
      prisma.enrollment.count({ where: { status: "PAYMENT_VERIFIED", ...tenantFilter } }),
      prisma.enrollment.count({ where: { status: "ENROLLED", ...tenantFilter } }),
    ]);

  return { pending, paymentSubmitted, paymentVerified, enrolled };
}

export async function getRecentActivity(
  limit = 10,
  tenantId?: string | null,
): Promise<ReadonlyArray<RecentActivity>> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const enrollmentTenantFilter = tenantId ? { organizationId: tenantId } : {};
  const courseTenantFilter = tenantId ? { tenantId } : {};

  const [recentEnrollments, recentPayments, recentCertificates] =
    await Promise.all([
      prisma.enrollment.findMany({
        where: { createdAt: { gte: sevenDaysAgo }, ...enrollmentTenantFilter },
        select: {
          id: true,
          fullName: true,
          createdAt: true,
          course: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.payment.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
          ...(tenantId ? { enrollment: { organizationId: tenantId } } : {}),
        },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          enrollment: { select: { fullName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.certificate.findMany({
        where: {
          issuedAt: { gte: sevenDaysAgo },
          ...(tenantId ? { course: { tenantId } } : {}),
        },
        select: {
          id: true,
          issuedAt: true,
          student: { select: { name: true } },
          course: { select: { title: true } },
        },
        orderBy: { issuedAt: "desc" },
        take: limit,
      }),
    ]);

  const activities: RecentActivity[] = [
    ...recentEnrollments.map((e) => ({
      id: e.id,
      type: "enrollment" as const,
      description: `${e.fullName} applied for ${e.course.title}`,
      timestamp: e.createdAt,
      href: `/admin/enrollees/${e.id}`,
    })),
    ...recentPayments.map((p) => ({
      id: p.id,
      type: "payment" as const,
      description: `Payment ${p.status === "PAID" ? "verified" : "submitted"} by ${p.enrollment.fullName}`,
      timestamp: p.createdAt,
      href: "/admin/payments",
    })),
    ...recentCertificates.map((c) => ({
      id: c.id,
      type: "certificate" as const,
      description: `Certificate issued to ${c.student.name} for ${c.course.title}`,
      timestamp: c.issuedAt,
      href: "/admin/certificates",
    })),
  ];

  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

export async function getContactMessageCount(): Promise<number> {
  return prisma.contactMessage.count();
}

export async function getCurrentlyPresent(): Promise<ReadonlyArray<PresentStudent>> {
  const records = await prisma.attendanceRecord.findMany({
    where: { clockOut: null },
    include: {
      student: {
        select: {
          name: true,
          enrollment: {
            select: { course: { select: { title: true } } },
          },
        },
      },
    },
    orderBy: { clockIn: "desc" },
  });

  return records.map((r) => ({
    id: r.id,
    studentName: r.student.name,
    courseTitle: r.student.enrollment.course.title,
    clockIn: r.clockIn.toISOString(),
  }));
}
