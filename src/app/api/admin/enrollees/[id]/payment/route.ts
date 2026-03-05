import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { findEnrolleeById, updateEnrolleePayment } from "@/lib/repositories/enrollee.repository";
import { paymentUpdateSchema } from "@/lib/validations/enrollee.schema";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.role || token.role !== "admin") {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const result = paymentUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: result.error.issues[0]?.message ?? "Invalid input" },
        { status: 422 }
      );
    }

    const enrollee = await findEnrolleeById(id);
    if (!enrollee) {
      return NextResponse.json(
        { success: false, data: null, error: "Enrollee not found" },
        { status: 404 }
      );
    }

    const coursePrice = Number(enrollee.enrollment.course.price);
    const updated = await updateEnrolleePayment(id, result.data.amountPaid, coursePrice);

    return NextResponse.json({ success: true, data: updated, error: null });
  } catch (err) {
    console.error("[PATCH /api/admin/enrollees/[id]/payment]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
