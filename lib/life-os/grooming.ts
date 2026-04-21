import { createClient } from "@/lib/supabase";

export async function getGroomingLogs() {
  const supabase = createClient();
  const result = await supabase
    .from("grooming_logs")
    .select("*")
    .order("log_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (result.error) throw new Error(`身だしなみ取得失敗: ${result.error.message}`);
  return result.data ?? [];
}

export async function addGroomingLog(data: {
  category: string;
  title: string;
  memo: string;
  logDate: string;
}) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("ログインしていません");
  const result = await supabase.from("grooming_logs").insert({
    user_id: auth.user.id,
    category: data.category,
    title: data.title,
    memo: data.memo || null,
    log_date: data.logDate,
  });
  if (result.error) throw new Error(`身だしなみ保存失敗: ${result.error.message}`);
}

export async function deleteGroomingLog(id: string) {
  const supabase = createClient();
  const result = await supabase.from("grooming_logs").delete().eq("id", id);
  if (result.error) throw new Error(`身だしなみ削除失敗: ${result.error.message}`);
}
