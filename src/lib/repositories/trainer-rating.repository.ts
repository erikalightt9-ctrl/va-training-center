import { prisma } from "@/lib/prisma";
import type { TrainerRating } from "@prisma/client";

// ── Types ──────────────────────────────────────────────────────────

interface TrainerRatingWithStudent extends TrainerRating {
  readonly student: {
    readonly id: string;
    readonly name: string;
    readonly avatarUrl: string | null;
  };
}

interface TrainerRatingStats {
  readonly averageRating: number | null;
  readonly totalRatings: number;
}

// ── Queries ─────────────────────────────────────────────────────────

export async function getRatingsByTrainer(
  trainerId: string,
): Promise<ReadonlyArray<TrainerRatingWithStudent>> {
  return prisma.trainerRating.findMany({
    where: { trainerId },
    include: {
      student: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStudentRatingForTrainer(
  studentId: string,
  trainerId: string,
): Promise<TrainerRating | null> {
  return prisma.trainerRating.findUnique({
    where: { trainerId_studentId: { trainerId, studentId } },
  });
}

export async function getTrainerRatingStats(
  trainerId: string,
): Promise<TrainerRatingStats> {
  const result = await prisma.trainerRating.aggregate({
    where: { trainerId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    averageRating: result._avg.rating,
    totalRatings: result._count.rating,
  };
}

// ── Mutations ───────────────────────────────────────────────────────

export async function upsertTrainerRating(
  trainerId: string,
  studentId: string,
  rating: number,
  review?: string | null,
): Promise<TrainerRating> {
  const result = await prisma.trainerRating.upsert({
    where: { trainerId_studentId: { trainerId, studentId } },
    create: { trainerId, studentId, rating, review: review ?? null },
    update: { rating, review: review ?? null },
  });

  // Recalculate denormalized stats on the trainer
  await recalculateTrainerRatingStats(trainerId);

  return result;
}

export async function deleteTrainerRating(
  trainerId: string,
  studentId: string,
): Promise<void> {
  await prisma.trainerRating.delete({
    where: { trainerId_studentId: { trainerId, studentId } },
  });

  await recalculateTrainerRatingStats(trainerId);
}

// ── Denormalized stat recalculation ─────────────────────────────────

export async function recalculateTrainerRatingStats(
  trainerId: string,
): Promise<void> {
  const stats = await getTrainerRatingStats(trainerId);

  await prisma.trainer.update({
    where: { id: trainerId },
    data: {
      averageRating: stats.averageRating ?? null,
      totalRatings: stats.totalRatings,
    },
  });
}

export async function recalculateTrainerStudentCount(
  trainerId: string,
): Promise<void> {
  const count = await prisma.student.count({
    where: { trainerId },
  });

  await prisma.trainer.update({
    where: { id: trainerId },
    data: { studentsTrainedCount: count },
  });
}
