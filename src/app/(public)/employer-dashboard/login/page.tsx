import type { Metadata } from "next";
import { EmployerAuthForm } from "@/components/employer/EmployerAuthForm";

export const metadata: Metadata = { title: "Employer Login — Humi Hub" };

export default function EmployerLoginPage() {
  return <EmployerAuthForm defaultMode="login" />;
}
