import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "va-training-center.vercel.app";
const ENABLE_SUBDOMAIN_ROUTING = process.env.ENABLE_SUBDOMAIN_ROUTING === "true";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  // Skip static files, _next internals, and API auth routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Extract subdomain if enabled
  if (ENABLE_SUBDOMAIN_ROUTING) {
    const hostname = host.split(":")[0]; // strip port
    const rootDomain = ROOT_DOMAIN.split(":")[0];

    // Only extract subdomain if the host ends with our root domain
    if (hostname.endsWith(`.${rootDomain}`)) {
      const subdomain = hostname.replace(`.${rootDomain}`, "");
      // Skip reserved subdomains
      const RESERVED = new Set(["www", "app", "admin", "api", "mail", "smtp"]);
      if (subdomain && !RESERVED.has(subdomain)) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-tenant-subdomain", subdomain);
        return NextResponse.next({ request: { headers: requestHeaders } });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
