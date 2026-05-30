import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildAuthService } from "@/lib/container";

/** Entry point: route users to their dashboard, or to sign-in. */
export default async function Home() {
  const supabase = createClient();
  const user = await buildAuthService(supabase).getCurrentUser();

  if (!user) redirect("/auth/signin");
  redirect(user.getDashboardPath());
}
