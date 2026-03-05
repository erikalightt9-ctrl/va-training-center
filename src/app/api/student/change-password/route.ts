import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { changePassword } from "@/lib/services/student-auth.service";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.id || token.role !== "student") {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const outcome = await changePassword(
      token.id as string,
      result.data.currentPassword,
      result.data.newPassword
    );

    if (!outcome.success) {
      return NextResponse.json(
        { success: false, data: null, error: outcome.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Password changed successfully" },
      error: null,
    });
  } catch (err) {
    console.error("[POST /api/student/change-password]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
