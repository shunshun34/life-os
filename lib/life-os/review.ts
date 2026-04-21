import { createClient } from "@/lib/supabase";

export async function getDailyReflections() {
  const supabase = createClient();
  const result = await supabase
    .from("daily_reflections")
    .select("*")
    .order("reflection_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (result.error) throw new Error(`振り返り取得失敗: ${result.error.message}`);
  return result.data ?? [];
}

export async function saveDailyReflection(data: {
  reflectionDate: string;
  todayWin: string;
  todayIssue: string;
  nextAction: string;
}) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("ログインしていません");
  const result = await supabase
    .from("daily_reflections")
    .upsert(
      {
        user_id: auth.user.id,
        reflection_date: data.reflectionDate,
        today_win: data.todayWin || null,
        today_issue: data.todayIssue || null,
        next_action: data.nextAction || null,
      },
      { onConflict: "user_id,reflection_date" }
    );
  if (result.error) throw new Error(`振り返り保存失敗: ${result.error.message}`);
}
