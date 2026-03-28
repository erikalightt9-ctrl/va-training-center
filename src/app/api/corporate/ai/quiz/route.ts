import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";

const schema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters").max(500),
  numQuestions: z.number().int().min(1).max(20).default(5),
});

/* ------------------------------------------------------------------ */
/*  POST — Generate quiz questions using AI                           */
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

    const { topic, numQuestions } = parsed.data;

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
            content: `You are a quiz generator for corporate training. Generate multiple-choice quiz questions. Return a JSON object with:
- "questions": array of objects, each with:
  - "question": the question text
  - "options": array of 4 answer strings
  - "answer": the correct answer string (must match exactly one option)
Only return valid JSON, no markdown.`,
          },
          {
            role: "user",
            content: `Generate ${numQuestions} multiple-choice questions about: ${topic}`,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error("[AI/quiz] OpenAI error:", response.status);
      return NextResponse.json(
        { success: false, data: null, error: "AI service error. Please try again." },
        { status: 502 },
      );
    }

    const result = await response.json();
    const rawContent = result.choices?.[0]?.message?.content ?? "{}";

    let parsed2: { questions?: Array<{ question: string; options: string[]; answer: string }> };
    try {
      parsed2 = JSON.parse(rawContent) as typeof parsed2;
    } catch {
      parsed2 = { questions: [] };
    }

    return NextResponse.json({
      success: true,
      data: { questions: parsed2.questions ?? [] },
      error: null,
    });
  } catch (err) {
    console.error("[POST /api/corporate/ai/quiz]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
