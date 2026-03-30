import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ChatWidget } from "@/components/public/ChatWidget";
import { resolveTenantFromSubdomain } from "@/lib/tenant";

/**
 * Public layout — resolves tenant branding server-side and passes it
 * to Navbar/Footer so they render the correct tenant name and logo.
 */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const tenant = await resolveTenantFromSubdomain();

  const branding = tenant
    ? {
        siteName: tenant.tenant.siteName ?? tenant.tenant.name,
        logoUrl: tenant.tenant.logoUrl ?? null,
        primaryColor: tenant.tenant.primaryColor ?? null,
      }
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar branding={branding} />
      <main className="flex-1">{children}</main>
      <Footer siteName={branding?.siteName ?? null} />
      <ChatWidget />
    </div>
  );
}
