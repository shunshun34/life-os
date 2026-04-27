import { createClient } from "@/lib/supabase-server";

export type UserRules = {
  id: string;
  user_id: string;
  wake_up_time: string;
  sleep_time: string;
  sleep_rule: string;
  breakfast_rule: string;
  lunch_rule: string;
  dinner_rule: string;
  diet_control_rule: string;
  water_rule: string;
  commute_rule: string;
  lunch_break_rule: string;
  extra_rules: string[] | null;
  created_at: string;
  updated_at: string;
};

export async function getUserRules() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No user");

  const { data } = await supabase
    .from("user_rules")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (data) return data as UserRules;

  const { data: inserted, error } = await supabase
    .from("user_rules")
    .upsert({ user_id: user.id }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) throw error;
  return inserted as UserRules;
}
