import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        priceBasic: true,
        priceProfessional: true,
        priceAdvanced: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, data: null, error: "Course not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        priceBasic: Number(course.priceBasic),
        priceProfessional: Number(course.priceProfessional),
        priceAdvanced: Number(course.priceAdvanced),
      },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/courses/[courseId]/pricing]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
