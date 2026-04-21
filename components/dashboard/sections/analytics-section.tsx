"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  BarChart,
  Bar,
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

function toShortDate(date: string) {
  return date.slice(5).replace("-", "/");
}

function safeNumber(value: number | null | undefined) {
  return typeof value === "number" && !Number.isNaN(value) ? value : null;
}

function average(values: Array<number | null>) {
  const filtered = values.filter((v): v is number => typeof v === "number");
  if (!filtered.length) return null;
  return filtered.reduce((sum, v) => sum + v, 0) / filtered.length;
}

function completionRate(records: RecordRow[], selector: (row: RecordRow) => number | null, goal: number | null) {
  if (goal == null || goal === 0) return null;
  const filtered = records.map(selector).filter((v): v is number => typeof v === "number");
  if (!filtered.length) return null;
  return (average(filtered)! / goal) * 100;
}

function correlation(records: RecordRow[], left: keyof Pick<RecordRow, "sleep" | "weight" | "study">, right: keyof Pick<RecordRow, "sleep" | "weight" | "study">) {
  const points = records
    .map((record) => ({ x: safeNumber(record[left]), y: safeNumber(record[right]) }))
    .filter((point): point is { x: number; y: number } => point.x != null && point.y != null);

  if (points.length < 3) return null;

  const meanX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

  let numerator = 0;
  let sumX = 0;
  let sumY = 0;

  for (const point of points) {
    const dx = point.x - meanX;
    const dy = point.y - meanY;
    numerator += dx * dy;
    sumX += dx * dx;
    sumY += dy * dy;
  }

  const denominator = Math.sqrt(sumX * sumY);
  if (!denominator) return null;
  return numerator / denominator;
}

function correlationText(value: number | null) {
  if (value == null) return "データ不足";
  if (value >= 0.6) return "かなり強い正の相関";
  if (value >= 0.3) return "やや正の相関";
  if (value > -0.3) return "大きな相関なし";
  if (value > -0.6) return "やや負の相関";
  return "かなり強い負の相関";
}

export default function AnalyticsSection({
  records,
  goal,
}: {
  records: RecordRow[];
  goal: GoalRow | null;
}) {
  const ascRecords = [...records].reverse();
  const chartData = ascRecords.slice(-30).map((record) => ({
    date: toShortDate(record.date),
    weight: safeNumber(record.weight),
    sleep: safeNumber(record.sleep),
    study: safeNumber(record.study),
  }));

  const recent14 = ascRecords.slice(-14);
  const recent7 = ascRecords.slice(-7);

  const avgWeight = average(recent14.map((r) => r.weight));
  const avgSleep = average(recent14.map((r) => r.sleep));
  const avgStudy = average(recent14.map((r) => r.study));

  const sleepGoalRate = completionRate(recent7, (row) => row.sleep, goal?.target_sleep ?? null);
  const studyGoalRate = completionRate(recent7, (row) => row.study, goal?.target_study ?? null);

  const sleepWeightCorrelation = correlation(recent14, "sleep", "weight");
  const sleepStudyCorrelation = correlation(recent14, "sleep", "study");

  const monthlyBars = Array.from({ length: 4 }).map((_, index) => {
    const slice = ascRecords.slice(Math.max(0, ascRecords.length - (4 - index) * 7), ascRecords.length - (3 - index) * 7 || undefined);
    return {
      label: `${index + 1}週前`,
      sleep: Number((average(slice.map((r) => r.sleep)) ?? 0).toFixed(1)),
      study: Number((average(slice.map((r) => r.study)) ?? 0).toFixed(1)),
    };
  });

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-700">Life OS analytics</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">推移と傾向</h2>
            <p className="mt-2 text-sm text-slate-600">直近30日の変化、目標達成率、相関を一画面で見られます。</p>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
            分析期間: <span className="font-semibold text-slate-900">直近30日</span>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="14日平均 体重" value={avgWeight != null ? `${avgWeight.toFixed(1)} kg` : "-"} sub="直近2週間の平均" />
        <MetricCard title="14日平均 睡眠" value={avgSleep != null ? `${avgSleep.toFixed(1)} h` : "-"} sub="直近2週間の平均" />
        <MetricCard title="14日平均 勉強" value={avgStudy != null ? `${avgStudy.toFixed(1)} h` : "-"} sub="直近2週間の平均" />
        <MetricCard title="分析対象日数" value={`${chartData.length}日`} sub="記録がある日だけ集計" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Panel title="毎日の推移" desc="体重・睡眠・勉強のラインチャート">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0", background: "#ffffff" }} />
                <Legend />
                <Line type="monotone" dataKey="weight" name="体重" stroke="#0ea5e9" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="sleep" name="睡眠" stroke="#10b981" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="study" name="勉強" stroke="#8b5cf6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="目標達成率" desc="直近7日の平均と現在の目標を比較">
          <div className="space-y-5">
            <ProgressBlock title="睡眠" percent={sleepGoalRate} target={goal?.target_sleep ?? null} unit="h" />
            <ProgressBlock title="勉強" percent={studyGoalRate} target={goal?.target_study ?? null} unit="h" />
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              体重は「目標との差分」が重要なので、下のサマリーで確認できるようにしています。
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="週ごとの平均" desc="ざっくり増減を見るための比較">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBars} margin={{ top: 10, right: 8, left: -15, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0", background: "#ffffff" }} />
                <Legend />
                <Bar dataKey="sleep" name="睡眠" fill="#22c55e" radius={[8, 8, 0, 0]} />
                <Bar dataKey="study" name="勉強" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="面積で見る集中度" desc="勉強時間の波が見やすい表示">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="studyFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0", background: "#ffffff" }} />
                <Area type="monotone" dataKey="study" stroke="#8b5cf6" fill="url(#studyFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="相関メモ" desc="使いながら傾向をつかむための簡易分析">
          <div className="space-y-4">
            <InsightCard
              title="睡眠 × 体重"
              value={sleepWeightCorrelation}
              text={correlationText(sleepWeightCorrelation)}
              detail="睡眠が安定すると体重のブレが減るかどうかを見る指標です。"
            />
            <InsightCard
              title="睡眠 × 勉強"
              value={sleepStudyCorrelation}
              text={correlationText(sleepStudyCorrelation)}
              detail="睡眠が取れた日のほうが勉強時間を確保しやすいかを見る指標です。"
            />
          </div>
        </Panel>

        <Panel title="次に見るポイント" desc="運用だけに近づくための見方ガイド">
          <ul className="space-y-3 text-sm leading-6 text-slate-600">
            <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">睡眠達成率が低い週は、就寝時間の固定を優先すると改善しやすいです。</li>
            <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">勉強時間の波が大きいときは、記録よりもルーティンの再調整が先です。</li>
            <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">体重は日単位より14日平均の流れで見るとブレに振り回されにくいです。</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="mb-5">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{desc}</p>
      </div>
      {children}
    </section>
  );
}

function MetricCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </div>
  );
}

function ProgressBlock({ title, percent, target, unit }: { title: string; percent: number | null; target: number | null; unit: string }) {
  const safePercent = percent == null ? 0 : Math.max(0, Math.min(160, percent));
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-900">{title}</div>
          <div className="text-sm text-slate-500">目標: {target != null ? `${target}${unit}` : "未設定"}</div>
        </div>
        <div className="text-sm font-semibold text-slate-900">{percent != null ? `${percent.toFixed(0)}%` : "-"}</div>
      </div>
      <div className="mt-3 h-3 rounded-full bg-slate-200">
        <div className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${Math.min(safePercent, 100)}%` }} />
      </div>
    </div>
  );
}

function InsightCard({ title, value, text, detail }: { title: string; value: number | null; text: string; detail: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-sm text-slate-500">{detail}</div>
        </div>
        <div className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm">
          {value != null ? value.toFixed(2) : "-"}
        </div>
      </div>
      <div className="mt-3 text-sm font-medium text-cyan-700">{text}</div>
    </div>
  );
}
