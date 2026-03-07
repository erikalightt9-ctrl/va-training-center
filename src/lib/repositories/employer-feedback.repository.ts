import { prisma } from "@/lib/prisma";
import type { FeedbackCategory } from "@prisma/client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface EmployerFeedbackRecord {
  readonly id: string;
  readonly studentId: string;
  readonly reviewerName: string;
  readonly reviewerRole: string;
  readonly category: FeedbackCategory;
  readonly rating: number;
  readonly feedback: string;
  readonly createdAt: Date;
}

/* ------------------------------------------------------------------ */
/*  Read                                                               */
/* ------------------------------------------------------------------ */

export async function getStudentFeedback(
  studentId: string,
): Promise<ReadonlyArray<EmployerFeedbackRecord>> {
  const feedback = await prisma.employerFeedback.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });

  return feedback;
}
