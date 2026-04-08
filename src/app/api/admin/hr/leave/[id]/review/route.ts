import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guards";
import { reviewLeaveRequest } from "@/lib/repositories/hr-leave.repository";

const schema = z.object({
  action:     z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().max(300).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const body   = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
    }

    const req = await reviewLeaveRequest(
      guard.tenantId, id,
      parsed.data.action,
      (token as { id?: string }).id ?? "",
      parsed.data.reviewNote
    );

    return NextResponse.json({ success: true, data: req, error: null });
  } catch (err) {
    console.error("[POST /api/admin/hr/leave/[id]/review]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.includes("not found") ? 404 : message.includes("Only PENDING") ? 422 : 500;
    return NextResponse.json({ success: false, data: null, error: message }, { status });
  }
}
