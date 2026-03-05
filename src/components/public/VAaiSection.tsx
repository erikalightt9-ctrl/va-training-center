import {
  Brain,
  Bot,
  Zap,
  UserCheck,
  MessageSquare,
  ShieldCheck,
  ClipboardCheck,
  FileText,
  BarChart3,
  Lightbulb,
  Layers,
  ArrowRight,
} from "lucide-react";

const humanStrengths = [
  { icon: UserCheck, text: "Judgment & context awareness" },
  { icon: MessageSquare, text: "Client relationship management" },
  { icon: ShieldCheck, text: "Decision-making under ambiguity" },
  { icon: ClipboardCheck, text: "End-to-end process ownership" },
  { icon: Brain, text: "Accountability & quality verification" },
] as const;

const aiStrengths = [
  { icon: FileText, text: "Drafting emails & documents" },
  { icon: BarChart3, text: "Summarizing long content" },
  { icon: Layers, text: "Generating templates & reports" },
  { icon: Bot, text: "Data formatting & automation" },
  { icon: Lightbulb, text: "Idea generation & research" },
] as const;

const combinedResults = [
  { ai: "AI drafts", you: "you refine & deliver" },
  { ai: "AI sorts", you: "you decide & prioritize" },
  { ai: "AI templates", you: "you customize & personalize" },
  { ai: "AI automates", you: "you verify & communicate" },
] as const;

export function VAaiSection() {
  return (
    <section className="py-20 px-4 bg-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Zap className="h-4 w-4" />
            Our Competitive Advantage
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            The Future of Virtual Assistance:{" "}
            <span className="text-blue-700">Human + AI</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Our graduates don&apos;t just learn VA skills — they learn to multiply their
            output with AI tools, making them 3x more productive than traditional VAs.
          </p>
        </div>

        {/* Three Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Human VA Strengths */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-5">
              <Brain className="h-6 w-6 text-blue-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Human VA</h3>
            <p className="text-sm text-blue-600 font-medium mb-5">
              Judgment + Responsibility
            </p>
            <ul className="space-y-3">
              {humanStrengths.map((item) => (
                <li key={item.text} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="text-sm text-gray-700">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Tool Strengths */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-5">
              <Bot className="h-6 w-6 text-purple-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">AI Tools</h3>
            <p className="text-sm text-purple-600 font-medium mb-5">
              Speed + Assistance
            </p>
            <ul className="space-y-3">
              {aiStrengths.map((item) => (
                <li key={item.text} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-purple-600 shrink-0" />
                  <span className="text-sm text-gray-700">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Combined Result — highlighted */}
          <div className="bg-gradient-to-br from-blue-700 to-blue-800 rounded-2xl p-8 text-white shadow-lg ring-2 ring-blue-400/30">
            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-5">
              <Zap className="h-6 w-6 text-amber-300" />
            </div>
            <h3 className="text-xl font-bold mb-1">VA + AI</h3>
            <p className="text-sm text-amber-300 font-medium mb-5">
              3x Productivity + 100% Accountability
            </p>
            <ul className="space-y-4 mb-6">
              {combinedResults.map((item) => (
                <li key={item.ai} className="flex items-center gap-2 text-sm">
                  <span className="text-blue-200">{item.ai}</span>
                  <ArrowRight className="h-3 w-3 text-amber-300 shrink-0" />
                  <span className="font-semibold text-white">{item.you}</span>
                </li>
              ))}
            </ul>
            <div className="bg-white/10 rounded-xl p-4 border border-white/20">
              <p className="text-sm text-blue-100 leading-relaxed">
                <strong className="text-white">This is what we teach.</strong>{" "}
                Our graduates work smarter, deliver faster, and earn more — because
                they know how to use AI as their competitive edge.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
