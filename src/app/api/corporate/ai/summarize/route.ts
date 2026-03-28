import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";

const schema = z.object({
  text: z.string().min(50, "Text must be at least 50 characters").max(10000),
});

/* ------------------------------------------------------------------ */
/*  POST — Summarize text using AI                                     */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (
      !token?.id ||
      (token.role !== "corporate" && token.role !== "tenant_admin")
    ) {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: parsed.error.issues[0].message },
        { status: 422 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, data: null, error: "AI features are not configured" },
        { status: 503 },
      );
    }

    const { text } = parsed.data;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a concise summarizer for training content. Provide a clear, bullet-pointed summary of the key points from the given text. Focus on actionable takeaways.",
          },
          { role: "user", content: `Summarize the following:\n\n${text}` },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.error("[AI/summarize] OpenAI error:", errBody);
      return NextResponse.json(
        { success: false, data: null, error: "AI service error. Please try again." },
        { status: 502 },
      );
    }

    const result = await response.json();
    const summary = (result.choices?.[0]?.message?.content ?? "").trim();

    return NextResponse.json({ success: true, data: { summary }, error: null });
  } catch (err) {
    console.error("[POST /api/corporate/ai/summarize]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
