import { redirect } from "next/navigation";
import AuthForm from "./auth-form";
import SetupNotice from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ notice?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (claims?.sub) redirect("/");

  const { notice } = await searchParams;
  const initialNotice = notice === "auth-error"
    ? "That link could not be verified. Request a fresh one and try again."
    : notice === "setup"
      ? "Supabase is not configured yet. Add the connection settings and try again."
      : "";

  return <AuthForm initialNotice={initialNotice} />;
}
