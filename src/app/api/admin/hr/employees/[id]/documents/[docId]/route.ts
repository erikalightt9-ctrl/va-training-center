import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAdmin } from "@/lib/auth-guards";
import { softDeleteDocument } from "@/lib/repositories/hr-employee.repository";
import { logAction } from "@/lib/repositories/acc-audit.repository";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { id: employeeId, docId } = await params;
    await softDeleteDocument(guard.tenantId, employeeId, docId);

    void logAction({
      organizationId:  guard.tenantId,
      entityType:      "HrEmployeeDocument",
      entityId:        docId,
      action:          "DELETE",
      changes:         { soft: true },
      performedById:   (token?.id   as string) ?? "",
      performedByName: (token?.name as string) ?? "",
      performedByRole: "admin",
    });

    return NextResponse.json({ success: true, data: null, error: null });
  } catch (err) {
    console.error("[DELETE /api/admin/hr/employees/[id]/documents/[docId]]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
