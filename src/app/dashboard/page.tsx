import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// A neutral post-login landing spot — Credentials sign-in can't branch its
// redirect target on the role it's about to discover, so it always sends
// here first and this routes on to the real destination.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardRouter() {
  const session = await auth();

  if (session?.user?.role === "ADMIN" || session?.user?.role === "SUPPORT_ADMIN") {
    redirect("/admin/dashboard");
  }
  if (session?.user?.role === "PARTNER") {
    redirect("/partner/dashboard");
  }

  redirect("/login");
}
