import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/database.types";

export function getSupabaseServerClient(
  useServiceRole = false,
): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const key = useServiceRole ? serviceRoleKey : anonKey;
  if (!url || !key) {
    return null;
  }

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
