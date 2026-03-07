import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { mentorshipRequestSchema } from "@/lib/validations/mentorship.schema";
import {
  getAvailableMentors,
  getStudentMentorshipRequests,
  hasPendingRequest,
  createMentorshipRequest,
} from "@/lib/repositories/mentorship.repository";

/* ------------------------------------------------------------------ */
/*  GET — Return available mentors + student's requests                */
/* ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id || token.role !== "student") {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const studentId = token.id as string;

    const [mentors, requests] = await Promise.all([
      getAvailableMentors(),
      getStudentMentorshipRequests(studentId),
    ]);

    return NextResponse.json({
      success: true,
      data: { mentors, requests },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/student/mentorship]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST — Create a mentorship request                                 */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id || token.role !== "student") {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const studentId = token.id as string;
    const body = await request.json();
    const result = mentorshipRequestSchema.safeParse(body);

    if (!result.success) {
      const firstError =
        result.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json(
        { success: false, data: null, error: firstError },
        { status: 422 },
      );
    }

    const { trainerId, message } = result.data;

    // Check for duplicate pending request
    const alreadyPending = await hasPendingRequest(studentId, trainerId);
    if (alreadyPending) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "You already have a pending request with this mentor",
        },
        { status: 409 },
      );
    }

    const mentorshipRequest = await createMentorshipRequest(
      studentId,
      trainerId,
      message,
    );

    return NextResponse.json(
      { success: true, data: mentorshipRequest, error: null },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/student/mentorship]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
