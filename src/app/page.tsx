import { redirect } from "next/navigation";
import HabitTracker from "@/components/habit-tracker";
import SetupNotice from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) {
    redirect("/login");
  }

  return (
    <HabitTracker
      userEmail={typeof claims.email === "string" ? claims.email : "Your account"}
    />
  );
}
