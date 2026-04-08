import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function listLeaveRequests(
  organizationId: string,
  filters: {
    employeeId?: string;
    status?: string;
    leaveType?: string;
    page?: number;
    limit?: number;
  }
) {
  const page  = filters.page  ?? 1;
  const limit = filters.limit ?? 20;

  const where: Prisma.HrLeaveRequestWhereInput = {
    employee: { organizationId },
    ...(filters.employeeId && { employeeId: filters.employeeId }),
    ...(filters.status     && { status: filters.status as never }),
    ...(filters.leaveType  && { leaveType: filters.leaveType as never }),
  };

  const [data, total] = await Promise.all([
    prisma.hrLeaveRequest.findMany({
      where,
      include: {
        employee: {
          select: { firstName: true, lastName: true, employeeNumber: true, position: true, department: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.hrLeaveRequest.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function createLeaveRequest(
  organizationId: string,
  data: {
    employeeId: string;
    leaveType: string;
    startDate: Date;
    endDate: Date;
    reason: string;
  }
) {
  const emp = await prisma.hrEmployee.findFirst({
    where: { id: data.employeeId, organizationId },
  });
  if (!emp) throw new Error("Employee not found");

  const totalDays =
    Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / 86400000) + 1;

  return prisma.hrLeaveRequest.create({
    data: {
      employeeId: data.employeeId,
      leaveType:  data.leaveType as never,
      startDate:  data.startDate,
      endDate:    data.endDate,
      totalDays:  new Prisma.Decimal(totalDays),
      reason:     data.reason,
      status:     "PENDING",
    },
    include: { employee: { select: { firstName: true, lastName: true } } },
  });
}

export async function reviewLeaveRequest(
  organizationId: string,
  id: string,
  action: "APPROVED" | "REJECTED",
  reviewedById: string,
  reviewNote?: string
) {
  const req = await prisma.hrLeaveRequest.findFirst({
    where: { id, employee: { organizationId } },
  });
  if (!req) throw new Error("Leave request not found");
  if (req.status !== "PENDING") throw new Error("Only PENDING requests can be reviewed");

  const updated = await prisma.hrLeaveRequest.update({
    where: { id },
    data: {
      status:      action,
      reviewedById,
      reviewedAt:  new Date(),
      reviewNote:  reviewNote ?? null,
    },
  });

  // If approved, update employee status to ON_LEAVE if leave starts today or earlier
  if (action === "APPROVED") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (req.startDate <= today && req.endDate >= today) {
      await prisma.hrEmployee.update({
        where: { id: req.employeeId },
        data: { status: "ON_LEAVE" },
      });
    }
  }

  return updated;
}

export async function cancelLeaveRequest(
  organizationId: string,
  id: string,
  employeeId: string
) {
  const req = await prisma.hrLeaveRequest.findFirst({
    where: { id, employeeId, employee: { organizationId } },
  });
  if (!req) throw new Error("Leave request not found");
  if (!["PENDING", "APPROVED"].includes(req.status)) {
    throw new Error("Cannot cancel this request");
  }

  return prisma.hrLeaveRequest.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
}
