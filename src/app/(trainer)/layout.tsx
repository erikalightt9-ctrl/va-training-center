import { SessionProvider } from "@/components/admin/SessionProvider";

export default function TrainerRootLayout({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
