
"use client";

import { useMemo, useState, useTransition } from "react";

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
  id?: string;
  target_weight: number | null;
  target_sleep: number | null;
  target_study: number | null;
  memo: string | null;
};

type Props = {
  userEmail: string | null;
  records: RecordRow[];
  goal: GoalRow | null;
  onSaveRecord: (payload: {
    date: string;
    weight: number | null;
    sleep: number | null;
    study: number | null;
    memo: string;
  }) => Promise<void>;
  onUpdateRecord: (payload: {
    id: string;
    date: string;
    weight: number | null;
    sleep: number | null;
    study: number | null;
    memo: string;
  }) => Promise<void>;
  onDeleteRecord: (id: string) => Promise<void>;
  onSaveGoal: (payload: {
    target_weight: number | null;
    target_sleep: number | null;
    target_study: number | null;
    memo: string;
  }) => Promise<void>;
  setErrorMessage: (value: string) => void;
  setSuccessMessage: (value: string) => void;
};

function avg(nums: Array<number | null | undefined>) {
  const values = nums.filter((n): n is number => typeof n === "number");
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function LegacyDashboardContent({
  records,
  goal,
  onSaveRecord,
  onUpdateRecord,
  onDeleteRecord,
  onSaveGoal,
  setErrorMessage,
  setSuccessMessage,
}: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [isPending, startTransition] = useTransition();

  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState("");
  const [sleep, setSleep] = useState("");
  const [study, setStudy] = useState("");
  const [memo, setMemo] = useState("");

  const [goalWeight, setGoalWeight] = useState(goal?.target_weight?.toString() ?? "");
  const [goalSleep, setGoalSleep] = useState(goal?.target_sleep?.toString() ?? "");
  const [goalStudy, setGoalStudy] = useState(goal?.target_study?.toString() ?? "");
  const [goalMemo, setGoalMemo] = useState(goal?.memo ?? "");

  const latest = records[0] ?? null;
  const avgWeight = useMemo(() => avg(records.slice(0, 7).map((r) => r.weight)), [records]);
  const avgSleep = useMemo(() => avg(records.slice(0, 7).map((r) => r.sleep)), [records]);
  const avgStudy = useMemo(() => avg(records.slice(0, 7).map((r) => r.study)), [records]);

  const existingForDate = useMemo(
    () => records.find((r) => r.date === date) ?? null,
    [records, date]
  );

  async function handleSaveRecord() {
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      date,
      weight: weight ? Number(weight) : null,
      sleep: sleep ? Number(sleep) : null,
      study: study ? Number(study) : null,
      memo,
    };

    startTransition(async () => {
      try {
        if (existingForDate?.id) {
          await onUpdateRecord({ id: existingForDate.id, ...payload });
          setSuccessMessage("記録を更新しました。");
        } else {
          await onSaveRecord(payload);
          setSuccessMessage("記録を保存しました。");
        }
        setWeight("");
        setSleep("");
        setStudy("");
        setMemo("");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "記録の保存に失敗しました。");
      }
    });
  }

  async function handleSaveGoal() {
    setErrorMessage("");
    setSuccessMessage("");

    startTransition(async () => {
      try {
        await onSaveGoal({
          target_weight: goalWeight ? Number(goalWeight) : null,
          target_sleep: goalSleep ? Number(goalSleep) : null,
          target_study: goalStudy ? Number(goalStudy) : null,
          memo: goalMemo,
        });
        setSuccessMessage("目標を保存しました。");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "目標の保存に失敗しました。");
      }
    });
  }

  async function handleDeleteRecord(id: string) {
    setErrorMessage("");
    setSuccessMessage("");

    startTransition(async () => {
      try {
        await onDeleteRecord(id);
        setSuccessMessage("記録を削除しました。");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "記録の削除に失敗しました。");
      }
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">ダッシュボード</h3>
            <p className="mt-2 text-sm text-slate-600">
              今日やることと全体状況
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs text-slate-500">最新記録日</div>
            <div className="mt-1 text-lg font-semibold text-sky-600">
              {latest?.date ?? "-"}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="最新体重" value={latest?.weight != null ? `${latest.weight} kg` : "-"} sub={avgWeight != null ? `7日平均 ${avgWeight.toFixed(1)} kg` : "平均なし"} />
        <MetricCard title="最新睡眠" value={latest?.sleep != null ? `${latest.sleep} h` : "-"} sub={avgSleep != null ? `7日平均 ${avgSleep.toFixed(1)} h` : "平均なし"} />
        <MetricCard title="最新勉強" value={latest?.study != null ? `${latest.study} h` : "-"} sub={avgStudy != null ? `7日平均 ${avgStudy.toFixed(1)} h` : "平均なし"} />
        <MetricCard title="記録件数" value={String(records.length)} sub="現在の保存件数" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-xl font-semibold text-slate-900">日次記録</h4>
          <p className="mt-1 text-sm text-slate-500">体重・睡眠・勉強・メモを記録</p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Input label="日付" type="date" value={date} onChange={setDate} />
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
              {existingForDate ? "この日は既存記録があります。保存すると更新します。" : "新規保存になります。"}
            </div>
            <Input label="体重" value={weight} onChange={setWeight} placeholder="60" />
            <Input label="睡眠" value={sleep} onChange={setSleep} placeholder="7" />
            <Input label="勉強" value={study} onChange={setStudy} placeholder="2" />
            <div />
          </div>

          <div className="mt-4">
            <label className="block">
              <div className="mb-2 text-sm font-medium text-slate-700">メモ</div>
              <textarea
                rows={4}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleSaveRecord}
            disabled={isPending}
            className="mt-4 rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-white hover:bg-sky-600 disabled:opacity-60"
          >
            {isPending ? "保存中..." : existingForDate ? "記録を更新" : "記録を保存"}
          </button>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-xl font-semibold text-slate-900">目標設定</h4>
          <p className="mt-1 text-sm text-slate-500">目標体重・睡眠・勉強時間を保存</p>

          <div className="mt-5 grid gap-4">
            <Input label="目標体重" value={goalWeight} onChange={setGoalWeight} placeholder="60" />
            <Input label="目標睡眠" value={goalSleep} onChange={setGoalSleep} placeholder="7" />
            <Input label="目標勉強" value={goalStudy} onChange={setGoalStudy} placeholder="2" />
            <label className="block">
              <div className="mb-2 text-sm font-medium text-slate-700">目標メモ</div>
              <textarea
                rows={4}
                value={goalMemo}
                onChange={(e) => setGoalMemo(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleSaveGoal}
            disabled={isPending}
            className="mt-4 rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {isPending ? "保存中..." : "目標を保存"}
          </button>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="text-xl font-semibold text-slate-900">記録一覧</h4>
            <p className="mt-1 text-sm text-slate-500">新しい順に表示</p>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="px-4 py-2">日付</th>
                <th className="px-4 py-2">体重</th>
                <th className="px-4 py-2">睡眠</th>
                <th className="px-4 py-2">勉強</th>
                <th className="px-4 py-2">メモ</th>
                <th className="px-4 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="rounded-2xl border border-dashed border-slate-200 bg-white/40 px-4 py-8 text-center text-slate-500">
                    まだ記録がありません。
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="rounded-2xl bg-slate-50 text-slate-700">
                    <td className="rounded-l-2xl px-4 py-3">{record.date}</td>
                    <td className="px-4 py-3">{record.weight ?? "-"}</td>
                    <td className="px-4 py-3">{record.sleep ?? "-"}</td>
                    <td className="px-4 py-3">{record.study ?? "-"}</td>
                    <td className="px-4 py-3">{record.memo || "-"}</td>
                    <td className="rounded-r-2xl px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleDeleteRecord(record.id)}
                        disabled={isPending}
                        className="rounded-xl border border-red-500/30 bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      />
    </label>
  );
}
