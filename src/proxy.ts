/**
 * Next.js Edge Proxy entry point (renamed from middleware.ts per Next.js 16 convention).
 * Delegates all logic to src/tenant-proxy.ts which handles:
 *  - Subdomain extraction → tenant routing
 *  - Tenant login page rewrites
 *  - x-tenant-subdomain header injection
 *  - Auth guards for all protected routes
 *  - Cross-tenant session validation
 *
 * NOTE: `config` must be statically defined here — Next.js cannot parse re-exported configs.
 */
export { proxy as middleware } from "@/tenant-proxy";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
