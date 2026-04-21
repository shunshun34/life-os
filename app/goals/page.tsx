"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function GoalsPage() {
  const [weight, setWeight] = useState("");
  const [sleep, setSleep] = useState("");
  const [study, setStudy] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const load = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("ユーザー取得エラー:", userError?.message);
      return;
    }

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("目標取得エラー:", error.message);
      return;
    }

    if (data) {
      setWeight(data.target_weight?.toString() ?? "");
      setSleep(data.target_sleep?.toString() ?? "");
      setStudy(data.target_study?.toString() ?? "");
    }
  };

  const save = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("ログイン情報を確認できませんでした");
      return;
    }

    const { error } = await supabase.from("goals").upsert(
      {
        user_id: user.id,
        target_weight: weight === "" ? null : Number(weight),
        target_sleep: sleep === "" ? null : Number(sleep),
        target_study: study === "" ? null : Number(study),
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      alert(`保存失敗: ${error.message}`);
      return;
    }

    alert("保存完了");
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>目標設定</h1>

      <input
        type="number"
        step="0.1"
        placeholder="目標体重"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />
      <input
        type="number"
        step="0.1"
        placeholder="目標睡眠"
        value={sleep}
        onChange={(e) => setSleep(e.target.value)}
      />
      <input
        type="number"
        step="0.1"
        placeholder="目標勉強"
        value={study}
        onChange={(e) => setStudy(e.target.value)}
      />

      <button onClick={save}>保存</button>
    </div>
  );
}