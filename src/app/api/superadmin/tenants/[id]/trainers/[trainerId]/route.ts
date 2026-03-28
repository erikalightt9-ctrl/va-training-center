import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireSuperAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  DELETE — Remove a trainer assignment from a tenant                 */
/* ------------------------------------------------------------------ */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; trainerId: string }> },
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireSuperAdmin(token);
    if (!guard.ok) return guard.response;

    const { id: tenantId, trainerId } = await params;

    const assignment = await prisma.tenantTrainer.findUnique({
      where: { tenantId_trainerId: { tenantId, trainerId } },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, data: null, error: "Assignment not found" },
        { status: 404 },
      );
    }

    await prisma.tenantTrainer.delete({
      where: { tenantId_trainerId: { tenantId, trainerId } },
    });

    return NextResponse.json({ success: true, data: null, error: null });
  } catch (err) {
    console.error("[DELETE /api/superadmin/tenants/[id]/trainers/[trainerId]]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
