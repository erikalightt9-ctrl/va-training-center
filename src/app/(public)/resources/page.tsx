import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Rocket,
  Zap,
  Target,
  Play,
  Clock,
  MessageSquare,
  FolderKanban,
  Bot,
  Calculator,
  Users,
  Palette,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resources & Tools",
  description:
    "Free VA resources, industry guides, lesson previews, and essential tools to kickstart your virtual assistant career.",
};

interface FreeLessonCard {
  readonly id: string;
  readonly title: string;
  readonly durationMin: number;
  readonly course: {
    readonly slug: string;
    readonly title: string;
  };
}

const guides = [
  {
    icon: Rocket,
    title: "Getting Started as a Virtual Assistant",
    description:
      "Overview of the VA industry, skills needed, earning potential.",
  },
  {
    icon: Zap,
    title: "AI Tools Every VA Should Know",
    description:
      "Essential AI tools for productivity: ChatGPT, Claude, automation tools.",
  },
  {
    icon: Target,
    title: "How to Land Your First VA Client",
    description:
      "Tips for building your profile, finding clients, setting rates.",
  },
] as const;

const toolCategories = [
  {
    icon: MessageSquare,
    label: "Communication",
    tools: ["Slack", "Zoom", "Microsoft Teams", "Google Meet"],
  },
  {
    icon: FolderKanban,
    label: "Project Management",
    tools: ["Asana", "Trello", "Monday.com", "ClickUp"],
  },
  {
    icon: Bot,
    label: "AI & Automation",
    tools: ["ChatGPT", "Claude", "Zapier", "Make"],
  },
  {
    icon: Calculator,
    label: "Bookkeeping",
    tools: ["QuickBooks", "Xero", "FreshBooks", "Wave"],
  },
  {
    icon: Users,
    label: "CRM",
    tools: ["HubSpot", "Salesforce", "Pipedrive", "Zoho"],
  },
  {
    icon: Palette,
    label: "Design",
    tools: ["Canva", "Adobe Express", "Figma"],
  },
] as const;

function courseSlugToUrlSlug(slug: string): string {
  return slug.toLowerCase().replace(/_/g, "-");
}

export default async function ResourcesPage() {
  const freeLessons: readonly FreeLessonCard[] = await prisma.lesson.findMany({
    where: { isFreePreview: true, isPublished: true },
    include: { course: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-blue-900 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-amber-300" />
          <h1 className="text-4xl font-extrabold mb-4">Resources & Tools</h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Free guides, lesson previews, and essential tools to help you launch
            and grow your virtual assistant career.
          </p>
        </div>
      </section>

      {/* Free Lesson Previews */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              Try Before You Enroll
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              Free Lesson Previews
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get a taste of our training programs with these free preview
              lessons. No account required.
            </p>
          </div>

          {freeLessons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {freeLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {lesson.course.title}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {lesson.title}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                    <Clock className="h-4 w-4" />
                    <span>{lesson.durationMin} min</span>
                  </div>
                  <div className="mt-auto">
                    <Link
                      href={`/programs/${courseSlugToUrlSlug(lesson.course.slug)}/preview/${lesson.id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                      <Play className="h-4 w-4" />
                      Preview Lesson
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center bg-gray-50 rounded-xl p-12">
              <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                Free previews coming soon
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Check back later for free lesson previews from our programs.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* VA Industry Guides */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              Guides & Resources
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              VA Industry Guides
            </h2>
            <p className="text-gray-600">
              Essential reading for aspiring and working virtual assistants.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <div
                key={guide.title}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
              >
                <guide.icon className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  {guide.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {guide.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Essential VA Tools */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              Essential VA Tools
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              Tools & Software
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The most popular tools used by professional virtual assistants,
              organized by category.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolCategories.map((category) => (
              <div
                key={category.label}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center">
                    <category.icon className="h-5 w-5 text-blue-700" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {category.label}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.tools.map((tool) => (
                    <Badge
                      key={tool}
                      variant="outline"
                      className="text-xs text-gray-700"
                    >
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-700 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-4">Get Full Access</h2>
          <p className="text-blue-100 mb-8">
            Enroll today to unlock all resources, lesson materials, AI tools
            training, and community support.
          </p>
          <Link
            href="/enroll"
            className="inline-flex items-center justify-center rounded-md bg-amber-300 text-gray-900 font-semibold px-8 py-3 hover:bg-amber-400 transition-colors"
          >
            Enroll Now
          </Link>
        </div>
      </section>
    </div>
  );
}
