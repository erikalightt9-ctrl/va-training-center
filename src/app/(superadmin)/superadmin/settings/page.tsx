import { Settings } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PlatformSettingsForm } from "@/components/superadmin/PlatformSettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings | Super Admin" };

export default async function SuperAdminSettingsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { isSuperAdmin?: boolean } | undefined;
  if (!user?.isSuperAdmin) redirect("/superadmin/login");

  // Read env vars server-side only (never sent to client)
  const env = {
    nodeEnv:      process.env.NODE_ENV ?? "(not set)",
    rootDomain:   process.env.ROOT_DOMAIN ?? "(not set)",
    nextauthUrl:  process.env.NEXTAUTH_URL ?? "(not set)",
    nextauthSecret: !!process.env.NEXTAUTH_SECRET,
    databaseUrl:    !!process.env.DATABASE_URL,
    gmailUser:    process.env.GMAIL_USER
      ? `${process.env.GMAIL_USER.slice(0, 6)}…`
      : "(not set)",
    gmailPass:      !!process.env.GMAIL_APP_PASSWORD,
    emailFrom:    process.env.EMAIL_FROM_ADDRESS ?? "(not set)",
    emailFromName: process.env.EMAIL_FROM_NAME ?? "(not set)",
    supportEmail: process.env.SUPPORT_EMAIL ?? "(not set)",
    stripeKey:      !!process.env.STRIPE_SECRET_KEY,
    stripeWebhook:  !!process.env.STRIPE_WEBHOOK_SECRET,
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-50 rounded-lg p-2">
          <Settings className="h-5 w-5 text-blue-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-sm text-gray-500">
            Configure platform-wide defaults and view environment configuration.
          </p>
        </div>
      </div>

      {/* Client form (editable settings) + read-only env panel */}
      <PlatformSettingsForm env={env} />
    </div>
  );
}
