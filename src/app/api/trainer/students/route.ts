import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getTrainerStudents } from "@/lib/repositories/trainer.repository";

/* ------------------------------------------------------------------ */
/*  GET — Trainer: list assigned students                              */
/* ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id || token.role !== "trainer") {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const trainerId = token.id as string;
    const students = await getTrainerStudents(trainerId);

    return NextResponse.json({
      success: true,
      data: students,
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/trainer/students]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
