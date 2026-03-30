"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, ArrowRight, AlertCircle } from "lucide-react";

/**
 * TenantFinder
 *
 * Lets a user search for their organization by subdomain/slug.
 * On submit, looks up the org via /api/tenant/[slug] and either:
 *  - Redirects to the subdomain portal (e.g. tenantA.domain.com/login) when
 *    a ROOT_DOMAIN env is exposed, OR
 *  - Falls back to /tenant-login?slug=<slug> on the same origin.
 */
export function TenantFinder() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [checking, setChecking] = useState(false);

  async function handleFind(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!trimmed) return;

    setError("");
    setChecking(true);

    try {
      const res = await fetch(`/api/tenant/${trimmed}`);
      const data = await res.json();

      if (!data.success) {
        setError("Organization not found. Please check the name and try again.");
        setChecking(false);
        return;
      }

      // Try subdomain redirect first (works in production with custom subdomains)
      const rootDomain =
        typeof window !== "undefined"
          ? (window as Window & { __ROOT_DOMAIN__?: string }).__ROOT_DOMAIN__ ?? ""
          : "";

      if (rootDomain) {
        const url = new URL(`https://${trimmed}.${rootDomain}/login`);
        window.location.href = url.toString();
        return;
      }

      // Fallback: same-origin tenant-login route
      startTransition(() => {
        router.push(`/tenant-login?slug=${trimmed}`);
      });
    } catch {
      setError("Could not reach the server. Please try again.");
      setChecking(false);
    }
  }

  const loading = checking || isPending;

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleFind} className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300 pointer-events-none" />
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setError("");
            }}
            placeholder="your-organization"
            required
            autoComplete="off"
            spellCheck={false}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 text-xs text-red-300 bg-red-500/10 border border-red-400/20 rounded-lg px-3 py-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !slug.trim()}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white text-blue-900 font-semibold text-sm hover:bg-blue-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Go to Portal
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
