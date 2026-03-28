import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireSuperAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  GET — List trainers assigned to a tenant + all available trainers  */
/* ------------------------------------------------------------------ */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireSuperAdmin(token);
    if (!guard.ok) return guard.response;

    const { id: tenantId } = await params;

    const [assigned, all] = await Promise.all([
      prisma.tenantTrainer.findMany({
        where: { tenantId },
        include: {
          trainer: {
            select: {
              id: true,
              name: true,
              email: true,
              photoUrl: true,
              specializations: true,
              yearsOfExperience: true,
              isActive: true,
              accessGranted: true,
            },
          },
        },
        orderBy: { assignedAt: "desc" },
      }),
      prisma.trainer.findMany({
        where: { isActive: true, accessGranted: true },
        select: {
          id: true,
          name: true,
          email: true,
          photoUrl: true,
          specializations: true,
          yearsOfExperience: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);

    const assignedTrainerIds = new Set(assigned.map((a) => a.trainerId));
    const available = all.filter((t) => !assignedTrainerIds.has(t.id));

    return NextResponse.json({
      success: true,
      data: {
        assigned: assigned.map((a) => ({
          assignmentId: a.id,
          assignedAt: a.assignedAt,
          isActive: a.isActive,
          trainer: a.trainer,
        })),
        available,
      },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/superadmin/tenants/[id]/trainers]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST — Assign a trainer to the tenant                              */
/* ------------------------------------------------------------------ */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireSuperAdmin(token);
    if (!guard.ok) return guard.response;

    const { id: tenantId } = await params;
    const body = await request.json();
    const trainerId = typeof body.trainerId === "string" ? body.trainerId.trim() : null;

    if (!trainerId) {
      return NextResponse.json(
        { success: false, data: null, error: "trainerId is required" },
        { status: 400 },
      );
    }

    // Verify tenant and trainer both exist
    const [tenant, trainer] = await Promise.all([
      prisma.organization.findUnique({ where: { id: tenantId }, select: { id: true } }),
      prisma.trainer.findUnique({ where: { id: trainerId }, select: { id: true } }),
    ]);

    if (!tenant) {
      return NextResponse.json(
        { success: false, data: null, error: "Tenant not found" },
        { status: 404 },
      );
    }
    if (!trainer) {
      return NextResponse.json(
        { success: false, data: null, error: "Trainer not found" },
        { status: 404 },
      );
    }

    const assignment = await prisma.tenantTrainer.upsert({
      where: { tenantId_trainerId: { tenantId, trainerId } },
      create: { tenantId, trainerId, isActive: true },
      update: { isActive: true },
      include: {
        trainer: {
          select: { id: true, name: true, email: true, specializations: true },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: assignment, error: null },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/superadmin/tenants/[id]/trainers]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
