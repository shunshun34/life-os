"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

function avg(nums: Array<number | null | undefined>) {
  const values = nums.filter((n): n is number => typeof n === "number");
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getStreak(records: RecordRow[]) {
  const normalized = [...records].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const record of normalized) {
    const current = cursor.toISOString().slice(0, 10);
    if (record.date === current) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    break;
  }

  return streak;
}

export default function OverviewSection({
  records,
  goal,
}: {
  records: RecordRow[];
  goal: GoalRow | null;
}) {
  const sortedAsc = useMemo(
    () => [...records].sort((a, b) => a.date.localeCompare(b.date)),
    [records]
  );

  const sortedDesc = useMemo(
    () => [...records].sort((a, b) => b.date.localeCompare(a.date)),
    [records]
  );

  const latest = sortedDesc[0] ?? null;
  const last14 = sortedAsc.slice(-14);
  const weightAvg = avg(last14.map((item) => item.weight));
  const sleepAvg = avg(last14.map((item) => item.sleep));
  const studyAvg = avg(last14.map((item) => item.study));
  const streak = getStreak(records);

  const goalGap = useMemo(() => {
    if (!latest || !goal) return [] as Array<{ label: string; value: string }>;
    return [
      {
        label: "体重ギャップ",
        value:
          latest.weight != null && goal.target_weight != null
            ? `${(latest.weight - goal.target_weight).toFixed(1)} kg`
            : "-",
      },
      {
        label: "睡眠ギャップ",
        value:
          latest.sleep != null && goal.target_sleep != null
            ? `${(latest.sleep - goal.target_sleep).toFixed(1)} h`
            : "-",
      },
      {
        label: "勉強ギャップ",
        value:
          latest.study != null && goal.target_study != null
            ? `${(latest.study - goal.target_study).toFixed(1)} h`
            : "-",
      },
    ];
  }, [goal, latest]);

  const operationsChecklist = [
    "UIを統一して、毎日開いても疲れない見た目にする",
    "旅行・ホロ活・趣味は入力→一覧→見返しまで一周できる状態にする",
    "分析は毎日記録が増えるだけで意味が出る形に寄せる",
    "本番前に RLS・Storage・新規登録停止を最終確認する",
  ];

  const chartData = last14.map((item) => ({
    date: item.date.slice(5).replace("-", "/"),
    weight: item.weight,
    sleep: item.sleep,
    study: item.study,
  }));

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="継続日数" value={`${streak}日`} sub="最新日からの連続記録" />
        <MetricCard
          title="14日平均体重"
          value={weightAvg != null ? `${weightAvg.toFixed(1)} kg` : "-"}
          sub={latest?.weight != null ? `直近 ${latest.weight} kg` : "記録なし"}
        />
        <MetricCard
          title="14日平均睡眠"
          value={sleepAvg != null ? `${sleepAvg.toFixed(1)} h` : "-"}
          sub={latest?.sleep != null ? `直近 ${latest.sleep} h` : "記録なし"}
        />
        <MetricCard
          title="14日平均勉強"
          value={studyAvg != null ? `${studyAvg.toFixed(1)} h` : "-"}
          sub={latest?.study != null ? `直近 ${latest.study} h` : "記録なし"}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="life-panel rounded-[28px] p-5 md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">推移グラフ</h2>
              <p className="mt-1 text-sm text-slate-500">直近14日の体重・睡眠・勉強時間</p>
            </div>
            <div className="text-xs text-slate-500">分析の核はここから育てる</div>
          </div>
          <div className="mt-5 h-[320px] w-full">
            {chartData.length === 0 ? (
              <EmptyCard text="まだ記録がないため、グラフを表示できません。記録を追加するとここに推移が表示されます。" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(148,163,184,0.8)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(148,163,184,0.8)" tickLine={false} axisLine={false} width={40} />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid rgba(226,232,240,1)",
                      borderRadius: 16,
                      color: "#0f172a",
                    }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#38bdf8" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="sleep" stroke="#a78bfa" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="study" stroke="#34d399" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="life-panel rounded-[28px] p-5 md:p-6">
          <h2 className="text-2xl font-bold text-slate-900">ゴール差分</h2>
          <p className="mt-1 text-sm text-slate-500">今どれだけ近づいているかを即確認</p>
          <div className="mt-5 space-y-3">
            {goalGap.length === 0 ? (
              <EmptyCard text="目標か記録がまだ足りません。記録を入れると差分が見えます。" />
            ) : (
              goalGap.map((item) => <MiniRow key={item.label} label={item.label} value={item.value} />)
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="life-panel rounded-[28px] p-5 md:p-6">
          <h2 className="text-2xl font-bold text-slate-900">運用前の最終確認</h2>
          <p className="mt-1 text-sm text-slate-500">この4点が揃えば、開発より運用が主になります。</p>
          <div className="mt-5 space-y-3">
            {operationsChecklist.map((item, index) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs font-semibold text-cyan-700">
                  {index + 1}
                </div>
                <div className="text-sm leading-6 text-slate-600">{item}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="life-panel rounded-[28px] p-5 md:p-6">
          <h2 className="text-2xl font-bold text-slate-900">今のステータス</h2>
          <p className="mt-1 text-sm text-slate-500">この画面を基点に、以後は小さな改善だけに寄せていく。</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <StatusCard title="① 全タブ動作" body="主要導線は既に成立。残りはUXと一部整合性の磨き込み。" />
            <StatusCard title="② UI改善" body="暗さ、余白、固定サイドバー、カード整理の統一を反映済み。" />
            <StatusCard title="③ 差別化機能" body="旅行写真・ホロ活・趣味の保存先を生かしつつ、見返し導線を改善。" />
            <StatusCard title="④ 分析" body="まずは記録ベースの推移を標準搭載。次は相関と月次サマリ。" />
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="life-panel rounded-[24px] p-5">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{sub}</div>
    </div>
  );
}

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="text-base font-semibold text-cyan-700">{value}</div>
    </div>
  );
}

function StatusCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-500">{body}</div>
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">{text}</div>;
}
