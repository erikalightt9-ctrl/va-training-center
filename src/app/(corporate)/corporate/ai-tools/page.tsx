"use client";

import { useState } from "react";
import {
  Sparkles,
  FileText,
  CheckCircle,
  HelpCircle,
  Loader2,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ActiveTool = "summarize" | "grammar" | "quiz";

/* ------------------------------------------------------------------ */
/*  Copy button                                                        */
/* ------------------------------------------------------------------ */

function CopyButton({ text }: { readonly text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Summarize Tool                                                     */
/* ------------------------------------------------------------------ */

function SummarizeTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRun() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const r = await fetch("/api/corporate/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const json = await r.json();
      if (json.success) setResult(json.data.summary);
      else setError(json.error ?? "Something went wrong");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Paste your text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Paste course material, meeting notes, training content…"
        />
        <p className="text-xs text-gray-400 mt-1">{input.length} characters</p>
      </div>
      <button
        onClick={handleRun}
        disabled={loading || !input.trim()}
        className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 disabled:opacity-50 transition-colors"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Summarize
      </button>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {result && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">Summary</p>
            <CopyButton text={result} />
          </div>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Grammar Check Tool                                                 */
/* ------------------------------------------------------------------ */

function GrammarTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ corrected: string; changes: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRun() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const r = await fetch("/api/corporate/ai/grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const json = await r.json();
      if (json.success) setResult(json.data);
      else setError(json.error ?? "Something went wrong");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Text to check</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Enter text to check for grammar and style…"
        />
      </div>
      <button
        onClick={handleRun}
        disabled={loading || !input.trim()}
        className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 disabled:opacity-50 transition-colors"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
        Check Grammar
      </button>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-green-700">Corrected Text</p>
              <CopyButton text={result.corrected} />
            </div>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{result.corrected}</p>
          </div>
          {result.changes.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Changes Made ({result.changes.length})</p>
              <ul className="space-y-1">
                {result.changes.map((change, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz Generator Tool                                                */
/* ------------------------------------------------------------------ */

function QuizTool() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [result, setResult] = useState<Array<{ question: string; options: string[]; answer: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRun() {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setResult([]);
    try {
      const r = await fetch("/api/corporate/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, numQuestions }),
      });
      const json = await r.json();
      if (json.success) setResult(json.data.questions ?? []);
      else setError(json.error ?? "Something went wrong");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Topic or content</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Workplace safety, Customer service, OSHA regulations…"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Questions</label>
          <select
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[3, 5, 10].map((n) => (
              <option key={n} value={n}>{n} questions</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleRun}
        disabled={loading || !topic.trim()}
        className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 disabled:opacity-50 transition-colors"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HelpCircle className="h-4 w-4" />}
        Generate Quiz
      </button>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {result.length > 0 && (
        <div className="space-y-4">
          {result.map((q, qi) => (
            <div key={qi} className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-900">
                Q{qi + 1}. {q.question}
              </p>
              <ul className="space-y-1">
                {q.options.map((opt, oi) => (
                  <li
                    key={oi}
                    className={`text-xs px-3 py-1.5 rounded-lg ${
                      opt === q.answer
                        ? "bg-green-100 text-green-800 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    {String.fromCharCode(65 + oi)}. {opt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const TOOLS: ReadonlyArray<{ id: ActiveTool; label: string; description: string; icon: React.ReactNode }> = [
  { id: "summarize", label: "Summarize", description: "Condense long content into key points", icon: <FileText className="h-4 w-4" /> },
  { id: "grammar",   label: "Grammar Check", description: "Fix grammar and improve writing style", icon: <CheckCircle className="h-4 w-4" /> },
  { id: "quiz",      label: "Quiz Generator", description: "Auto-generate quiz questions from any topic", icon: <HelpCircle className="h-4 w-4" /> },
];

export default function CorporateAiToolsPage() {
  const [active, setActive] = useState<ActiveTool>("summarize");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Tools</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Summarize training content, check grammar, and generate quizzes — powered by AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tool selector */}
        <div className="space-y-2">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActive(tool.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                active === tool.id
                  ? "border-pink-300 bg-pink-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className={`flex items-center gap-2 font-medium text-sm mb-0.5 ${active === tool.id ? "text-pink-700" : "text-gray-900"}`}>
                <span className={active === tool.id ? "text-pink-600" : "text-gray-400"}>{tool.icon}</span>
                {tool.label}
              </div>
              <p className="text-xs text-gray-500">{tool.description}</p>
            </button>
          ))}

          {/* AI badge */}
          <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100">
            <Sparkles className="h-3.5 w-3.5 text-pink-500 shrink-0" />
            <p className="text-xs text-gray-500">Powered by AI — results may vary</p>
          </div>
        </div>

        {/* Active tool */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          {active === "summarize" && <SummarizeTool />}
          {active === "grammar"   && <GrammarTool />}
          {active === "quiz"      && <QuizTool />}
        </div>
      </div>
    </div>
  );
}
