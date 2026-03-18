import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/public/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | HUMI Training Center",
  description: "Set a new password for your HUMI Training Center account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Loading…</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
