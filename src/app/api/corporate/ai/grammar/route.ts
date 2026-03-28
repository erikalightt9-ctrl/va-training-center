import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";

const schema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters").max(5000),
});

/* ------------------------------------------------------------------ */
/*  POST — Grammar check using AI                                      */
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
            content: `You are a professional grammar and writing coach. Return a JSON object with:
- "corrected": the corrected version of the text
- "changes": an array of short strings describing each change made (max 10 items)
Only return valid JSON, no markdown code blocks.`,
          },
          {
            role: "user",
            content: `Check and correct the following text:\n\n${text}`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error("[AI/grammar] OpenAI error:", response.status);
      return NextResponse.json(
        { success: false, data: null, error: "AI service error. Please try again." },
        { status: 502 },
      );
    }

    const result = await response.json();
    const rawContent = result.choices?.[0]?.message?.content ?? "{}";

    let parsed2: { corrected?: string; changes?: string[] };
    try {
      parsed2 = JSON.parse(rawContent) as typeof parsed2;
    } catch {
      parsed2 = { corrected: text, changes: [] };
    }

    return NextResponse.json({
      success: true,
      data: {
        corrected: parsed2.corrected ?? text,
        changes: parsed2.changes ?? [],
      },
      error: null,
    });
  } catch (err) {
    console.error("[POST /api/corporate/ai/grammar]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
