import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getTrainerDashboardStats } from "@/lib/repositories/trainer.repository";

/* ------------------------------------------------------------------ */
/*  GET — Trainer: dashboard statistics                                */
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
    const stats = await getTrainerDashboardStats(trainerId);

    return NextResponse.json({
      success: true,
      data: stats,
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/trainer/dashboard]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
