"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";

interface DiscussionMessage {
  readonly id: string;
  readonly senderType: string;
  readonly senderId: string;
  readonly senderName: string;
  readonly content: string;
  readonly createdAt: string;
}

interface Props {
  readonly courseId: string;
  readonly lessonId: string;
  readonly currentActorId: string;
  readonly currentActorType: string;
}

export function LessonDiscussionThread({ courseId, lessonId, currentActorId, currentActorType }: Props) {
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const apiBase = `/api/student/courses/${courseId}/lessons/${lessonId}/discussion`;

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(apiBase);
      const data = await res.json();
      if (data.success) setMessages(data.data.messages);
    } catch { /* ignore */ }
    setLoading(false);
  }, [apiBase]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setInput("");
        fetchMessages();
      } else {
        setError(data.error ?? "Failed to send");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setSending(false);
  }

  function isSelf(msg: DiscussionMessage): boolean {
    return msg.senderType === currentActorType && msg.senderId === currentActorId;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
        <MessageSquare className="h-4 w-4 text-blue-500" />
        <h3 className="text-sm font-semibold text-gray-700">Lesson Q&amp;A</h3>
        <span className="text-xs text-gray-400 ml-auto">{messages.length} message{messages.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-gray-400 text-sm">
            <div>
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No questions yet.</p>
              <p className="text-xs mt-1">Be the first to ask something about this lesson.</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${isSelf(msg) ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  isSelf(msg)
                    ? "bg-blue-600 text-white rounded-br-md"
                    : msg.senderType === "TRAINER"
                    ? "bg-amber-50 border border-amber-200 text-gray-800 rounded-bl-md"
                    : "bg-gray-100 text-gray-800 rounded-bl-md"
                }`}
              >
                {!isSelf(msg) && (
                  <p className={`text-[10px] font-semibold mb-0.5 ${
                    msg.senderType === "TRAINER" ? "text-amber-600" : "text-gray-400"
                  }`}>
                    {msg.senderName}
                    {msg.senderType === "TRAINER" && " · Trainer"}
                  </p>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isSelf(msg) ? "text-blue-200" : "text-gray-400"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-gray-200 p-3">
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); }
            }}
            placeholder="Ask a question about this lesson... (Enter to send)"
            rows={2}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-20"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 shrink-0"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
