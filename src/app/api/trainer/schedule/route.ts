import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getTrainerSchedules } from "@/lib/repositories/trainer.repository";

/* ------------------------------------------------------------------ */
/*  GET — Trainer: list assigned schedules                             */
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
    const schedules = await getTrainerSchedules(trainerId);

    return NextResponse.json({
      success: true,
      data: schedules,
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/trainer/schedule]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
