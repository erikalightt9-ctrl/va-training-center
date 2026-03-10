import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getRatingsByTrainer,
  getTrainerRatingStats,
} from "@/lib/repositories/trainer-rating.repository";

/* ------------------------------------------------------------------ */
/*  GET — Trainer: ratings received with summary stats                 */
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

    const [ratings, stats] = await Promise.all([
      getRatingsByTrainer(trainerId),
      getTrainerRatingStats(trainerId),
    ]);

    return NextResponse.json({
      success: true,
      data: { ratings, stats },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/trainer/ratings]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
