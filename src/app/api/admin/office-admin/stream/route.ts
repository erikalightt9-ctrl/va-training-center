import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAdmin } from "@/lib/auth-guards";
import { emitter, OfficeEvent } from "@/lib/office-emitter";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const guard = requireAdmin(token);
  if (!guard.ok) return guard.response;

  const subcard = new URL(request.url).searchParams.get("subcard") ?? "";

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: OfficeEvent) => {
        if (subcard && event.subcard !== subcard) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          emitter.off("office", send);
        }
      };

      // Heartbeat every 25 s to keep the connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
          emitter.off("office", send);
        }
      }, 25_000);

      emitter.on("office", send);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        emitter.off("office", send);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection":    "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
