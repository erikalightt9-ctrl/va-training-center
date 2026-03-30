import { NextResponse } from "next/server";
import { getActiveTiers } from "@/lib/repositories/tier.repository";

export async function GET() {
  try {
    const tiers = await getActiveTiers();
    return NextResponse.json({ success: true, data: tiers, error: null });
  } catch (err) {
    console.error("[GET /api/tiers]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
