import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getActorFromToken } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ courseId: string; lessonId: string }> };

/* ------------------------------------------------------------------ */
/*  GET — load (or create) the lesson discussion thread                */
/* ------------------------------------------------------------------ */

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const actor = getActorFromToken(token);
    if (!actor) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, lessonId } = await params;

    // Find the shared lesson discussion conversation (one per lesson, shared by all)
    let conversation = await prisma.conversation.findFirst({
      where: { type: "LESSON_DISCUSSION", lessonId, courseId, isActive: true },
      include: { participants: true },
    });

    if (!conversation) {
      // Create it — seed with all trainers assigned to this course
      const courseTrainers = await prisma.courseTrainer.findMany({
        where: { courseId },
        select: { trainerId: true },
      });

      conversation = await prisma.conversation.create({
        data: {
          type: "LESSON_DISCUSSION",
          courseId,
          lessonId,
          createdByType: actor.actorType,
          createdById: actor.actorId,
          participants: {
            create: [
              { actorType: actor.actorType, actorId: actor.actorId },
              ...courseTrainers
                .filter((t) => !(actor.actorType === "TRAINER" && t.trainerId === actor.actorId))
                .map((t) => ({ actorType: "TRAINER" as const, actorId: t.trainerId })),
            ],
          },
        },
        include: { participants: true },
      });
    } else {
      // Ensure the current actor is a participant
      const isParticipant = conversation.participants.some(
        (p) => p.actorType === actor.actorType && p.actorId === actor.actorId
      );
      if (!isParticipant) {
        await prisma.conversationParticipant.create({
          data: { conversationId: conversation.id, actorType: actor.actorType, actorId: actor.actorId },
        });
      }
    }

    // Fetch messages with sender name resolution
    const messages = await prisma.directMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    // Resolve sender names
    const senderKeys = [...new Set(messages.map((m) => `${m.senderType}:${m.senderId}`))];
    const nameMap = new Map<string, string>();

    await Promise.all(
      senderKeys.map(async (key) => {
        const [type, id] = key.split(":");
        let name = "User";
        if (type === "ADMIN") {
          const r = await prisma.admin.findUnique({ where: { id }, select: { name: true } });
          name = r?.name ?? "Admin";
        } else if (type === "TRAINER") {
          const r = await prisma.trainer.findUnique({ where: { id }, select: { name: true } });
          name = r?.name ?? "Trainer";
        } else if (type === "STUDENT") {
          const r = await prisma.student.findUnique({ where: { id }, select: { name: true } });
          name = r?.name ?? "Student";
        } else if (type === "CORPORATE_MANAGER") {
          const r = await prisma.corporateManager.findUnique({ where: { id }, select: { name: true } });
          name = r?.name ?? "Corporate";
        }
        nameMap.set(key, name);
      })
    );

    const enriched = messages.map((m) => ({
      ...m,
      senderName: nameMap.get(`${m.senderType}:${m.senderId}`) ?? "User",
      createdAt: m.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: { conversationId: conversation.id, messages: enriched },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/student/.../discussion]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  POST — send a message to the lesson discussion thread              */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const actor = getActorFromToken(token);
    if (!actor) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, lessonId } = await params;
    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content) {
      return NextResponse.json({ success: false, data: null, error: "Message cannot be empty" }, { status: 422 });
    }

    const conversation = await prisma.conversation.findFirst({
      where: { type: "LESSON_DISCUSSION", lessonId, courseId, isActive: true },
    });
    if (!conversation) {
      return NextResponse.json({ success: false, data: null, error: "Discussion not found — load the thread first" }, { status: 404 });
    }

    const [message] = await Promise.all([
      prisma.directMessage.create({
        data: {
          conversationId: conversation.id,
          senderType: actor.actorType,
          senderId: actor.actorId,
          content,
        },
      }),
      prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { ...message, createdAt: message.createdAt.toISOString() },
      error: null,
    }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/student/.../discussion]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}
