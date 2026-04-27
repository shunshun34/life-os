"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export async function saveUserRules(input: {
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
  extra_rules: string[];
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No user");

  const { error } = await supabase.from("user_rules").upsert(
    {
      user_id: user.id,
      ...input,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) throw error;

  revalidatePath("/settings");
  redirect("/settings");
}
