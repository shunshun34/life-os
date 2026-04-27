import { createClient } from "@/lib/supabase/server";

export async function getUserRules() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No user");

  const { data } = await supabase
    .from("user_rules")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (data) return data;

  const { data: inserted, error } = await supabase
    .from("user_rules")
    .insert({
      user_id: user.id,
    })
    .select("*")
    .single();

  if (error) throw error;

  return inserted;
}