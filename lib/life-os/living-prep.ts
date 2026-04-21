import { createClient } from "@/lib/supabase";

export async function getLivingPrepTasks() {
  const supabase = createClient();
  const result = await supabase
    .from("living_prep_tasks")
    .select("*")
    .order("done", { ascending: true })
    .order("due_date", { ascending: true })
    .order("created_at", { ascending: false });
  if (result.error) throw new Error(`暮らし準備取得失敗: ${result.error.message}`);
  return result.data ?? [];
}

export async function addLivingPrepTask(data: {
  category: string;
  title: string;
  memo: string;
  dueDate: string;
  visibility: "private" | "partner" | "public";
}) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("ログインしていません");
  const result = await supabase.from("living_prep_tasks").insert({
    user_id: auth.user.id,
    category: data.category || null,
    title: data.title,
    memo: data.memo || null,
    due_date: data.dueDate || null,
    visibility: data.visibility,
  });
  if (result.error) throw new Error(`暮らし準備保存失敗: ${result.error.message}`);
}

export async function toggleLivingPrepTask(id: string, done: boolean) {
  const supabase = createClient();
  const result = await supabase.from("living_prep_tasks").update({ done }).eq("id", id);
  if (result.error) throw new Error(`暮らし準備更新失敗: ${result.error.message}`);
}
