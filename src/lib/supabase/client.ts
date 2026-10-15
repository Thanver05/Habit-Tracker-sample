import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseCredentials } from "./env";
import type { Database } from "./types";

export function createClient() {
  const { url, key } = getSupabaseCredentials();
  return createBrowserClient<Database>(url, key);
}