import { createClient } from "@/lib/supabase";

export async function getMoneyEntries() {
  const supabase = createClient();
  const r = await supabase.from("money_entries").select("*").order("entry_date", { ascending: false }).order("created_at", { ascending: false });
  if (r.error) throw new Error(`お金取得失敗: ${r.error.message}`);
  return r.data ?? [];
}

export async function addMoneyEntry(data: {
  entryType: "income" | "expense";
  category: string;
  title: string;
  amount: number;
  memo: string;
  entryDate: string;
  visibility: "private" | "partner" | "public";
}) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("ログインしていません");
  const r = await supabase.from("money_entries").insert({
    user_id: auth.user.id,
    entry_type: data.entryType,
    category: data.category,
    title: data.title || null,
    amount: data.amount,
    memo: data.memo || null,
    entry_date: data.entryDate,
    visibility: data.visibility,
  });
  if (r.error) throw new Error(`お金保存失敗: ${r.error.message}`);
}

export async function deleteMoneyEntry(id: string) {
  const supabase = createClient();
  const r = await supabase.from("money_entries").delete().eq("id", id);
  if (r.error) throw new Error(`お金削除失敗: ${r.error.message}`);
}
