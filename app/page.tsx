import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import LifeOSDashboard from "@/components/dashboard/life-os-dashboard";
import { createClient } from "@/lib/supabase-server";

type RecordRow = {
  id: string;
  date: string;
  weight: number | null;
  sleep: number | null;
  study: number | null;
  memo: string | null;
  created_at: string;
};

type GoalRow = {
  id: string;
  target_weight: number | null;
  target_sleep: number | null;
  target_study: number | null;
  memo: string | null;
};

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: recordsData } = await supabase
    .from("records")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  const { data: goalData } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  async function onSaveRecord(payload: {
    date: string;
    weight: number | null;
    sleep: number | null;
    study: number | null;
    memo: string;
  }) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("ログインしていません");
    const { error } = await supabase.from("records").upsert(
      { user_id: user.id, ...payload, memo: payload.memo || null },
      { onConflict: "user_id,date" }
    );
    if (error) throw new Error(error.message);
    revalidatePath("/");
  }

  async function onUpdateRecord(payload: {
    id: string;
    date: string;
    weight: number | null;
    sleep: number | null;
    study: number | null;
    memo: string;
  }) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("ログインしていません");
    const { error } = await supabase
      .from("records")
      .update({ date: payload.date, weight: payload.weight, sleep: payload.sleep, study: payload.study, memo: payload.memo || null })
      .eq("id", payload.id)
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
    revalidatePath("/");
  }

  async function onDeleteRecord(id: string) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("ログインしていません");
    const { error } = await supabase.from("records").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw new Error(error.message);
    revalidatePath("/");
  }

  async function onSaveGoal(payload: {
    target_weight: number | null;
    target_sleep: number | null;
    target_study: number | null;
    memo: string;
  }) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("ログインしていません");
    const { error } = await supabase.from("goals").upsert(
      { user_id: user.id, ...payload, memo: payload.memo || null },
      { onConflict: "user_id" }
    );
    if (error) throw new Error(error.message);
    revalidatePath("/");
  }

  return (
    <LifeOSDashboard
      userEmail={user.email ?? null}
      records={(recordsData ?? []) as RecordRow[]}
      goal={(goalData ?? null) as GoalRow | null}
      onSaveRecord={onSaveRecord}
      onUpdateRecord={onUpdateRecord}
      onDeleteRecord={onDeleteRecord}
      onSaveGoal={onSaveGoal}
    />
  );
}
