import { createClient } from "@/lib/supabase";

export async function getSharedMemos() {
  const supabase = createClient();
  const result = await supabase
    .from("shared_memos")
    .select("*")
    .order("created_at", { ascending: false });
  if (result.error) throw new Error(`共有メモ取得失敗: ${result.error.message}`);
  return result.data ?? [];
}

export async function addSharedMemo(data: {
  title: string;
  body: string;
  visibility: "private" | "partner" | "public";
}) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("ログインしていません");
  const result = await supabase.from("shared_memos").insert({
    user_id: auth.user.id,
    title: data.title || null,
    body: data.body || null,
    visibility: data.visibility,
  });
  if (result.error) throw new Error(`共有メモ保存失敗: ${result.error.message}`);
}

export async function deleteSharedMemo(id: string) {
  const supabase = createClient();
  const result = await supabase.from("shared_memos").delete().eq("id", id);
  if (result.error) throw new Error(`共有メモ削除失敗: ${result.error.message}`);
}
