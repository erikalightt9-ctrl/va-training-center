import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/repositories/notification.repository";
import { sendMail } from "@/lib/mailer";

const createSchema = z.object({
  itemName: z.string().min(1).max(200),
  quantity: z.number().int().positive(),
  unit:     z.string().max(50).optional().default("piece"),
  purpose:  z.string().min(1).max(500),
});

async function getEmployeeFromToken(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "employee") return null;
  return prisma.hrEmployee.findFirst({
    where: { email: token.email as string, organizationId: token.organizationId as string },
  });
}

export async function GET(request: NextRequest) {
  try {
    const employee = await getEmployeeFromToken(request);
    if (!employee) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }

    const logs = await prisma.inventoryAuditLog.findMany({
      where: { organizationId: employee.organizationId, actorId: employee.id, action: "supply.request" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const requests = logs.map((l) => {
      const meta = (l.payload && typeof l.payload === "object" && !Array.isArray(l.payload))
        ? (l.payload as Record<string, unknown>)
        : {};
      return { id: l.id, createdAt: l.createdAt, ...meta };
    });

    return NextResponse.json({ success: true, data: requests, error: null });
  } catch (err) {
    console.error("[GET /api/employee/supply-requests]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const employee = await getEmployeeFromToken(request);
    if (!employee) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }

    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
    }

    const { itemName, quantity, unit, purpose } = parsed.data;

    const payload = {
      itemName,
      quantity,
      unit,
      purpose,
      status: "PENDING",
      requesterName:   `${employee.firstName} ${employee.lastName}`,
      requesterEmail:  employee.email,
      requesterId:     employee.id,
      employeeNumber:  employee.employeeNumber,
      department:      employee.department ?? "",
    };

    const log = await prisma.inventoryAuditLog.create({
      data: {
        id:             createId(),
        organizationId: employee.organizationId,
        actorId:        employee.id,
        action:         "supply.request",
        targetType:     "supply_request",
        targetId:       null,
        payload:        payload as Prisma.InputJsonValue,
      },
    });

    // Notify all ADMIN / MANAGER corporate managers in the same org
    const managers = await prisma.corporateManager.findMany({
      where: {
        organizationId: employee.organizationId,
        isActive:       true,
        userRole:       { in: ["ADMIN", "MANAGER"] },
      },
      select: { id: true, email: true, name: true },
    });

    await Promise.all(
      managers.map((mgr) =>
        createNotification({
          recipientType: "CORPORATE_MANAGER",
          recipientId:   mgr.id,
          type:          "SYSTEM",
          title:         "New Supply Request",
          message:       `${employee.firstName} ${employee.lastName} requested ${quantity} ${unit}(s) of ${itemName}.`,
          linkUrl:       `/admin/admin/inventory?tab=requests`,
          tenantId:      employee.organizationId,
        })
      )
    );

    // Email — best effort, never blocks the response
    sendMail({
      from:    `"Humi Inventory" <no-reply@humi.ph>`,
      to:      managers.map((m) => m.email).join(","),
      subject: `New Supply Request — ${itemName}`,
      html: `
        <p><strong>${employee.firstName} ${employee.lastName}</strong>
        (${employee.employeeNumber}) has submitted a supply request:</p>
        <ul>
          <li><strong>Item:</strong> ${itemName}</li>
          <li><strong>Quantity:</strong> ${quantity} ${unit}</li>
          <li><strong>Purpose:</strong> ${purpose}</li>
        </ul>
        <p><a href="/admin/admin/inventory?tab=requests">Review Request →</a></p>
      `,
    }).catch(() => {});

    return NextResponse.json(
      { success: true, data: { id: log.id, status: "PENDING" }, error: null },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/employee/supply-requests]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}
