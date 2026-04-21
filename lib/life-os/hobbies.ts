import { createClient } from "@/lib/supabase";

export async function addHobby(data: any) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("ログインしていません");
  return await supabase.from("hobbies").insert({ user_id: auth.user.id, ...data });
}

export async function getHobbies() {
  const supabase = createClient();
  return await supabase.from("hobbies").select("*").order("created_at", { ascending: false });
}

export async function addDrink(data: any) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("ログインしていません");
  return await supabase.from("drink_reviews").insert({ user_id: auth.user.id, ...data });
}

export async function getDrinks() {
  const supabase = createClient();
  return await supabase.from("drink_reviews").select("*").order("created_at", { ascending: false });
}
