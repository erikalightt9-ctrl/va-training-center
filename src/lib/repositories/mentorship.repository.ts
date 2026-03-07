import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CourseInfo {
  readonly id: string;
  readonly title: string;
}

interface CourseTrainerWithCourse {
  readonly role: string;
  readonly course: CourseInfo;
}

export interface MentorProfile {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly bio: string | null;
  readonly specializations: ReadonlyArray<string>;
  readonly courses: ReadonlyArray<CourseTrainerWithCourse>;
}

export interface MentorshipRequestRecord {
  readonly id: string;
  readonly trainerId: string;
  readonly status: string;
  readonly message: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly trainer: {
    readonly name: string;
    readonly specializations: ReadonlyArray<string>;
  };
}

/* ------------------------------------------------------------------ */
/*  Read — Available mentors                                           */
/* ------------------------------------------------------------------ */

export async function getAvailableMentors(): Promise<
  ReadonlyArray<MentorProfile>
> {
  const trainers = await prisma.trainer.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      specializations: true,
      courses: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return trainers;
}

/* ------------------------------------------------------------------ */
/*  Read — Student mentorship requests                                 */
/* ------------------------------------------------------------------ */

export async function getStudentMentorshipRequests(
  studentId: string,
): Promise<ReadonlyArray<MentorshipRequestRecord>> {
  const requests = await prisma.mentorshipRequest.findMany({
    where: { studentId },
    include: {
      trainer: {
        select: {
          name: true,
          specializations: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return requests;
}

/* ------------------------------------------------------------------ */
/*  Read — Check for existing pending request                          */
/* ------------------------------------------------------------------ */

export async function hasPendingRequest(
  studentId: string,
  trainerId: string,
): Promise<boolean> {
  const count = await prisma.mentorshipRequest.count({
    where: {
      studentId,
      trainerId,
      status: "PENDING",
    },
  });

  return count > 0;
}

/* ------------------------------------------------------------------ */
/*  Write — Create mentorship request                                  */
/* ------------------------------------------------------------------ */

export async function createMentorshipRequest(
  studentId: string,
  trainerId: string,
  message: string,
): Promise<MentorshipRequestRecord> {
  const request = await prisma.mentorshipRequest.create({
    data: {
      studentId,
      trainerId,
      message,
    },
    include: {
      trainer: {
        select: {
          name: true,
          specializations: true,
        },
      },
    },
  });

  return request;
}
