"use client";

import { useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LoadingButton from "@/components/ui/loading-button";
import StatusMessage from "@/components/ui/status-message";
import { todayISO } from "@/lib/life-os/date";

export default function InputPage() {
  const [weight, setWeight] = useState("");
  const [sleep, setSleep] = useState("");
  const [study, setStudy] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState(todayISO());
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const save = async () => {
    resetMessages();

    if (!date) {
      setErrorMessage("日付を入力してください");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("ログイン情報を確認できませんでした");
      }

      const { error } = await supabase.from("records").insert({
        weight: weight === "" ? null : Number(weight),
        sleep: sleep === "" ? null : Number(sleep),
        study: study === "" ? null : Number(study),
        memo: memo.trim() === "" ? null : memo.trim(),
        date,
        user_id: user.id,
      });

      if (error) {
        throw error;
      }

      setSuccessMessage("保存しました");
      setMemo("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存に失敗しました";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">記録入力</h1>
        <p className="mt-2 text-sm text-slate-500">
          今日の状態を保存します。日付は初期値で今日になっています。
        </p>
      </div>

      <StatusMessage type="error" message={errorMessage} />
      <StatusMessage type="success" message={successMessage} />

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">日付</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">体重</span>
            <input
              type="number"
              step="0.1"
              placeholder="60.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">睡眠</span>
            <input
              type="number"
              step="0.1"
              placeholder="7.0"
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">勉強</span>
            <input
              type="number"
              step="0.1"
              placeholder="1.5"
              value={study}
              onChange={(e) => setStudy(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">メモ</span>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            placeholder="今日の気づきや補足を書いてください"
          />
        </label>

        <div className="pt-2">
          <LoadingButton loading={loading} onClick={save} className="h-12 w-full rounded-xl">
            保存
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
