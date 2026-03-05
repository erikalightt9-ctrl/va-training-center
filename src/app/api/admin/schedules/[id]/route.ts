import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  findScheduleById,
  updateSchedule,
  deleteSchedule,
} from "@/lib/repositories/schedule.repository";
import { updateScheduleSchema } from "@/lib/validations/schedule.schema";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schedule = await findScheduleById(id);

    if (!schedule) {
      return NextResponse.json(
        { success: false, data: null, error: "Schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: schedule, error: null });
  } catch (err) {
    console.error("[GET /api/admin/schedules/[id]]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.id) {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const existing = await findScheduleById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, error: "Schedule not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = updateScheduleSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? "Validation failed";
      return NextResponse.json(
        { success: false, data: null, error: firstError },
        { status: 422 }
      );
    }

    const updated = await updateSchedule(id, result.data);

    return NextResponse.json({ success: true, data: updated, error: null });
  } catch (err) {
    console.error("[PATCH /api/admin/schedules/[id]]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.id) {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await deleteSchedule(id);

    return NextResponse.json({ success: true, data: null, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = message.includes("Cannot delete") ? 409 : 500;
    console.error("[DELETE /api/admin/schedules/[id]]", err);
    return NextResponse.json(
      { success: false, data: null, error: message },
      { status }
    );
  }
}
