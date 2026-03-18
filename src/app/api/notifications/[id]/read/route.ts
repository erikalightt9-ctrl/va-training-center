import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getActorFromToken } from "@/lib/auth-helpers";
import * as notificationRepo from "@/lib/repositories/notification.repository";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const actor = getActorFromToken(token);
    if (!actor) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Ownership check: only the recipient may mark their own notification read
    const notification = await notificationRepo.getNotificationById(id);
    if (!notification) {
      return NextResponse.json({ success: false, data: null, error: "Notification not found" }, { status: 404 });
    }
    if (
      notification.recipientType !== actor.actorType ||
      notification.recipientId !== actor.actorId
    ) {
      return NextResponse.json({ success: false, data: null, error: "Forbidden" }, { status: 403 });
    }

    await notificationRepo.markAsRead(id);

    return NextResponse.json({ success: true, data: null, error: null });
  } catch (err) {
    console.error("[POST /api/notifications/[id]/read]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}
