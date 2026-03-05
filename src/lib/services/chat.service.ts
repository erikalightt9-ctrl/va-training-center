import OpenAI from "openai";
import { buildSystemPrompt } from "@/lib/chat-context";
import type { ChatMessage } from "@/lib/validations/chat.schema";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

const MODEL = "gpt-4o-mini";
const MAX_TOKENS = 300;
const TEMPERATURE = 0.7;

export async function streamChatResponse(
  messages: ChatMessage[]
): Promise<ReadableStream<Uint8Array>> {
  const systemPrompt = await buildSystemPrompt();

  const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const stream = await getOpenAI().chat.completions.create({
    model: MODEL,
    messages: openaiMessages,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    stream: true,
  });

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.error("Chat stream error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`
          )
        );
        controller.close();
      }
    },
  });
}
