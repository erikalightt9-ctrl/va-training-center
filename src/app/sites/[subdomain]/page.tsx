import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookOpen } from "lucide-react";

// ---------------------------------------------------------------------------
// Data fetch
// ---------------------------------------------------------------------------

async function getOrgBySubdomain(subdomain: string) {
  return prisma.organization.findFirst({
    where: { subdomain, isActive: true },
    select: {
      name: true,
      tagline: true,
      mission: true,
      vision: true,
      logoUrl: true,
      bannerImageUrl: true,
      primaryColor: true,
      secondaryColor: true,
      industry: true,
      _count: { select: { courses: true, students: true } },
    },
  });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PublicTenantSitePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const org = await getOrgBySubdomain(subdomain).catch(() => null);

  if (!org) notFound();

  const primary   = org.primaryColor   ?? "#1d4ed8";
  const secondary = org.secondaryColor ?? "#93c5fd";

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-10 bg-white border-b"
        style={{ borderColor: `${primary}33` }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {org.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logoUrl} alt={`${org.name} logo`} className="h-8 object-contain" />
            ) : (
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: primary }}
              >
                <BookOpen className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="font-bold text-lg" style={{ color: primary }}>
              {org.name}
            </span>
          </div>
          <a
            href="/corporate/login"
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: primary }}
          >
            Portal Login
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative py-24 px-6 text-center text-white"
        style={{
          background: org.bannerImageUrl
            ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.6)), url(${org.bannerImageUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
        }}
      >
        <div className="max-w-3xl mx-auto space-y-5">
          {org.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={org.logoUrl}
              alt={`${org.name} logo`}
              className="h-16 object-contain mx-auto mb-2 drop-shadow"
            />
          )}
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight drop-shadow">
            {org.name}
          </h1>
          {org.tagline && (
            <p className="text-lg sm:text-xl text-white/85 max-w-xl mx-auto">
              {org.tagline}
            </p>
          )}
          <div className="flex justify-center gap-8 mt-6 text-sm text-white/75">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{org._count.courses}</p>
              <p>Courses</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{org._count.students}</p>
              <p>Students</p>
            </div>
            {org.industry && (
              <>
                <div className="w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white capitalize">{org.industry}</p>
                  <p>Industry</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      {(org.mission || org.vision) && (
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-10">
            {org.mission && (
              <div className="space-y-3">
                <div
                  className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${primary}18`, color: primary }}
                >
                  Our Mission
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">{org.mission}</p>
              </div>
            )}
            {org.vision && (
              <div className="space-y-3">
                <div
                  className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${secondary}33`, color: primary }}
                >
                  Our Vision
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">{org.vision}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Ready to start learning?
          </h2>
          <p className="text-gray-500">
            Access your training portal to view courses, track progress, and grow your skills.
          </p>
          <a
            href="/corporate/login"
            className="inline-block mt-4 text-white font-semibold px-8 py-3 rounded-xl transition-opacity hover:opacity-90"
            style={{ backgroundColor: primary }}
          >
            Access the Portal →
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="border-t py-6 px-6 text-center text-sm text-gray-400"
        style={{ borderColor: `${primary}22` }}
      >
        © {new Date().getFullYear()} {org.name}. All rights reserved. &nbsp;·&nbsp;
        Powered by{" "}
        <span className="font-semibold" style={{ color: primary }}>
          VA Training Center
        </span>
      </footer>
    </div>
  );
}
