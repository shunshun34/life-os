import { createClient } from "@/lib/supabase";

export async function getHouseholdTasks() {
  const supabase = createClient();
  const r = await supabase.from("household_tasks").select("*").order("created_at", { ascending: false });
  if (r.error) throw new Error(`家事取得失敗: ${r.error.message}`);
  return r.data ?? [];
}

export async function addHouseholdTask(data: { title: string; frequency: string; dueDate: string; visibility: "private" | "partner" | "public"; }) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("ログインしていません");
  const r = await supabase.from("household_tasks").insert({ user_id: auth.user.id, title: data.title, frequency: data.frequency || null, due_date: data.dueDate || null, visibility: data.visibility });
  if (r.error) throw new Error(`家事保存失敗: ${r.error.message}`);
}

export async function toggleHouseholdTask(id: string, done: boolean) {
  const supabase = createClient();
  const r = await supabase.from("household_tasks").update({ done }).eq("id", id);
  if (r.error) throw new Error(`家事更新失敗: ${r.error.message}`);
}

export async function getShoppingItems() {
  const supabase = createClient();
  const r = await supabase.from("shopping_items").select("*").order("created_at", { ascending: false });
  if (r.error) throw new Error(`買い物取得失敗: ${r.error.message}`);
  return r.data ?? [];
}

export async function addShoppingItem(data: { title: string; quantity: string; visibility: "private" | "partner" | "public"; }) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("ログインしていません");
  const r = await supabase.from("shopping_items").insert({ user_id: auth.user.id, title: data.title, quantity: data.quantity || null, visibility: data.visibility });
  if (r.error) throw new Error(`買い物保存失敗: ${r.error.message}`);
}

export async function toggleShoppingItem(id: string, done: boolean) {
  const supabase = createClient();
  const r = await supabase.from("shopping_items").update({ done }).eq("id", id);
  if (r.error) throw new Error(`買い物更新失敗: ${r.error.message}`);
}
