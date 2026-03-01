import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const roleRedirects: Record<string, string> = {
    claimant: "/report",
    adjuster: "/claims",
    manager: "/pipeline",
    cxo: "/dashboard",
  };

  const dest = roleRedirects[session.user.role] ?? "/login";
  redirect(dest);
}
