import { redirect } from "next/navigation";

export default function TrainerLoginPage() {
  redirect("/portal?tab=trainer");
}
