import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { TrainerLayout } from "@/components/trainer/TrainerLayout";

export default async function TrainerPagesLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  const user = session?.user as
    | (typeof session & { user: { id: string; role: string } })["user"]
    | undefined;

  if (!user || user.role !== "trainer") {
    redirect("/trainer/login");
  }

  return <TrainerLayout>{children}</TrainerLayout>;
}
