import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import {
  getTrainerById,
  updateTrainer,
} from "@/lib/repositories/trainer.repository";

/* ------------------------------------------------------------------ */
/*  Validation — Only self-editable trainer profile fields              */
/* ------------------------------------------------------------------ */

const trainerProfileUpdateSchema = z.object({
  bio: z
    .string()
    .max(2000, "Bio must be 2000 characters or fewer")
    .optional()
    .nullable(),
  phone: z
    .string()
    .max(20, "Phone must be 20 characters or fewer")
    .optional()
    .nullable(),
  photoUrl: z
    .string()
    .max(500000, "Photo is too large")
    .optional()
    .nullable(),
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

interface ReadonlyTrainerProfile {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string | null;
  readonly bio: string | null;
  readonly photoUrl: string | null;
  readonly specializations: ReadonlyArray<string>;
  readonly tier: string;
  readonly credentials: string | null;
  readonly certifications: ReadonlyArray<string>;
  readonly industryExperience: string | null;
  readonly yearsOfExperience: number;
  readonly averageRating: number | null;
  readonly totalRatings: number;
  readonly isActive: boolean;
  readonly accessGranted: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

function excludePasswordHash(trainer: Record<string, unknown>): ReadonlyTrainerProfile {
  const { passwordHash: _removed, ...profile } = trainer;
  return profile as unknown as ReadonlyTrainerProfile;
}

/* ------------------------------------------------------------------ */
/*  GET — Trainer: own profile (excluding passwordHash)                 */
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
    const trainer = await getTrainerById(trainerId);

    if (!trainer) {
      return NextResponse.json(
        { success: false, data: null, error: "Trainer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: excludePasswordHash(trainer as unknown as Record<string, unknown>),
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/trainer/profile]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH — Trainer: update own profile (bio, phone, photoUrl only)     */
/* ------------------------------------------------------------------ */

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const parsed = trainerProfileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json(
        { success: false, data: null, error: firstIssue },
        { status: 422 },
      );
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.bio !== undefined) updateData.bio = parsed.data.bio;
    if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;
    if (parsed.data.photoUrl !== undefined) updateData.photoUrl = parsed.data.photoUrl;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, data: null, error: "No fields to update" },
        { status: 422 },
      );
    }

    const updated = await updateTrainer(trainerId, updateData);

    return NextResponse.json({
      success: true,
      data: excludePasswordHash(updated as unknown as Record<string, unknown>),
      error: null,
    });
  } catch (err) {
    console.error("[PATCH /api/trainer/profile]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
