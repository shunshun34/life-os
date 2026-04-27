 "use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";

type Msg = { type: "ok" | "error"; text: string } | null;

const supabase = createClient();
const todayISO = () => new Date().toISOString().slice(0, 10);
const monthISO = () => todayISO().slice(0, 7);
const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];
const dayOfWeek = (date = todayISO()) => new Date(`${date}T00:00:00`).getDay();
const weekStartISO = (date = todayISO()) => {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
};

async function userId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("ログインしていません");
  return data.user.id;
}

function num(v: FormDataEntryValue | null) {
  if (v === null || String(v).trim() === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-slate-900">{children}</h2>;
}


function MiniLineChart({ title, unit, points }: { title: string; unit: string; points: Array<{ date: string; value: number | null }> }) {
  const valid = points.filter((p) => p.value !== null && p.value !== undefined && !Number.isNaN(Number(p.value))) as Array<{ date: string; value: number }>;
  if (valid.length < 2) {
    return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-sm font-bold text-slate-700">{title}</div><div className="mt-3 text-sm text-slate-500">グラフ表示には2件以上の記録が必要です。</div></div>;
  }
  const values = valid.map((p) => Number(p.value));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 320;
  const height = 120;
  const pad = 18;
  const coords = valid.map((p, i) => {
    const x = pad + (i / Math.max(valid.length - 1, 1)) * (width - pad * 2);
    const y = height - pad - ((Number(p.value) - min) / range) * (height - pad * 2);
    return { ...p, x, y };
  });
  const path = coords.map((p, i) => (i === 0 ? "M" : "L") + p.x + "," + p.y).join(" ");
  const latest = valid[valid.length - 1];
  const first = valid[0];
  const diff = Number(latest.value) - Number(first.value);
  return <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-end justify-between gap-3"><div><div className="text-sm font-bold text-slate-700">{title}</div><div className="mt-1 text-xs text-slate-500">直近{valid.length}件の推移</div></div><div className="text-right"><div className="text-lg font-black text-slate-900">{Number(latest.value).toFixed(1)}{unit}</div><div className={(diff <= 0 ? "text-emerald-600" : "text-orange-600") + " text-xs font-semibold"}>{diff >= 0 ? "+" : ""}{diff.toFixed(1)}{unit}</div></div></div><svg viewBox={"0 0 " + width + " " + height} className="mt-3 h-32 w-full overflow-visible" role="img" aria-label={title + "グラフ"}><line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#e2e8f0" strokeWidth="2" /><path d={path} fill="none" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />{coords.map((p) => <circle key={p.date + "-" + p.value} cx={p.x} cy={p.y} r="4" fill="#0284c7" />)}</svg><div className="mt-2 flex justify-between text-xs text-slate-500"><span>{valid[0].date.slice(5)}</span><span>{valid[valid.length - 1].date.slice(5)}</span></div></div>;
}

function Message({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${msg.type === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
      {msg.text}
    </div>
  );
}

function Input({ label, name, type = "text", defaultValue, placeholder }: { label: string; name: string; type?: string; defaultValue?: any; placeholder?: string }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-semibold text-slate-700">{label}</div>
      <input name={name} type={type} defaultValue={defaultValue ?? ""} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400" />
    </label>
  );
}

function Textarea({ label, name, defaultValue, placeholder, rows = 3 }: { label: string; name: string; defaultValue?: any; placeholder?: string; rows?: number }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-semibold text-slate-700">{label}</div>
      <textarea name={name} rows={rows} defaultValue={defaultValue ?? ""} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400" />
    </label>
  );
}

function Select({ label, name, children, defaultValue }: { label: string; name: string; children: React.ReactNode; defaultValue?: any }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-semibold text-slate-700">{label}</div>
      <select name={name} defaultValue={defaultValue} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400">{children}</select>
    </label>
  );
}

function Btn({ children }: { children: React.ReactNode }) {
  return <button className="rounded-2xl bg-sky-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-sky-500">{children}</button>;
}

async function upsert(table: string, payload: any, onConflict?: string) {
  const q = supabase.from(table).upsert(payload, onConflict ? { onConflict } : undefined as any);
  const { error } = await q;
  if (error) throw new Error(error.message);
}

async function insert(table: string, payload: any) {
  const { error } = await supabase.from(table).insert(payload);
  if (error) throw new Error(error.message);
}

export function HealthV5Section() {
  const [log, setLog] = useState<any>(null);
  const [weekLogs, setWeekLogs] = useState<any[]>([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [summary, setSummary] = useState({ avgWeight: null as number | null, avgBodyFat: null as number | null, sleepRate: 0, waterRate: 0 });
  const [msg, setMsg] = useState<Msg>(null);
  const today = todayISO();

  async function load() {
    const uid = await userId();
    const weekStart = weekStartISO();
    const [{ data: todayLog }, { data: weekLogsData }, { data: historyData }] = await Promise.all([
      supabase.from("health_logs").select("*").eq("user_id", uid).eq("date", today).maybeSingle(),
      supabase.from("health_logs").select("*").eq("user_id", uid).gte("date", weekStart).lte("date", today).order("date", { ascending: true }),
      supabase.from("health_logs").select("*").eq("user_id", uid).order("date", { ascending: false }).limit(30),
    ]);
    setLog(todayLog);
    const logs = weekLogsData ?? [];
    setWeekLogs(logs);
    setHistoryLogs(historyData ?? []);
    const avg = (arr: any[]) => { const valid = arr.filter((v) => v !== null && v !== undefined && !Number.isNaN(Number(v))).map(Number); return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null; };
    setSummary({ avgWeight: avg(logs.map((l) => l.weight)), avgBodyFat: avg(logs.map((l) => l.body_fat)), waterRate: logs.length ? Math.round((logs.filter((l) => (l.water_ml ?? 0) >= 2000).length / logs.length) * 100) : 0, sleepRate: logs.length ? Math.round((logs.filter((l) => (l.sleep_hours ?? 0) >= 7).length / logs.length) * 100) : 0 });
  }

  useEffect(() => { load().catch((e) => setMsg({ type: "error", text: e.message })); }, []);

  async function save(formData: FormData) {
    try {
      const uid = await userId();
      await upsert("health_logs", { user_id: uid, date: today, weight: num(formData.get("weight")), body_fat: num(formData.get("body_fat")), water_ml: num(formData.get("water_ml")), sleep_hours: num(formData.get("sleep_hours")), no_phone_before_bed: formData.get("no_phone_before_bed") === "on", bowel_movement: formData.get("bowel_movement") === "on", condition_memo: String(formData.get("condition_memo") || ""), updated_at: new Date().toISOString() }, "user_id,date");
      setMsg({ type: "ok", text: "健康ログを保存しました。" });
      await load();
    } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" }); }
  }

  async function updateHistory(formData: FormData) {
    if (!editingLog) return;
    try {
      const uid = await userId();
      const nextDate = String(formData.get("date") || editingLog.date);
      const payload = {
        user_id: uid,
        date: nextDate,
        weight: num(formData.get("weight")),
        body_fat: num(formData.get("body_fat")),
        water_ml: num(formData.get("water_ml")),
        sleep_hours: num(formData.get("sleep_hours")),
        no_phone_before_bed: formData.get("no_phone_before_bed") === "on",
        bowel_movement: formData.get("bowel_movement") === "on",
        condition_memo: String(formData.get("condition_memo") || ""),
        updated_at: new Date().toISOString(),
      };
      if (nextDate !== editingLog.date) {
        const { error: deleteError } = await supabase.from("health_logs").delete().eq("user_id", uid).eq("date", editingLog.date);
        if (deleteError) throw new Error(deleteError.message);
      }
      await upsert("health_logs", payload, "user_id,date");
      setEditingLog(null);
      setMsg({ type: "ok", text: "健康ログを更新しました。" });
      await load();
    } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "更新に失敗しました。" }); }
  }

  async function deleteHistory(target: any) {
    if (!window.confirm(`${target.date} の健康ログを削除しますか？`)) return;
    try {
      const uid = await userId();
      const { error } = await supabase.from("health_logs").delete().eq("user_id", uid).eq("date", target.date);
      if (error) throw new Error(error.message);
      if (editingLog?.date === target.date) setEditingLog(null);
      setMsg({ type: "ok", text: "健康ログを削除しました。" });
      await load();
    } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "削除に失敗しました。" }); }
  }

  const weightPoints = weekLogs.map((l) => ({ date: l.date, value: l.weight == null ? null : Number(l.weight) }));
  const bodyFatPoints = weekLogs.map((l) => ({ date: l.date, value: l.body_fat == null ? null : Number(l.body_fat) }));

  const formLog = editingLog ?? log;
  const formTitle = editingLog ? "健康ログを編集" : "今日の健康入力";

  return (
    <div className="space-y-6">
      <Message msg={msg} />
      <div className="grid gap-4 md:grid-cols-4">
        <Card><div className="text-sm text-slate-500">週平均体重</div><div className="mt-2 text-2xl font-black">{summary.avgWeight?.toFixed(1) ?? "-"}kg</div></Card>
        <Card><div className="text-sm text-slate-500">週平均体脂肪</div><div className="mt-2 text-2xl font-black">{summary.avgBodyFat?.toFixed(1) ?? "-"}%</div></Card>
        <Card><div className="text-sm text-slate-500">水分達成率</div><div className="mt-2 text-2xl font-black">{summary.waterRate}%</div></Card>
        <Card><div className="text-sm text-slate-500">睡眠達成率</div><div className="mt-2 text-2xl font-black">{summary.sleepRate}%</div></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <MiniLineChart title="体重推移" unit="kg" points={weightPoints} />
        <MiniLineChart title="体脂肪推移" unit="%" points={bodyFatPoints} />
      </div>

      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <H2>{formTitle}</H2>
            {editingLog && <p className="mt-2 text-sm text-slate-500">履歴の「編集」から選んだログを、ここで更新します。</p>}
          </div>
          {editingLog && (
            <button type="button" onClick={() => setEditingLog(null)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              今日の入力に戻る
            </button>
          )}
        </div>
        <form key={editingLog ? `edit-${editingLog.date}` : "today"} action={editingLog ? updateHistory : save} className="mt-5 grid gap-4 md:grid-cols-2">
          {editingLog && <Input label="日付" name="date" type="date" defaultValue={formLog?.date} />}
          <Input label="体重" name="weight" type="number" defaultValue={formLog?.weight} placeholder="kg" />
          <Input label="体脂肪" name="body_fat" type="number" defaultValue={formLog?.body_fat} placeholder="%" />
          <Input label="水分摂取量" name="water_ml" type="number" defaultValue={formLog?.water_ml} placeholder="ml" />
          <Input label="睡眠時間" name="sleep_hours" type="number" defaultValue={formLog?.sleep_hours} placeholder="時間" />
          <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"><input type="checkbox" name="bowel_movement" defaultChecked={!!formLog?.bowel_movement} />便通あり</label>
          <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"><input type="checkbox" name="no_phone_before_bed" defaultChecked={!!formLog?.no_phone_before_bed} />寝る30分前スマホ禁止</label>
          <div className="md:col-span-2"><Textarea label="体調メモ" name="condition_memo" defaultValue={formLog?.condition_memo} /></div>
          <div className="flex gap-3 md:col-span-2">
            <Btn>{editingLog ? "更新" : "保存"}</Btn>
            {editingLog && <button type="button" onClick={() => setEditingLog(null)} className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">キャンセル</button>}
          </div>
        </form>
      </Card>

      <Card>
        <H2>健康ログ履歴</H2>
        <p className="mt-2 text-sm text-slate-500">直近30件の記録を確認できます。編集は上の入力フォームで行います。</p>
        {historyLogs.length === 0 ? (
          <p className="mt-5 text-sm text-slate-500">健康ログはまだありません。</p>
        ) : (
          <div className="mt-5 space-y-3">
            {historyLogs.map((h) => (
              <div key={h.date} className={(editingLog?.date === h.date ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-slate-50") + " rounded-3xl border p-4"}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-base font-black text-slate-900">{h.date}</div>
                    <div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                      <span>体重：{h.weight ?? "-"}kg</span>
                      <span>体脂肪：{h.body_fat ?? "-"}%</span>
                      <span>水分：{h.water_ml ?? "-"}ml</span>
                      <span>睡眠：{h.sleep_hours ?? "-"}h</span>
                      <span>便通：{h.bowel_movement ? "あり" : "なし"}</span>
                      <span>スマホ禁止：{h.no_phone_before_bed ? "達成" : "未達成"}</span>
                    </div>
                    {h.condition_memo && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{h.condition_memo}</p>}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => setEditingLog(h)} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">編集</button>
                    <button type="button" onClick={() => deleteHistory(h)} className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">削除</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}


export function RoutineV5Section() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const today = todayISO();
  const dow = dayOfWeek();

  const categories = [
    ["morning", "朝"],
    ["noon", "昼"],
    ["night", "夜"],
    ["weekly_fixed", "曜日別"],
  ];

  const dayOptions = [
    { value: "", label: "毎日" },
    ...dayLabels.map((label, index) => ({ value: String(index), label: `${label}曜日` })),
  ];

  function categoryText(value: string) {
    return categories.find(([key]) => key === value)?.[1] ?? value;
  }

  function dayText(value: any) {
    if (value === null || value === undefined || value === "") return "毎日";
    const n = Number(value);
    return Number.isNaN(n) ? String(value) : `${dayLabels[n]}曜日`;
  }

  function isTemplateForToday(t: any) {
    return t.day_of_week === null || t.day_of_week === undefined || Number(t.day_of_week) === dow;
  }

  function sortTemplates(items: any[]) {
    return [...items].sort((a, b) => {
      const ao = Number(a.display_order ?? 0);
      const bo = Number(b.display_order ?? 0);
      if (ao !== bo) return ao - bo;
      return String(a.title || "").localeCompare(String(b.title || ""));
    });
  }

  async function load() {
    const uid = await userId();
    const [{ data: t, error: tError }, { data: l, error: lError }] = await Promise.all([
      supabase
        .from("routine_templates")
        .select("*")
        .eq("user_id", uid)
        .eq("is_active", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("routine_logs")
        .select("*")
        .eq("user_id", uid)
        .eq("date", today),
    ]);
    if (tError) throw new Error(tError.message);
    if (lError) throw new Error(lError.message);
    setTemplates(t ?? []);
    setLogs(l ?? []);
  }

  useEffect(() => {
    load().catch((e) => setMsg({ type: "error", text: e.message }));
  }, []);

  async function save(formData: FormData) {
    try {
      const uid = await userId();
      const title = String(formData.get("title") || "").trim();
      if (!title) throw new Error("タスク名を入力してください。");

      const payload = {
        user_id: uid,
        category: String(formData.get("category") || "morning"),
        title,
        description: String(formData.get("description") || ""),
        day_of_week: num(formData.get("day_of_week")),
        estimated_minutes: num(formData.get("estimated_minutes")),
        display_order: num(formData.get("display_order")) ?? 0,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (editingTemplate?.id) {
        const { error } = await supabase.from("routine_templates").update(payload).eq("id", editingTemplate.id);
        if (error) throw new Error(error.message);
        setEditingTemplate(null);
        setMsg({ type: "ok", text: "ルーティンを更新しました。" });
      } else {
        await insert("routine_templates", payload);
        setMsg({ type: "ok", text: "ルーティンを追加しました。" });
      }

      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" });
    }
  }

  async function deleteTemplate(template: any) {
    if (!confirm(`「${template.title}」を削除しますか？`)) return;
    try {
      const { error } = await supabase
        .from("routine_templates")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", template.id);
      if (error) throw new Error(error.message);
      if (editingTemplate?.id === template.id) setEditingTemplate(null);
      setMsg({ type: "ok", text: "ルーティンを削除しました。" });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "削除に失敗しました。" });
    }
  }

  async function toggle(t: any) {
    try {
      const uid = await userId();
      const old = logs.find((l) => l.template_id === t.id);
      await upsert(
        "routine_logs",
        {
          user_id: uid,
          template_id: t.id,
          date: today,
          is_done: !old?.is_done,
          done_at: !old?.is_done ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        "user_id,template_id,date"
      );
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" });
    }
  }

  const todayTemplates = sortTemplates(templates.filter(isTemplateForToday));
  const allDays = [
    { label: "毎日", value: "" },
    ...Array.from({ length: 7 }, (_, i) => {
      const day = (dow + i) % 7;
      return { label: `${dayLabels[day]}曜日${day === dow ? "（今日）" : ""}`, value: String(day) };
    }),
  ];

  const formDefault = editingTemplate ?? {
    category: "morning",
    title: "",
    description: "",
    day_of_week: "",
    estimated_minutes: "",
    display_order: 0,
  };

  function TemplateRow({ t, showCategory = true }: { t: any; showCategory?: boolean }) {
    const done = !!logs.find((l) => l.template_id === t.id)?.is_done;
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <button type="button" onClick={() => toggle(t)} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
            <div className="min-w-0">
              <div className="font-bold text-slate-900">{t.title}</div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                {showCategory && <span>{categoryText(t.category)}</span>}
                <span>{dayText(t.day_of_week)}</span>
                {t.estimated_minutes != null && <span>{t.estimated_minutes}分</span>}
                {t.description && <span>{t.description}</span>}
              </div>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs ${done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{done ? "完了" : "未"}</span>
          </button>
          <div className="flex gap-2 md:shrink-0">
            <button type="button" onClick={() => setEditingTemplate(t)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">編集</button>
            <button type="button" onClick={() => deleteTemplate(t)} className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">削除</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Message msg={msg} />

      <Card>
        <H2>{editingTemplate ? "ルーティン編集中" : "ルーティン追加"}</H2>
        <p className="mt-2 text-sm text-slate-500">曜日は数字入力ではなく、文字で選択します。編集時はこのフォームが更新用になります。</p>
        <form key={editingTemplate?.id ?? "new-routine"} action={save} className="mt-5 grid gap-4 md:grid-cols-3">
          <Select label="カテゴリ" name="category" defaultValue={formDefault.category}>
            {categories.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </Select>
          <Input label="タスク名" name="title" defaultValue={formDefault.title} />
          <Input label="所要時間（分）" name="estimated_minutes" type="number" defaultValue={formDefault.estimated_minutes} />
          <Select label="曜日" name="day_of_week" defaultValue={formDefault.day_of_week ?? ""}>
            {dayOptions.map((d) => <option key={d.value || "everyday"} value={d.value}>{d.label}</option>)}
          </Select>
          <Input label="表示順" name="display_order" type="number" defaultValue={formDefault.display_order ?? 0} />
          <Input label="メモ" name="description" defaultValue={formDefault.description} />
          <div className="flex gap-3 md:col-span-3">
            <Btn>{editingTemplate ? "更新" : "追加"}</Btn>
            {editingTemplate && <button type="button" onClick={() => setEditingTemplate(null)} className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">キャンセル</button>}
          </div>
        </form>
      </Card>

      <Card>
        <H2>今日のルーティン（{dayLabels[dow]}曜日）</H2>
        <p className="mt-2 text-sm text-slate-500">今日やる項目だけを上に表示します。タップすると完了/未完了を切り替えます。</p>
        <div className="mt-4 space-y-3">
          {todayTemplates.map((t) => <TemplateRow key={t.id} t={t} />)}
          {todayTemplates.length === 0 && <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">今日の項目はありません。</div>}
        </div>
      </Card>

      <Card>
        <H2>全ルーティン管理</H2>
        <p className="mt-2 text-sm text-slate-500">毎日・曜日別に開いて、確認・編集・削除できます。今日の曜日が一番上です。</p>
        <div className="mt-4 space-y-3">
          {allDays.map((d, index) => {
            const items = sortTemplates(
              d.value === ""
                ? templates.filter((t) => t.day_of_week === null || t.day_of_week === undefined)
                : templates.filter((t) => Number(t.day_of_week) === Number(d.value))
            );
            return (
              <details key={d.value || "everyday"} className="rounded-2xl border border-slate-200 bg-slate-50 p-4" open={index <= 1}>
                <summary className="cursor-pointer font-bold text-slate-900">{d.label}</summary>
                <div className="mt-4 space-y-3">
                  {items.map((t) => <TemplateRow key={t.id} t={t} />)}
                  {items.length === 0 && <div className="text-sm text-slate-500">項目がありません。</div>}
                </div>
              </details>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export function CleanlinessV5Section() {
  const [allTemplates, setAllTemplates] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<Msg>(null);
  const today = todayISO();
  const dow = dayOfWeek();
  const categories = [
    ["morning", "朝ケア"],
    ["night", "夜ケア"],
    ["weekly", "週次ケア"],
    ["recovery", "リカバリ"],
  ];
  const dayOptions = [
    { value: "", label: "毎日" },
    ...dayLabels.map((label, index) => ({ value: String(index), label })),
  ];
  const dayOrder = Array.from({ length: 7 }, (_, i) => (dow + i) % 7);

  function dayText(value: any) {
    if (value === null || value === undefined || value === "") return "毎日";
    return dayLabels[Number(value)] ?? "未設定";
  }

  function categoryText(value: string) {
    return categories.find(([key]) => key === value)?.[1] ?? value;
  }

  function sortTemplates(items: any[]) {
    return [...items].sort((a, b) => {
      const ac = String(a.category || "");
      const bc = String(b.category || "");
      if (ac !== bc) return ac.localeCompare(bc);
      const ao = Number(a.display_order ?? 0);
      const bo = Number(b.display_order ?? 0);
      if (ao !== bo) return ao - bo;
      return String(a.item_name || "").localeCompare(String(b.item_name || ""));
    });
  }

  async function load() {
    const uid = await userId();
    const [{ data: templateData }, { data: logData }] = await Promise.all([
      supabase.from("grooming_templates").select("*").eq("user_id", uid).eq("is_active", true).order("day_of_week", { ascending: true }).order("display_order", { ascending: true }),
      supabase.from("grooming_logs").select("*").eq("user_id", uid).eq("date", today),
    ]);
    setAllTemplates(templateData ?? []);
    setLogs(logData ?? []);
  }

  useEffect(() => { load().catch((e) => setMsg({ type: "error", text: e.message })); }, []);

  async function add(fd: FormData) {
    try {
      const uid = await userId();
      const itemName = String(fd.get("item_name") || "").trim();
      if (!itemName) throw new Error("チェック項目を入力してください。");
      await insert("grooming_templates", {
        user_id: uid,
        category: String(fd.get("category") || "morning"),
        item_name: itemName,
        day_of_week: num(fd.get("day_of_week")),
        display_order: num(fd.get("display_order")) ?? 0,
        is_active: true,
      });
      setMsg({ type: "ok", text: "清潔項目を追加しました。" });
      await load();
    } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "追加に失敗しました。" }); }
  }

  async function updateTemplate(fd: FormData) {
    try {
      if (!editingTemplate?.id) throw new Error("編集対象が見つかりません。");
      const itemName = String(fd.get("item_name") || "").trim();
      if (!itemName) throw new Error("チェック項目を入力してください。");
      const { error } = await supabase.from("grooming_templates").update({
        category: String(fd.get("category") || "morning"),
        item_name: itemName,
        day_of_week: num(fd.get("day_of_week")),
        display_order: num(fd.get("display_order")) ?? 0,
        updated_at: new Date().toISOString(),
      }).eq("id", editingTemplate.id);
      if (error) throw new Error(error.message);
      setEditingTemplate(null);
      setMsg({ type: "ok", text: "清潔項目を更新しました。" });
      await load();
    } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "更新に失敗しました。" }); }
  }

  async function deleteTemplate(template: any) {
    try {
      const ok = window.confirm(`「${template.item_name}」を削除しますか？`);
      if (!ok) return;
      const { error } = await supabase.from("grooming_templates").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", template.id);
      if (error) throw new Error(error.message);
      if (editingTemplate?.id === template.id) setEditingTemplate(null);
      setMsg({ type: "ok", text: "清潔項目を削除しました。" });
      await load();
    } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "削除に失敗しました。" }); }
  }

  async function toggle(t: any) {
    try {
      const uid = await userId();
      const old = logs.find((l) => l.category === t.category && l.item_name === t.item_name);
      if (old?.id) {
        const { error } = await supabase.from("grooming_logs").update({ is_done: !old.is_done, memo: null }).eq("id", old.id);
        if (error) throw new Error(error.message);
      } else {
        await insert("grooming_logs", { user_id: uid, date: today, category: t.category, item_name: t.item_name, is_done: true });
      }
      await load();
    } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" }); }
  }

  function TemplateRow({ template, showDay = true }: { template: any; showDay?: boolean }) {
    const old = logs.find((l) => l.category === template.category && l.item_name === template.item_name);
    const done = !!old?.is_done;
    return <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button type="button" onClick={() => toggle(template)} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
          <div className="min-w-0">
            <div className="font-bold text-slate-900">{template.item_name}</div>
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
              <span>{categoryText(template.category)}</span>
              {showDay && <span>{dayText(template.day_of_week)}</span>}
              <span>表示順: {template.display_order ?? 0}</span>
            </div>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs ${done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{done ? "完了" : "未"}</span>
        </button>
        <div className="flex gap-2 md:shrink-0">
          <button type="button" onClick={() => setEditingTemplate(template)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">編集</button>
          <button type="button" onClick={() => deleteTemplate(template)} className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">削除</button>
        </div>
      </div>
    </div>;
  }

  const todayTemplates = sortTemplates(allTemplates.filter((t) => t.day_of_week === null || t.day_of_week === undefined || Number(t.day_of_week) === dow));
  const everydayTemplates = sortTemplates(allTemplates.filter((t) => t.day_of_week === null || t.day_of_week === undefined));

  return <div className="space-y-6"><Message msg={msg}/>
    <Card>
      <H2>{editingTemplate ? "清潔項目を編集中" : "清潔項目追加"}</H2>
      <form action={editingTemplate ? updateTemplate : add} className="mt-5 grid gap-4 md:grid-cols-3">
        <Select label="カテゴリ" name="category" defaultValue={editingTemplate?.category ?? "morning"}>{categories.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select>
        <Input label="チェック項目" name="item_name" defaultValue={editingTemplate?.item_name ?? ""}/>
        <Select label="曜日" name="day_of_week" defaultValue={editingTemplate?.day_of_week ?? ""}>{dayOptions.map((d) => <option key={d.value || "everyday"} value={d.value}>{d.label}</option>)}</Select>
        <Input label="表示順" name="display_order" type="number" defaultValue={editingTemplate?.display_order ?? 0}/>
        <div className="md:col-span-3 flex gap-3">
          <Btn>{editingTemplate ? "更新" : "追加"}</Btn>
          {editingTemplate && <button type="button" onClick={() => setEditingTemplate(null)} className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">キャンセル</button>}
        </div>
      </form>
    </Card>

    <Card>
      <div className="flex items-end justify-between gap-3">
        <div><H2>今日の清潔（{dayLabels[dow]}）</H2><p className="mt-2 text-sm text-slate-500">今日やる項目だけを上に表示します。タップすると完了/未完了を切り替えます。</p></div>
      </div>
      <div className="mt-4 space-y-3">
        {todayTemplates.map((t) => <TemplateRow key={t.id} template={t} />)}
        {todayTemplates.length === 0 && <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">今日の項目はありません。</div>}
      </div>
    </Card>

    <Card>
      <H2>他の曜日・全項目管理</H2>
      <p className="mt-2 text-sm text-slate-500">曜日タブを開くと、その曜日の項目を確認・編集・削除できます。今日の曜日が一番上です。</p>
      <div className="mt-4 space-y-3">
        <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4" open>
          <summary className="cursor-pointer font-bold text-slate-900">毎日</summary>
          <div className="mt-4 space-y-3">
            {everydayTemplates.map((t) => <TemplateRow key={t.id} template={t} showDay={false} />)}
            {everydayTemplates.length === 0 && <div className="text-sm text-slate-500">毎日の項目はありません。</div>}
          </div>
        </details>
        {dayOrder.map((day, index) => {
          const dayTemplates = sortTemplates(allTemplates.filter((t) => Number(t.day_of_week) === day));
          const isOpen = openDays[String(day)] ?? index === 0;
          return <div key={day} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <button type="button" onClick={() => setOpenDays((prev) => ({ ...prev, [String(day)]: !isOpen }))} className="flex w-full items-center justify-between text-left font-bold text-slate-900">
              <span>{dayLabels[day]}曜日{day === dow ? "（今日）" : ""}</span>
              <span className="text-sm text-slate-500">{isOpen ? "閉じる" : "開く"}</span>
            </button>
            {isOpen && <div className="mt-4 space-y-3">
              {dayTemplates.map((t) => <TemplateRow key={t.id} template={t} />)}
              {dayTemplates.length === 0 && <div className="text-sm text-slate-500">この曜日の項目はありません。</div>}
            </div>}
          </div>;
        })}
      </div>
    </Card>
  </div>;
}

export function HouseholdV5Section() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [allTemplates, setAllTemplates] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const today = todayISO();
  const dow = dayOfWeek();

  async function load() {
    const uid = await userId();
    const [{ data: todayTemplates }, { data: allTemplateData }, { data: todayLogs }] = await Promise.all([
      supabase.from("household_templates").select("*").eq("user_id", uid).eq("is_active", true).eq("day_of_week", dow).order("display_order", { ascending: true }),
      supabase.from("household_templates").select("*").eq("user_id", uid).eq("is_active", true).order("day_of_week", { ascending: true }).order("display_order", { ascending: true }).order("created_at", { ascending: false }),
      supabase.from("household_logs").select("*").eq("user_id", uid).eq("date", today),
    ]);
    setTemplates(todayTemplates ?? []);
    setAllTemplates(allTemplateData ?? []);
    setLogs(todayLogs ?? []);
  }

  useEffect(() => { load().catch((e) => setMsg({ type: "error", text: e.message })); }, []);

  async function add(fd: FormData) {
    try {
      const uid = await userId();
      const taskName = String(fd.get("task_name") || "").trim();
      if (!taskName) throw new Error("タスク名を入力してください。");
      await insert("household_templates", {
        user_id: uid,
        task_name: taskName,
        day_of_week: Number(fd.get("day_of_week")),
        display_order: num(fd.get("display_order")) ?? 0,
        memo: String(fd.get("memo") || ""),
        is_active: true,
      });
      setMsg({ type: "ok", text: "家事を追加しました。" });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "追加に失敗しました。" });
    }
  }

  async function updateTemplate(fd: FormData) {
    if (!editingTemplate?.id) return;
    try {
      const taskName = String(fd.get("task_name") || "").trim();
      if (!taskName) throw new Error("タスク名を入力してください。");
      const { error } = await supabase.from("household_templates").update({
        task_name: taskName,
        day_of_week: Number(fd.get("day_of_week")),
        display_order: num(fd.get("display_order")) ?? 0,
        memo: String(fd.get("memo") || ""),
        updated_at: new Date().toISOString(),
      }).eq("id", editingTemplate.id);
      if (error) throw new Error(error.message);
      setEditingTemplate(null);
      setMsg({ type: "ok", text: "家事を更新しました。" });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "更新に失敗しました。" });
    }
  }

  async function deleteTemplate(id: string) {
    try {
      const { error } = await supabase.from("household_templates").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw new Error(error.message);
      if (editingTemplate?.id === id) setEditingTemplate(null);
      setMsg({ type: "ok", text: "家事を削除しました。" });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "削除に失敗しました。" });
    }
  }

  async function toggle(t: any) {
    try {
      const uid = await userId();
      const old = logs.find((l) => l.task_name === t.task_name);
      if (old?.id) {
        const { error } = await supabase.from("household_logs").update({ is_done: !old.is_done, updated_at: new Date().toISOString() }).eq("id", old.id);
        if (error) throw new Error(error.message);
      } else {
        await insert("household_logs", { user_id: uid, date: today, task_name: t.task_name, is_done: true, memo: t.memo });
      }
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" });
    }
  }

  return <div className="space-y-6"><Message msg={msg}/>
    <Card><H2>{editingTemplate ? "家事テンプレ編集" : "家事テンプレ追加"}</H2>
      <form key={editingTemplate?.id ?? "new-household"} action={editingTemplate ? updateTemplate : add} className="mt-5 grid gap-4 md:grid-cols-3">
        <Input label="タスク名" name="task_name" defaultValue={editingTemplate?.task_name}/>
        <Select label="曜日" name="day_of_week" defaultValue={editingTemplate?.day_of_week ?? dow}>{dayLabels.map((d, i) => <option key={i} value={i}>{d}</option>)}</Select>
        <Input label="表示順" name="display_order" type="number" defaultValue={editingTemplate?.display_order ?? 0}/>
        <Input label="メモ" name="memo" defaultValue={editingTemplate?.memo}/>
        <div className="flex gap-3 md:col-span-3"><Btn>{editingTemplate ? "更新" : "追加"}</Btn>{editingTemplate && <button type="button" onClick={() => setEditingTemplate(null)} className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">キャンセル</button>}</div>
      </form>
    </Card>

    <Card><H2>今日の家事（{dayLabels[dow]}）</H2>
      <div className="mt-4 space-y-3">{templates.map((t) => { const done = !!logs.find((l) => l.task_name === t.task_name)?.is_done; return <button key={t.id} onClick={() => toggle(t)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-4 text-left hover:bg-slate-50"><div><div className="font-bold">{t.task_name}</div><div className="text-sm text-slate-500">{t.memo}</div></div><span className={`rounded-full px-3 py-1 text-xs ${done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{done ? "完了" : "未"}</span></button>; })}{templates.length === 0 && <div className="text-sm text-slate-500">今日の家事はありません。</div>}</div>
    </Card>

    <Card><H2>登録済み家事テンプレ</H2>
      <div className="mt-4 space-y-3">{allTemplates.map((t) => <div key={t.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><div className="font-bold text-slate-900">{t.task_name}</div><div className="mt-1 text-sm text-slate-600">{dayLabels[t.day_of_week]}曜 / 表示順 {t.display_order ?? 0}{t.memo ? ` / ${t.memo}` : ""}</div></div><div className="flex gap-2"><button type="button" onClick={() => setEditingTemplate(t)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">編集</button><button type="button" onClick={() => deleteTemplate(t.id)} className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">削除</button></div></div></div>)}{allTemplates.length === 0 && <div className="text-sm text-slate-500">登録済みの家事はありません。</div>}</div>
    </Card>
  </div>;
}

export function StudyV5Section() {
  const [logs, setLogs] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [allSettings, setAllSettings] = useState<any[]>([]);
  const [weekly, setWeekly] = useState(0);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [editingSetting, setEditingSetting] = useState<any>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const today = todayISO();

  async function load() {
    const uid = await userId();
    const ws = weekStartISO();
    const dow = dayOfWeek();
    const [{ data: todayLogs }, { data: weekLogs }, { data: todaySettings }, { data: settingList }, { data: historyLogs }] = await Promise.all([
      supabase.from("study_logs").select("*").eq("user_id", uid).eq("date", today).order("created_at", { ascending: false }),
      supabase.from("study_logs").select("*").eq("user_id", uid).gte("date", ws).lte("date", today),
      supabase.from("study_settings").select("*").eq("user_id", uid).eq("is_active", true).eq("day_of_week", dow),
      supabase.from("study_settings").select("*").eq("user_id", uid).eq("is_active", true).order("day_of_week", { ascending: true }).order("created_at", { ascending: false }),
      supabase.from("study_logs").select("*").eq("user_id", uid).order("date", { ascending: false }).order("created_at", { ascending: false }).limit(30),
    ]);
    const week = weekLogs ?? [];
    setLogs(todayLogs ?? []);
    setHistory(historyLogs ?? []);
    setSettings(todaySettings ?? []);
    setAllSettings(settingList ?? []);
    setWeekly(week.reduce((sum, x) => sum + (Number(x.minutes) || 0), 0));
  }

  useEffect(() => {
    load().catch((e) => setMsg({ type: "error", text: e.message }));
  }, []);

  function resetLogEdit() {
    setEditingLog(null);
  }

  function resetSettingEdit() {
    setEditingSetting(null);
  }

  async function saveLog(fd: FormData) {
    try {
      const uid = await userId();
      const payload = {
        user_id: uid,
        date: String(fd.get("date") || today),
        category: String(fd.get("category") || "情報資格"),
        minutes: num(fd.get("minutes")) ?? 0,
        content: String(fd.get("content") || ""),
        focus_score: num(fd.get("focus_score")),
        understanding_score: num(fd.get("understanding_score")),
        memo: String(fd.get("memo") || ""),
      };
      if (editingLog?.id) {
        const { error } = await supabase.from("study_logs").update(payload).eq("id", editingLog.id);
        if (error) throw new Error(error.message);
        setEditingLog(null);
        setMsg({ type: "ok", text: "勉強ログを更新しました。" });
      } else {
        await insert("study_logs", payload);
        setMsg({ type: "ok", text: "勉強ログを保存しました。" });
      }
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" });
    }
  }

  async function deleteLog(id: string) {
    if (!confirm("この勉強ログを削除しますか？")) return;
    try {
      const { error } = await supabase.from("study_logs").delete().eq("id", id);
      if (error) throw new Error(error.message);
      if (editingLog?.id === id) setEditingLog(null);
      setMsg({ type: "ok", text: "勉強ログを削除しました。" });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "削除に失敗しました。" });
    }
  }

  async function saveSetting(fd: FormData) {
    try {
      const uid = await userId();
      const payload = {
        user_id: uid,
        category: String(fd.get("category") || "情報資格"),
        day_of_week: Number(fd.get("day_of_week")),
        target_minutes: num(fd.get("target_minutes")) ?? 0,
        content_template: String(fd.get("content_template") || ""),
        is_active: true,
      };
      if (editingSetting?.id) {
        const { error } = await supabase.from("study_settings").update(payload).eq("id", editingSetting.id);
        if (error) throw new Error(error.message);
        setEditingSetting(null);
        setMsg({ type: "ok", text: "勉強設定を更新しました。" });
      } else {
        await insert("study_settings", payload);
        setMsg({ type: "ok", text: "勉強設定を追加しました。" });
      }
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" });
    }
  }

  async function deleteSetting(id: string) {
    if (!confirm("この勉強設定を削除しますか？")) return;
    try {
      const { error } = await supabase.from("study_settings").delete().eq("id", id);
      if (error) throw new Error(error.message);
      if (editingSetting?.id === id) setEditingSetting(null);
      setMsg({ type: "ok", text: "勉強設定を削除しました。" });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "削除に失敗しました。" });
    }
  }

  const logDefaults = editingLog ?? { date: today, category: "情報資格", focus_score: 3, understanding_score: 3 };
  const settingDefaults = editingSetting ?? { category: "情報資格", day_of_week: dayOfWeek(), target_minutes: "" };

  return <div className="space-y-6"><Message msg={msg}/>
    <div className="grid gap-4 md:grid-cols-2">
      <Card><div className="text-sm text-slate-500">今週累計</div><div className="mt-2 text-3xl font-black">{weekly}分</div></Card>
      <Card><div className="text-sm text-slate-500">今日の目標</div><div className="mt-2 space-y-1 text-sm">{settings.length ? settings.map((s) => <div key={s.id}>{s.category}：{s.target_minutes}分 {s.content_template}</div>) : "未設定"}</div></Card>
    </div>

    <Card><H2>{editingLog ? "勉強ログ編集" : "今日の勉強記録"}</H2>
      <form key={editingLog?.id ?? "new-study-log"} action={saveLog} className="mt-5 grid gap-4 md:grid-cols-2">
        <Input label="日付" name="date" type="date" defaultValue={logDefaults.date ?? today}/>
        <Select label="カテゴリ" name="category" defaultValue={logDefaults.category ?? "情報資格"}><option>情報資格</option><option>英語</option><option>面接</option><option>その他</option></Select>
        <Input label="勉強時間（分）" name="minutes" type="number" defaultValue={logDefaults.minutes}/>
        <Input label="何をやったか" name="content" defaultValue={logDefaults.content}/>
        <Select label="集中度" name="focus_score" defaultValue={logDefaults.focus_score ?? 3}><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></Select>
        <Select label="理解度" name="understanding_score" defaultValue={logDefaults.understanding_score ?? 3}><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></Select>
        <Input label="メモ" name="memo" defaultValue={logDefaults.memo}/>
        <div className="flex gap-3 md:col-span-2"><Btn>{editingLog ? "更新" : "保存"}</Btn>{editingLog && <button type="button" onClick={resetLogEdit} className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">キャンセル</button>}</div>
      </form>
    </Card>

    <Card><H2>{editingSetting ? "勉強設定編集" : "勉強設定追加"}</H2>
      <form key={editingSetting?.id ?? "new-study-setting"} action={saveSetting} className="mt-5 grid gap-4 md:grid-cols-2">
        <Select label="カテゴリ" name="category" defaultValue={settingDefaults.category ?? "情報資格"}><option>情報資格</option><option>英語</option><option>面接</option><option>その他</option></Select>
        <Select label="曜日" name="day_of_week" defaultValue={settingDefaults.day_of_week ?? dayOfWeek()}>{dayLabels.map((d, i) => <option key={i} value={i}>{d}</option>)}</Select>
        <Input label="目標時間（分）" name="target_minutes" type="number" defaultValue={settingDefaults.target_minutes}/>
        <Input label="内容テンプレ" name="content_template" defaultValue={settingDefaults.content_template}/>
        <div className="flex gap-3 md:col-span-2"><Btn>{editingSetting ? "設定更新" : "設定追加"}</Btn>{editingSetting && <button type="button" onClick={resetSettingEdit} className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">キャンセル</button>}</div>
      </form>
    </Card>

    <Card><H2>今日の記録</H2>
      <div className="mt-4 space-y-3">{logs.map((l) => <div key={l.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><div className="font-bold">{l.category}：{l.minutes}分</div><div className="text-sm text-slate-600">{l.content || "内容なし"}</div><div className="mt-1 text-xs text-slate-500">集中 {l.focus_score ?? "-"} / 理解 {l.understanding_score ?? "-"}{l.memo ? ` / ${l.memo}` : ""}</div></div><div className="flex gap-2"><button type="button" onClick={() => setEditingLog(l)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">編集</button><button type="button" onClick={() => deleteLog(l.id)} className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">削除</button></div></div></div>)}{logs.length === 0 && <div className="text-sm text-slate-500">まだ記録がありません。</div>}</div>
    </Card>

    <Card><H2>勉強ログ履歴</H2><p className="mt-1 text-sm text-slate-500">直近30件を確認・編集・削除できます。</p>
      <div className="mt-4 space-y-3">{history.map((l) => <div key={l.id} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><div className="font-bold text-slate-900">{l.date}　{l.category}：{l.minutes}分</div><div className="mt-1 text-sm text-slate-600">{l.content || "内容なし"}</div><div className="mt-1 text-xs text-slate-500">集中 {l.focus_score ?? "-"} / 理解 {l.understanding_score ?? "-"}{l.memo ? ` / ${l.memo}` : ""}</div></div><div className="flex gap-2"><button type="button" onClick={() => setEditingLog(l)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">編集</button><button type="button" onClick={() => deleteLog(l.id)} className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">削除</button></div></div></div>)}{history.length === 0 && <div className="text-sm text-slate-500">まだ履歴がありません。</div>}</div>
    </Card>

    <Card><H2>登録済み勉強設定</H2>
      <div className="mt-4 space-y-3">{allSettings.map((s) => <div key={s.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><div className="font-bold text-slate-900">{dayLabels[s.day_of_week]}曜：{s.category} / {s.target_minutes}分</div><div className="mt-1 text-sm text-slate-600">{s.content_template || "テンプレなし"}</div></div><div className="flex gap-2"><button type="button" onClick={() => setEditingSetting(s)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">編集</button><button type="button" onClick={() => deleteSetting(s.id)} className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">削除</button></div></div></div>)}{allSettings.length === 0 && <div className="text-sm text-slate-500">登録済みの設定はありません。</div>}</div>
    </Card>
  </div>;
}

export function InterpersonalV5Section() {
  const [log, setLog] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [counts, setCounts] = useState({ led: 0, emp: 0, op: 0 });
  const [msg, setMsg] = useState<Msg>(null);
  const today = todayISO();

  async function load() {
    const uid = await userId();
    const ws = weekStartISO();
    const [{ data: todayLog }, { data: weekLogs }, { data: historyLogs }] = await Promise.all([
      supabase.from("interpersonal_logs").select("*").eq("user_id", uid).eq("date", today).maybeSingle(),
      supabase.from("interpersonal_logs").select("*").eq("user_id", uid).gte("date", ws).lte("date", today),
      supabase.from("interpersonal_logs").select("*").eq("user_id", uid).order("date", { ascending: false }).limit(30),
    ]);
    setLog(todayLog);
    setHistory(historyLogs ?? []);
    setCounts({
      led: (weekLogs ?? []).filter((x) => x.led_action_done).length,
      emp: (weekLogs ?? []).filter((x) => x.empathy_done).length,
      op: (weekLogs ?? []).filter((x) => x.opinion_done).length,
    });
  }

  useEffect(() => {
    load().catch((e) => setMsg({ type: "error", text: e.message }));
  }, []);

  async function save(fd: FormData) {
    try {
      const uid = await userId();
      const targetDate = editingLog?.date ?? today;
      await upsert(
        "interpersonal_logs",
        {
          user_id: uid,
          date: targetDate,
          led_action_done: fd.get("led_action_done") === "on",
          empathy_done: fd.get("empathy_done") === "on",
          opinion_done: fd.get("opinion_done") === "on",
          memo: String(fd.get("memo") || ""),
        },
        "user_id,date"
      );
      setMsg({ type: "ok", text: editingLog ? "対人ログを更新しました。" : "対人ログを保存しました。" });
      setEditingLog(null);
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" });
    }
  }

  async function deleteLog(target: any) {
    if (!confirm(`${target.date} の対人ログを削除しますか？`)) return;
    try {
      const uid = await userId();
      const { error } = await supabase.from("interpersonal_logs").delete().eq("user_id", uid).eq("date", target.date);
      if (error) throw new Error(error.message);
      if (editingLog?.date === target.date) setEditingLog(null);
      setMsg({ type: "ok", text: "対人ログを削除しました。" });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "削除に失敗しました。" });
    }
  }

  const formLog = editingLog ?? log;

  return (
    <div className="space-y-6">
      <Message msg={msg} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><div className="text-sm text-slate-500">主導</div><div className="text-3xl font-black">{counts.led}</div></Card>
        <Card><div className="text-sm text-slate-500">共感</div><div className="text-3xl font-black">{counts.emp}</div></Card>
        <Card><div className="text-sm text-slate-500">意見</div><div className="text-3xl font-black">{counts.op}</div></Card>
      </div>
      <Card>
        <H2>対人テンプレ</H2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-2xl bg-slate-50 p-4">俺はこう思う → なぜなら → どう思う？ → じゃあこうしよう</div>
          <div className="rounded-2xl bg-slate-50 p-4">共感：それって〇〇ってこと？</div>
          <div className="rounded-2xl bg-slate-50 p-4">決断：3秒仮決断。迷ったらA。後で修正OK。</div>
        </div>
      </Card>
      <Card>
        <H2>{editingLog ? `${editingLog.date} の対人ログを編集中` : "今日の対人ログ"}</H2>
        <form action={save} className="mt-5 space-y-4">
          <label className="flex gap-3"><input type="checkbox" name="led_action_done" defaultChecked={!!formLog?.led_action_done} key={`led-${formLog?.date ?? "new"}`} />主導1アクション</label>
          <label className="flex gap-3"><input type="checkbox" name="empathy_done" defaultChecked={!!formLog?.empathy_done} key={`emp-${formLog?.date ?? "new"}`} />共感1回</label>
          <label className="flex gap-3"><input type="checkbox" name="opinion_done" defaultChecked={!!formLog?.opinion_done} key={`op-${formLog?.date ?? "new"}`} />自分の意見</label>
          <Textarea label="メモ" name="memo" defaultValue={formLog?.memo} key={`memo-${formLog?.date ?? "new"}`} />
          <div className="flex flex-wrap gap-3"><Btn>{editingLog ? "更新" : "保存"}</Btn>{editingLog && <button type="button" onClick={() => setEditingLog(null)} className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">今日の入力に戻る</button>}</div>
        </form>
      </Card>
      <Card>
        <H2>対人ログ履歴</H2>
        <div className="mt-4 space-y-3">
          {history.map((item) => (
            <div key={item.date} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-bold text-slate-900">{item.date}</div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className={`rounded-full px-3 py-1 ${item.led_action_done ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>主導{item.led_action_done ? "済" : "未"}</span>
                    <span className={`rounded-full px-3 py-1 ${item.empathy_done ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>共感{item.empathy_done ? "済" : "未"}</span>
                    <span className={`rounded-full px-3 py-1 ${item.opinion_done ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>意見{item.opinion_done ? "済" : "未"}</span>
                  </div>
                  {item.memo && <div className="mt-2 text-sm text-slate-600">{item.memo}</div>}
                </div>
                <div className="flex gap-2"><button type="button" onClick={() => setEditingLog(item)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">編集</button><button type="button" onClick={() => deleteLog(item)} className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">削除</button></div>
              </div>
            </div>
          ))}
          {history.length === 0 && <div className="text-sm text-slate-500">まだ対人ログはありません。</div>}
        </div>
      </Card>
    </div>
  );
}
export function WorkoutV5Section() {
  const [plans, setPlans] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [weekCount, setWeekCount] = useState(0);
  const [openDay, setOpenDay] = useState<number>(dayOfWeek());
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [historyExerciseName, setHistoryExerciseName] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showItemFormFor, setShowItemFormFor] = useState<string | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const today = todayISO();
  const dow = dayOfWeek();
  const orderedDays = [dow, ...dayLabels.map((_, i) => i).filter((i) => i !== dow)];

  async function load() {
    const uid = await userId();
    const ws = weekStartISO();
    const [{ data: planRows, error: planError }, { data: logRows, error: logError }, { data: weekRows, error: weekError }, { data: historyRows, error: historyError }] = await Promise.all([
      supabase.from("workout_plans").select("*").eq("user_id", uid).order("day_of_week", { ascending: true }),
      supabase.from("workout_logs").select("*").eq("user_id", uid).eq("date", today),
      supabase.from("workout_logs").select("date").eq("user_id", uid).gte("date", ws).lte("date", today),
      supabase.from("workout_logs").select("*").eq("user_id", uid).order("date", { ascending: false }).limit(200),
    ]);
    if (planError) throw new Error(planError.message);
    if (logError) throw new Error(logError.message);
    if (weekError) throw new Error(weekError.message);
    if (historyError) throw new Error(historyError.message);
    const ps = planRows ?? [];
    setPlans(ps);
    setTodayLogs(logRows ?? []);
    setHistory(historyRows ?? []);
    setWeekCount(new Set((weekRows ?? []).map((x) => x.date)).size);
    if (ps.length === 0) { setAllItems([]); return; }
    const { data: itemRows, error: itemError } = await supabase.from("workout_plan_items").select("*").in("plan_id", ps.map((p) => p.id)).order("display_order", { ascending: true });
    if (itemError) throw new Error(itemError.message);
    setAllItems(itemRows ?? []);
  }

  useEffect(() => { load().catch((e) => setMsg({ type: "error", text: e.message })); }, []);

  const plansByDay = (day: number) => plans.filter((p) => Number(p.day_of_week) === day);
  const itemsForPlan = (planId: string) => allItems.filter((i) => i.plan_id === planId).sort((a, b) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0));
  const todayPlans = plansByDay(dow);
  const todayItems = todayPlans.flatMap((p) => itemsForPlan(p.id).map((item) => ({ ...item, plan: p })));
  const totalVolume = (x: any) => Number(x?.weight ?? 0) * Number(x?.reps ?? 0) * Number(x?.sets ?? 0);
  const currentLogFor = (item: any) => todayLogs.find((l) => l.exercise_name === item.exercise_name && (!l.plan_id || l.plan_id === item.plan_id));
  const itemHistory = (item: any) => history.filter((h) => h.exercise_name === item.exercise_name).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const previousLogFor = (item: any) => itemHistory(item).filter((h) => h.date < today).at(-1);

  const analytics = useMemo(() => {
    const names = Array.from(new Set(history.map((h) => h.exercise_name).filter(Boolean)));
    return names.map((name) => {
      const rows = history.filter((h) => h.exercise_name === name).sort((a, b) => String(a.date).localeCompare(String(b.date)));
      const first = rows[0];
      const latest = rows.at(-1);
      const prev = rows.length >= 2 ? rows.at(-2) : null;
      return {
        name, count: rows.length, first, latest, prev,
        weightDiff: latest && first ? Number(latest.weight ?? 0) - Number(first.weight ?? 0) : 0,
        repsDiff: latest && first ? Number(latest.reps ?? 0) - Number(first.reps ?? 0) : 0,
        volumeDiff: latest && first ? totalVolume(latest) - totalVolume(first) : 0,
        recentWeightDiff: latest && prev ? Number(latest.weight ?? 0) - Number(prev.weight ?? 0) : null,
        recentRepsDiff: latest && prev ? Number(latest.reps ?? 0) - Number(prev.reps ?? 0) : null,
      };
    }).sort((a, b) => Math.abs(b.volumeDiff) - Math.abs(a.volumeDiff)).slice(0, 12);
  }, [history]);

  async function addPlan(fd: FormData) { try { const uid = await userId(); await insert("workout_plans", { user_id: uid, name: String(fd.get("name")), day_of_week: Number(fd.get("day_of_week")), estimated_minutes: num(fd.get("estimated_minutes")), memo: String(fd.get("memo") || "") }); setMsg({ type: "ok", text: "曜日メニューを作成しました。" }); setShowPlanForm(false); await load(); } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "作成に失敗しました。" }); } }
  async function updatePlan(fd: FormData) { if (!editingPlan?.id) return; try { const { error } = await supabase.from("workout_plans").update({ name: String(fd.get("name")), day_of_week: Number(fd.get("day_of_week")), estimated_minutes: num(fd.get("estimated_minutes")), memo: String(fd.get("memo") || "") }).eq("id", editingPlan.id); if (error) throw new Error(error.message); setMsg({ type: "ok", text: "曜日メニューを更新しました。" }); setEditingPlan(null); setShowPlanForm(false); await load(); } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "更新に失敗しました。" }); } }
  async function deletePlan(id: string) { if (!confirm("この曜日メニューを削除しますか？紐づく種目も削除されます。")) return; try { const { error } = await supabase.from("workout_plans").delete().eq("id", id); if (error) throw new Error(error.message); setMsg({ type: "ok", text: "曜日メニューを削除しました。" }); await load(); } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "削除に失敗しました。" }); } }
  async function addItem(fd: FormData, planId: string) { try { await insert("workout_plan_items", { plan_id: planId, exercise_name: String(fd.get("exercise_name")), body_part: String(fd.get("body_part") || ""), default_weight: num(fd.get("default_weight")), default_reps: num(fd.get("default_reps")), default_sets: num(fd.get("default_sets")), display_order: num(fd.get("display_order")) ?? 0 }); setMsg({ type: "ok", text: "種目を追加しました。" }); setShowItemFormFor(null); await load(); } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "追加に失敗しました。" }); } }
  async function updateItem(fd: FormData) { if (!editingItem?.id) return; try { const { error } = await supabase.from("workout_plan_items").update({ exercise_name: String(fd.get("exercise_name")), body_part: String(fd.get("body_part") || ""), default_weight: num(fd.get("default_weight")), default_reps: num(fd.get("default_reps")), default_sets: num(fd.get("default_sets")), display_order: num(fd.get("display_order")) ?? 0 }).eq("id", editingItem.id); if (error) throw new Error(error.message); setMsg({ type: "ok", text: "種目を更新しました。" }); setEditingItem(null); setShowItemFormFor(null); await load(); } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "更新に失敗しました。" }); } }
  async function deleteItem(id: string) { if (!confirm("この種目を削除しますか？")) return; try { const { error } = await supabase.from("workout_plan_items").delete().eq("id", id); if (error) throw new Error(error.message); setMsg({ type: "ok", text: "種目を削除しました。" }); await load(); } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "削除に失敗しました。" }); } }
  async function saveLog(fd: FormData, item: any) { try { const uid = await userId(); const existing = currentLogFor(item); const payload = { user_id: uid, date: today, plan_id: item.plan_id, exercise_name: item.exercise_name, weight: num(fd.get("weight")), reps: num(fd.get("reps")), sets: num(fd.get("sets")), cardio_minutes: num(fd.get("cardio_minutes")), memo: String(fd.get("memo") || "") }; if (existing?.id) { const { error } = await supabase.from("workout_logs").update(payload).eq("id", existing.id); if (error) throw new Error(error.message); } else await insert("workout_logs", payload); setMsg({ type: "ok", text: "筋トレ記録を保存しました。" }); await load(); } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" }); } }
  async function deleteLog(id: string) { if (!confirm("この筋トレ記録を削除しますか？")) return; try { const { error } = await supabase.from("workout_logs").delete().eq("id", id); if (error) throw new Error(error.message); if (editingLog?.id === id) setEditingLog(null); setMsg({ type: "ok", text: "記録を削除しました。" }); await load(); } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "削除に失敗しました。" }); } }  async function updateHistoryLog(fd: FormData) { if (!editingLog?.id) return; try { const payload = { date: String(fd.get("date") || editingLog.date), weight: num(fd.get("weight")), reps: num(fd.get("reps")), sets: num(fd.get("sets")), cardio_minutes: num(fd.get("cardio_minutes")), memo: String(fd.get("memo") || "") }; const { error } = await supabase.from("workout_logs").update(payload).eq("id", editingLog.id); if (error) throw new Error(error.message); setMsg({ type: "ok", text: "過去の筋トレ記録を更新しました。成長分析にも反映しました。" }); setEditingLog(null); await load(); } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "更新に失敗しました。" }); } }  const historyGroups = useMemo(() => Array.from(new Set(history.map((h) => h.exercise_name).filter(Boolean))).sort(), [history]);  const selectedHistoryRows = history.filter((h) => !historyExerciseName || h.exercise_name === historyExerciseName).sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 50);

  return <div className="space-y-6">
    <Message msg={msg} />
    <div className="grid gap-4 md:grid-cols-3"><Card><div className="text-sm text-slate-500">今週の実施回数</div><div className="text-3xl font-black">{weekCount}回</div></Card><Card><div className="text-sm text-slate-500">今日の曜日</div><div className="mt-2 text-xl font-black">{dayLabels[dow]}曜日</div></Card><Card><div className="text-sm text-slate-500">今日の種目数</div><div className="mt-2 text-3xl font-black">{todayItems.length}</div></Card></div>
    <Card><H2>今日の筋トレ（{dayLabels[dow]}）</H2><p className="mt-2 text-sm text-slate-500">曜日メニューから今日の種目を表示します。種目を開くと記録・前回比較・履歴を確認できます。</p><div className="mt-4 space-y-3">{todayItems.map((item: any) => { const open = openExerciseId === item.id; const current = currentLogFor(item); const prev = previousLogFor(item); const weightDiff = current && prev ? Number(current.weight ?? 0) - Number(prev.weight ?? 0) : null; const repsDiff = current && prev ? Number(current.reps ?? 0) - Number(prev.reps ?? 0) : null; return <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><button type="button" onClick={() => setOpenExerciseId(open ? null : item.id)} className="flex w-full items-center justify-between p-4 text-left"><div><div className="font-bold">{item.exercise_name}</div><div className="text-xs text-slate-500">{item.plan?.name} / {item.body_part || "部位未設定"}{current ? " / 今日記録済み" : ""}</div></div><span className="text-sm font-semibold text-sky-700">{open ? "閉じる" : "開く"}</span></button>{open && <div className="border-t bg-slate-50 p-4"><div className="mb-4 grid gap-3 md:grid-cols-4"><div className="rounded-2xl bg-white p-3 text-sm"><div className="text-slate-500">前回</div><div className="font-bold">{prev ? `${prev.weight ?? "-"}kg × ${prev.reps ?? "-"}回 × ${prev.sets ?? "-"}set` : "記録なし"}</div></div><div className="rounded-2xl bg-white p-3 text-sm"><div className="text-slate-500">今日総負荷</div><div className="font-bold">{current ? `${totalVolume(current)}kg` : "未記録"}</div></div><div className="rounded-2xl bg-white p-3 text-sm"><div className="text-slate-500">重量差</div><div className="font-bold">{weightDiff !== null ? `${weightDiff >= 0 ? "+" : ""}${weightDiff}kg` : "-"}</div></div><div className="rounded-2xl bg-white p-3 text-sm"><div className="text-slate-500">回数差</div><div className="font-bold">{repsDiff !== null ? `${repsDiff >= 0 ? "+" : ""}${repsDiff}回` : "-"}</div></div></div><form action={(fd) => saveLog(fd, item)} className="grid gap-3 md:grid-cols-4"><Input label="重量" name="weight" type="number" defaultValue={current?.weight ?? item.default_weight} /><Input label="回数" name="reps" type="number" defaultValue={current?.reps ?? item.default_reps} /><Input label="セット" name="sets" type="number" defaultValue={current?.sets ?? item.default_sets} /><Input label="有酸素分" name="cardio_minutes" type="number" defaultValue={current?.cardio_minutes} /><div className="md:col-span-4"><Input label="一言ログ" name="memo" defaultValue={current?.memo} /></div><div className="flex flex-wrap gap-2 md:col-span-4"><Btn>{current ? "記録を更新" : "記録"}</Btn>{current?.id && <button type="button" onClick={() => deleteLog(current.id)} className="rounded-2xl bg-rose-100 px-5 py-3 font-semibold text-rose-700">記録削除</button>}</div></form></div>}</div>; })}{todayItems.length === 0 && <div className="text-sm text-slate-500">今日の曜日メニュー・種目がありません。</div>}</div></Card>
    <Card><div className="flex items-center justify-between gap-3"><H2>曜日別メニュー管理</H2><button type="button" onClick={() => { setEditingPlan(null); setShowPlanForm(!showPlanForm); }} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">＋曜日メニュー</button></div>{showPlanForm && <form action={editingPlan ? updatePlan : addPlan} className="mt-5 grid gap-4 md:grid-cols-4"><Input label="メニュー名" name="name" defaultValue={editingPlan?.name} placeholder="例：上半身 / 下半身 / 有酸素" /><Select label="曜日" name="day_of_week" defaultValue={editingPlan?.day_of_week ?? dow}>{dayLabels.map((d, i) => <option key={i} value={i}>{d}</option>)}</Select><Input label="所要時間" name="estimated_minutes" type="number" defaultValue={editingPlan?.estimated_minutes} /><Input label="メモ" name="memo" defaultValue={editingPlan?.memo} /><div className="flex gap-2 md:col-span-4"><Btn>{editingPlan ? "更新" : "作成"}</Btn>{editingPlan && <button type="button" onClick={() => { setEditingPlan(null); setShowPlanForm(false); }} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700">キャンセル</button>}</div></form>}<div className="mt-4 flex flex-wrap gap-2">{orderedDays.map((d) => <button key={d} type="button" onClick={() => setOpenDay(d)} className={`rounded-full px-4 py-2 text-sm font-bold ${openDay === d ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"}`}>{d === dow ? "今日：" : ""}{dayLabels[d]}</button>)}</div><div className="mt-4 space-y-4">{plansByDay(openDay).map((plan) => { const open = openPlanId === plan.id; const planItems = itemsForPlan(plan.id); return <div key={plan.id} className="rounded-2xl border border-slate-200 bg-white"><button type="button" onClick={() => setOpenPlanId(open ? null : plan.id)} className="flex w-full items-center justify-between p-4 text-left"><div><div className="font-bold">{dayLabels[plan.day_of_week]}曜：{plan.name}</div><div className="text-xs text-slate-500">{planItems.length}種目 / {plan.estimated_minutes ? `${plan.estimated_minutes}分` : "時間未設定"}</div></div><span className="text-sm text-sky-700">{open ? "閉じる" : "開く"}</span></button>{open && <div className="border-t bg-slate-50 p-4"><div className="mb-4 flex flex-wrap gap-2"><button type="button" onClick={() => { setEditingPlan(plan); setShowPlanForm(true); }} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700">メニュー編集</button><button type="button" onClick={() => deletePlan(plan.id)} className="rounded-xl bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700">メニュー削除</button><button type="button" onClick={() => { setEditingItem(null); setShowItemFormFor(showItemFormFor === plan.id ? null : plan.id); }} className="rounded-xl bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">＋種目追加</button></div>{showItemFormFor === plan.id && <form action={(fd) => editingItem ? updateItem(fd) : addItem(fd, plan.id)} className="mb-4 grid gap-3 rounded-2xl bg-white p-4 md:grid-cols-4"><Input label="種目名" name="exercise_name" defaultValue={editingItem?.exercise_name} /><Input label="部位" name="body_part" defaultValue={editingItem?.body_part} /><Input label="重量目標" name="default_weight" type="number" defaultValue={editingItem?.default_weight} /><Input label="回数目標" name="default_reps" type="number" defaultValue={editingItem?.default_reps} /><Input label="セット目標" name="default_sets" type="number" defaultValue={editingItem?.default_sets} /><Input label="表示順" name="display_order" type="number" defaultValue={editingItem?.display_order} /><div className="flex gap-2 md:col-span-4"><Btn>{editingItem ? "種目更新" : "種目追加"}</Btn>{editingItem && <button type="button" onClick={() => setEditingItem(null)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700">キャンセル</button>}</div></form>}<div className="space-y-2">{planItems.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3"><div><div className="font-bold">{item.exercise_name}</div><div className="text-xs text-slate-500">{item.body_part || "部位未設定"} / 目標：{item.default_weight ?? "-"}kg × {item.default_reps ?? "-"}回 × {item.default_sets ?? "-"}set</div></div><div className="flex gap-2"><button type="button" onClick={() => { setEditingItem(item); setShowItemFormFor(plan.id); }} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">編集</button><button type="button" onClick={() => deleteItem(item.id)} className="rounded-xl bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-700">削除</button></div></div>)}{planItems.length === 0 && <div className="text-sm text-slate-500">このメニューにはまだ種目がありません。</div>}</div></div>}</div>; })}{plansByDay(openDay).length === 0 && <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">この曜日のメニューはありません。</div>}</div></Card>
    {editingLog && <Card><H2>{editingLog.exercise_name} の過去記録を編集中</H2><p className="mt-2 text-sm text-slate-500">ここで更新すると、下の成長分析の重量差・回数差・総負荷差も再計算されます。</p><form action={updateHistoryLog} className="mt-5 grid gap-3 md:grid-cols-5" key={editingLog.id}><Input label="日付" name="date" type="date" defaultValue={editingLog.date} /><Input label="重量" name="weight" type="number" defaultValue={editingLog.weight} /><Input label="回数" name="reps" type="number" defaultValue={editingLog.reps} /><Input label="セット" name="sets" type="number" defaultValue={editingLog.sets} /><Input label="有酸素分" name="cardio_minutes" type="number" defaultValue={editingLog.cardio_minutes} /><div className="md:col-span-5"><Input label="一言ログ" name="memo" defaultValue={editingLog.memo} /></div><div className="flex flex-wrap gap-2 md:col-span-5"><Btn>更新</Btn><button type="button" onClick={() => setEditingLog(null)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700">キャンセル</button><button type="button" onClick={() => deleteLog(editingLog.id)} className="rounded-2xl bg-rose-100 px-5 py-3 font-semibold text-rose-700">削除</button></div></form></Card>}\n    <Card><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><H2>筋トレ記録履歴</H2><p className="mt-2 text-sm text-slate-500">成長分析に使っている元データです。過去の重量・回数・セットを確認・編集・削除できます。</p></div><select value={historyExerciseName ?? ""} onChange={(e) => setHistoryExerciseName(e.target.value || null)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold"><option value="">全種目</option>{historyGroups.map((name) => <option key={name} value={name}>{name}</option>)}</select></div><div className="mt-4 space-y-3">{selectedHistoryRows.map((log) => <div key={log.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><div className="font-bold text-slate-900">{log.date} / {log.exercise_name}</div><div className="mt-1 text-sm text-slate-600">{log.weight ?? "-"}kg × {log.reps ?? "-"}回 × {log.sets ?? "-"}set / 総負荷 {totalVolume(log)}kg{log.cardio_minutes ? ` / 有酸素 ${log.cardio_minutes}分` : ""}</div>{log.memo && <div className="mt-1 text-xs text-slate-500">{log.memo}</div>}</div><div className="flex gap-2"><button type="button" onClick={() => setEditingLog(log)} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700">編集</button><button type="button" onClick={() => deleteLog(log.id)} className="rounded-xl bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700">削除</button></div></div></div>)}{selectedHistoryRows.length === 0 && <div className="text-sm text-slate-500">まだ筋トレ記録はありません。</div>}</div></Card>\n    <Card><H2>成長分析</H2><p className="mt-2 text-sm text-slate-500">記録済みデータから、初回比・直近比・総負荷の伸びを自動表示します。</p><div className="mt-4 grid gap-3 md:grid-cols-2">{analytics.map((a) => <div key={a.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div><div className="font-bold text-slate-900">{a.name}</div><div className="text-xs text-slate-500">記録 {a.count}回 / 最新 {a.latest?.date}</div></div><div className="text-right text-sm font-black text-slate-900">総負荷 {totalVolume(a.latest)}kg</div></div><div className="mt-3 grid gap-2 text-sm md:grid-cols-3"><div className="rounded-xl bg-white p-3"><div className="text-slate-500">初回比 重量</div><div className="font-bold">{a.weightDiff >= 0 ? "+" : ""}{a.weightDiff}kg</div></div><div className="rounded-xl bg-white p-3"><div className="text-slate-500">初回比 回数</div><div className="font-bold">{a.repsDiff >= 0 ? "+" : ""}{a.repsDiff}回</div></div><div className="rounded-xl bg-white p-3"><div className="text-slate-500">初回比 総負荷</div><div className="font-bold">{a.volumeDiff >= 0 ? "+" : ""}{a.volumeDiff}kg</div></div></div><div className="mt-2 text-xs text-slate-500">直近比：重量 {a.recentWeightDiff === null ? "-" : `${a.recentWeightDiff >= 0 ? "+" : ""}${a.recentWeightDiff}kg`} / 回数 {a.recentRepsDiff === null ? "-" : `${a.recentRepsDiff >= 0 ? "+" : ""}${a.recentRepsDiff}回`}</div></div>)}{analytics.length === 0 && <div className="text-sm text-slate-500">まだ分析できる記録がありません。2回以上記録すると伸びが見えます。</div>}</div></Card>
  </div>;
}

export function OutputsV5Section() {
  const [outputs, setOutputs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [editingOutput, setEditingOutput] = useState<any>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const today = todayISO();

  async function load() {
    const uid = await userId();
    const [{ data: o, error: outputError }, { data: r, error: reviewError }] = await Promise.all([
      supabase.from("outputs").select("*").eq("user_id", uid).order("date", { ascending: false }),
      supabase.from("output_reviews").select("*").eq("user_id", uid),
    ]);
    if (outputError) throw new Error(outputError.message);
    if (reviewError) throw new Error(reviewError.message);
    setOutputs(o ?? []);
    setReviews(r ?? []);
  }

  useEffect(() => { load().catch(e => setMsg({ type: "error", text: e.message })); }, []);

  async function save(fd: FormData) {
    try {
      const uid = await userId();
      const title = String(fd.get("title") || "").trim();
      if (!title) throw new Error("タイトルを入力してください。");
      const payload = {
        user_id: uid,
        date: today,
        title,
        category: String(fd.get("category") || "アプリ改善"),
        purpose: String(fd.get("purpose") || ""),
        content_summary: String(fd.get("content_summary") || ""),
        is_explainable: fd.get("is_explainable") === "on",
        status: String(fd.get("status") || "未着手"),
        memo: String(fd.get("memo") || ""),
      };
      if (editingOutput?.id) {
        const { error } = await supabase.from("outputs").update(payload).eq("id", editingOutput.id).eq("user_id", uid);
        if (error) throw new Error(error.message);
        setMsg({ type: "ok", text: "成果物を更新しました。" });
      } else {
        const { error } = await supabase.from("outputs").insert(payload);
        if (error) throw new Error(error.message);
        setMsg({ type: "ok", text: "成果物を保存しました。下の成果物一覧に反映しました。" });
      }
      setEditingOutput(null);
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" });
    }
  }

  async function deleteOutput(id: string) {
    try {
      const uid = await userId();
      const { error } = await supabase.from("outputs").delete().eq("id", id).eq("user_id", uid);
      if (error) throw new Error(error.message);
      if (editingOutput?.id === id) setEditingOutput(null);
      setMsg({ type: "ok", text: "成果物を削除しました。" });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "削除に失敗しました。" });
    }
  }

  async function review(fd: FormData, outputId: string) {
    try {
      const uid = await userId();
      await upsert("output_reviews", {
        user_id: uid,
        output_id: outputId,
        review_date: today,
        good_points: String(fd.get("good_points") || ""),
        improvements: String(fd.get("improvements") || ""),
        third_person_critique: String(fd.get("third_person_critique") || ""),
        interview_evaluation: String(fd.get("interview_evaluation") || ""),
        next_action: String(fd.get("next_action") || ""),
        updated_at: new Date().toISOString(),
      }, "user_id,output_id");
      setMsg({ type: "ok", text: "AIレビューを保存しました。" });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" });
    }
  }

  const rmap = new Map(reviews.map(r => [r.output_id, r]));
  const formTitle = editingOutput ? "成果物を編集" : "成果物を追加";

  return <div className="space-y-6"><Message msg={msg}/><Card><div className="flex flex-wrap items-center justify-between gap-3"><H2>{formTitle}</H2>{editingOutput && <button type="button" onClick={() => setEditingOutput(null)} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">新規入力に戻る</button>}</div><form key={editingOutput?.id ?? "new-output"} action={save} className="mt-5 grid gap-4 md:grid-cols-2"><Input label="タイトル" name="title" defaultValue={editingOutput?.title}/><Select label="カテゴリ" name="category" defaultValue={editingOutput?.category ?? "アプリ改善"}><option>アプリ改善</option><option>技術整理</option><option>記事</option><option>その他</option></Select><Input label="目的" name="purpose" defaultValue={editingOutput?.purpose}/><Select label="状態" name="status" defaultValue={editingOutput?.status ?? "未着手"}><option>未着手</option><option>進行中</option><option>完了</option></Select><div className="md:col-span-2"><Textarea label="AIに見せる要約" name="content_summary" defaultValue={editingOutput?.content_summary}/></div><label className="flex items-center gap-3"><input type="checkbox" name="is_explainable" defaultChecked={!!editingOutput?.is_explainable}/>説明できる状態</label><Input label="メモ" name="memo" defaultValue={editingOutput?.memo}/><div className="md:col-span-2"><Btn>{editingOutput ? "更新" : "保存"}</Btn></div></form></Card><Card><H2>成果物一覧</H2><div className="mt-3 text-sm text-slate-500">保存した成果物はここで確認・編集・削除できます。面接で話す材料として残します。</div><div className="mt-5 space-y-4">{outputs.length === 0 ? <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">まだ成果物はありません。</div> : outputs.map(o => { const r = rmap.get(o.id); return <div key={o.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="font-black text-slate-900">{o.title}</div><div className="mt-1 text-sm text-slate-500">{o.date} / {o.category} / {o.status} / 説明可能：{o.is_explainable ? "Yes" : "No"}</div>{o.purpose && <div className="mt-2 text-sm"><span className="font-bold">目的：</span>{o.purpose}</div>}{o.content_summary && <div className="mt-2 whitespace-pre-wrap rounded-2xl bg-slate-50 p-3 text-sm"><span className="font-bold">AIに見せる要約：</span><br />{o.content_summary}</div>}{o.memo && <div className="mt-2 text-sm text-slate-600">メモ：{o.memo}</div>}</div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => { setEditingOutput(o); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-2xl bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">編集</button><button type="button" onClick={() => deleteOutput(o.id)} className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">削除</button></div></div><details className="mt-4 rounded-2xl bg-slate-50 p-4"><summary className="cursor-pointer text-sm font-bold text-slate-700">AIレビュー / 面接用メモ</summary><form action={(fd) => review(fd, o.id)} className="mt-4 grid gap-3"><Textarea label="良い点" name="good_points" defaultValue={r?.good_points}/><Textarea label="改善点" name="improvements" defaultValue={r?.improvements}/><Textarea label="厳しい第三者ダメ出し" name="third_person_critique" defaultValue={r?.third_person_critique}/><Textarea label="面接官評価" name="interview_evaluation" defaultValue={r?.interview_evaluation}/><Textarea label="次の改善1つ" name="next_action" defaultValue={r?.next_action}/><Btn>AIレビュー保存</Btn></form></details></div>})}</div></Card></div>;
}


export function WeeklyReviewV5Section() {
  const [summary, setSummary] = useState<any>({});
  const [review, setReview] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const today = todayISO();
  const ws = weekStartISO();

  function avg(arr: any[]) {
    const v = arr.filter((x) => x !== null && x !== undefined && !Number.isNaN(Number(x))).map(Number);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  }

  async function load() {
    const uid = await userId();
    const [h, s, w, o, i, r, g, historyRows] = await Promise.all([
      supabase.from("health_logs").select("*").eq("user_id", uid).gte("date", ws).lte("date", today),
      supabase.from("study_logs").select("*").eq("user_id", uid).gte("date", ws).lte("date", today),
      supabase.from("workout_logs").select("date").eq("user_id", uid).gte("date", ws).lte("date", today),
      supabase.from("outputs").select("*").eq("user_id", uid).gte("date", ws).lte("date", today),
      supabase.from("interpersonal_logs").select("*").eq("user_id", uid).gte("date", ws).lte("date", today),
      supabase.from("weekly_reviews").select("*").eq("user_id", uid).eq("week_start_date", ws).maybeSingle(),
      supabase.from("grooming_logs").select("*").eq("user_id", uid).gte("date", ws).lte("date", today),
      supabase.from("weekly_reviews").select("*").eq("user_id", uid).order("week_start_date", { ascending: false }).limit(12),
    ]);

    const errors = [h, s, w, o, i, r, g, historyRows].map((x: any) => x.error?.message).filter(Boolean);
    if (errors.length) throw new Error(errors[0]);

    const nextSummary = {
      avgWeight: avg((h.data ?? []).map((x: any) => x.weight)),
      avgBodyFat: avg((h.data ?? []).map((x: any) => x.body_fat)),
      studyMinutes: (s.data ?? []).reduce((sum: number, x: any) => sum + (Number(x.minutes) || 0), 0),
      workoutCount: new Set((w.data ?? []).map((x: any) => x.date)).size,
      outputCount: o.data?.length ?? 0,
      ledActionCount: (i.data ?? []).filter((x: any) => x.led_action_done).length,
      cleanlinessRate: g.data?.length ? Math.round(((g.data ?? []).filter((x: any) => x.is_done).length / (g.data ?? []).length) * 100) : null,
    };

    setSummary(nextSummary);
    setReview(r.data);
    setHistory(historyRows.data ?? []);
  }

  useEffect(() => {
    load().catch((e) => setMsg({ type: "error", text: e.message }));
  }, []);

  async function save(fd: FormData) {
    try {
      const uid = await userId();
      const targetWeek = editingReview?.week_start_date ?? ws;
      const payload = {
        user_id: uid,
        week_start_date: targetWeek,
        avg_weight: summary.avgWeight,
        avg_body_fat: summary.avgBodyFat,
        study_minutes_total: summary.studyMinutes,
        workout_count: summary.workoutCount,
        output_count: summary.outputCount,
        led_action_count: summary.ledActionCount,
        cleanliness_rate: summary.cleanlinessRate,
        good_points: String(fd.get("good_points") || ""),
        bad_points: String(fd.get("bad_points") || ""),
        ai_review_summary: String(fd.get("ai_review_summary") || ""),
        next_improvement: String(fd.get("next_improvement") || ""),
        updated_at: new Date().toISOString(),
      };

      await upsert("weekly_reviews", payload, "user_id,week_start_date");

      setEditingReview(null);
      setMsg({ type: "ok", text: editingReview ? "週次レビューを更新しました。" : "週次レビューを保存しました。" });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" });
    }
  }

  async function deleteReview(target: any) {
    if (!confirm(`${target.week_start_date} の週次レビューを削除しますか？`)) return;
    try {
      const uid = await userId();
      const q = supabase.from("weekly_reviews").delete().eq("user_id", uid).eq("week_start_date", target.week_start_date);
      const { error } = await q;
      if (error) throw new Error(error.message);
      if (editingReview?.week_start_date === target.week_start_date) setEditingReview(null);
      setMsg({ type: "ok", text: "週次レビューを削除しました。" });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "削除に失敗しました。" });
    }
  }

  const formReview = editingReview ?? review ?? {};
  const kpis = [
    ["平均体重", summary.avgWeight == null ? "-" : `${summary.avgWeight.toFixed(1)}kg`],
    ["平均体脂肪", summary.avgBodyFat == null ? "-" : `${summary.avgBodyFat.toFixed(1)}%`],
    ["勉強", `${summary.studyMinutes ?? 0}分`],
    ["筋トレ", `${summary.workoutCount ?? 0}回`],
    ["成果物", `${summary.outputCount ?? 0}個`],
    ["主導", `${summary.ledActionCount ?? 0}回`],
    ["清潔達成率", summary.cleanlinessRate == null ? "-" : `${summary.cleanlinessRate}%`],
  ];

  return (
    <div className="space-y-6">
      <Message msg={msg} />

      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map(([a, b]) => (
          <Card key={a}>
            <div className="text-sm text-slate-500">{a}</div>
            <div className="mt-2 text-2xl font-black">{b}</div>
          </Card>
        ))}
      </div>

      <Card>
        <H2>AIレビュー用テンプレ</H2>
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm">{`この内容を評価してください。

① 良い点
② 改善点
③ 厳しい第三者としてダメ出し
④ 面接官なら採用するか（理由）
⑤ 来週の改善を1つに絞るなら何か`}</pre>
      </Card>

      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <H2>{editingReview ? `${editingReview.week_start_date} の週次レビュー編集中` : "今週の振り返り"}</H2>
            <p className="mt-2 text-sm text-slate-500">良かったこと・崩れた原因・AIレビュー・来週の改善1つに絞って、転職用の改善ログとして残します。</p>
          </div>
          {editingReview && (
            <button type="button" onClick={() => setEditingReview(null)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              今週の入力に戻る
            </button>
          )}
        </div>
        <form key={editingReview?.week_start_date ?? "current-week"} action={save} className="mt-5 grid gap-4">
          <Textarea label="今週よかったこと" name="good_points" defaultValue={formReview.good_points} rows={4} />
          <Textarea label="今週ダメだったこと / 崩れた原因" name="bad_points" defaultValue={formReview.bad_points} rows={4} />
          <Textarea label="AIレビュー結果要約" name="ai_review_summary" defaultValue={formReview.ai_review_summary} rows={4} />
          <Input label="来週の改善1つ" name="next_improvement" defaultValue={formReview.next_improvement} />
          <div className="flex gap-3">
            <Btn>{editingReview ? "更新" : "保存"}</Btn>
            {editingReview && <button type="button" onClick={() => setEditingReview(null)} className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">キャンセル</button>}
          </div>
        </form>
      </Card>

      <Card>
        <H2>週次レビュー履歴</H2>
        <p className="mt-2 text-sm text-slate-500">過去のレビューを確認・編集・削除できます。</p>
        <div className="mt-4 space-y-3">
          {history.map((r) => (
            <div key={r.week_start_date} className={(editingReview?.week_start_date === r.week_start_date ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-slate-50") + " rounded-2xl border p-4"}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="font-black text-slate-900">{r.week_start_date} 週</div>
                  <div className="mt-2 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    <div>良かったこと：{r.good_points || "-"}</div>
                    <div>改善1つ：{r.next_improvement || "-"}</div>
                  </div>
                  {r.ai_review_summary && <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700">AI要約：{r.ai_review_summary}</div>}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => { setEditingReview(r); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">編集</button>
                  <button type="button" onClick={() => deleteReview(r)} className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">削除</button>
                </div>
              </div>
            </div>
          ))}
          {history.length === 0 && <div className="text-sm text-slate-500">まだ週次レビューはありません。</div>}
        </div>
      </Card>
    </div>
  );
}

export function MoneyV5Section() {
  const [monthlyLog, setMonthlyLog] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [msg, setMsg] = useState<Msg>(null);
  const month = monthISO();
  const today = todayISO();
  const yen = (v: number) => new Intl.NumberFormat("ja-JP").format(Math.round(v));

  async function load() {
    const uid = await userId();
    const monthStart = month + "-01";
    const monthEnd = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).toISOString().slice(0, 10);
    const [{ data: monthly, error: monthlyError }, { data: monthEntries, error: entriesError }] = await Promise.all([
      supabase.from("money_logs").select("*").eq("user_id", uid).eq("month", month).maybeSingle(),
      supabase.from("money_entries").select("*").eq("user_id", uid).gte("entry_date", monthStart).lte("entry_date", monthEnd).order("entry_date", { ascending: false }).order("created_at", { ascending: false }),
    ]);
    if (monthlyError) throw new Error(monthlyError.message);
    if (entriesError) throw new Error(entriesError.message);
    setMonthlyLog(monthly);
    setEntries(monthEntries ?? []);
  }

  useEffect(() => { load().catch(e => setMsg({ type: "error", text: e.message })); }, []);

  const incomeEntries = entries.filter((e) => e.entry_type === "income");
  const expenseEntries = entries.filter((e) => e.entry_type === "expense");
  const incomeTotal = incomeEntries.reduce((sum, e) => sum + Number(e.amount ?? 0), 0);
  const expenseTotal = expenseEntries.reduce((sum, e) => sum + Number(e.amount ?? 0), 0);
  const balance = incomeTotal - expenseTotal;

  async function saveEntry(fd: FormData) {
    try {
      const uid = await userId();
      await insert("money_entries", {
        user_id: uid,
        entry_date: String(fd.get("entry_date") || today),
        entry_type: String(fd.get("entry_type") || "expense"),
        category: String(fd.get("category") || "その他"),
        title: String(fd.get("title") || ""),
        amount: num(fd.get("amount")) ?? 0,
        memo: String(fd.get("memo") || ""),
        visibility: "private",
      });
      setMsg({ type: "ok", text: "お金メモを追加しました。下の収入・支出履歴に反映しました。" });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" });
    }
  }

  async function saveMonthly(fd: FormData) {
    try {
      const uid = await userId();
      await upsert("money_logs", {
        user_id: uid,
        month: String(fd.get("month") || month),
        income: incomeTotal,
        expense: expenseTotal,
        investment: num(fd.get("investment")),
        nisa_checked: fd.get("nisa_checked") === "on",
        memo: String(fd.get("memo") || ""),
        updated_at: new Date().toISOString(),
      }, "user_id,month");
      setMsg({ type: "ok", text: "NISA・月次確認を保存しました。確認状況に反映しました。" });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" });
    }
  }

  async function deleteEntry(id: string) {
    if (!confirm("このお金メモを削除しますか？")) return;
    try {
      const { error } = await supabase.from("money_entries").delete().eq("id", id);
      if (error) throw new Error(error.message);
      setMsg({ type: "ok", text: "お金メモを削除しました。" });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "削除に失敗しました。" });
    }
  }

  const EntryList = ({ title, items, type }: { title: string; items: any[]; type: "income" | "expense" }) => (
    <Card>
      <div className="flex items-end justify-between gap-3">
        <div>
          <H2>{title}</H2>
          <div className="mt-1 text-sm text-slate-500">{items.length}件</div>
        </div>
        <div className={(type === "income" ? "text-emerald-600" : "text-red-600") + " text-2xl font-black"}>
          {type === "income" ? "+" : "-"}¥{yen(items.reduce((sum, e) => sum + Number(e.amount ?? 0), 0))}
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((entry) => (
          <div key={entry.id} className="rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900">{entry.title || entry.category || "無題"}</div>
                <div className="text-slate-500">{entry.entry_date} / {entry.category || "その他"}</div>
                {entry.memo ? <div className="mt-1 text-slate-600">{entry.memo}</div> : null}
              </div>
              <div className="text-right">
                <div className={(type === "income" ? "text-emerald-600" : "text-red-600") + " whitespace-nowrap font-black"}>{type === "income" ? "+" : "-"}¥{yen(Number(entry.amount ?? 0))}</div>
                <button type="button" onClick={() => deleteEntry(entry.id)} className="mt-2 text-xs font-semibold text-rose-600">削除</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-slate-500">今月の{type === "income" ? "収入" : "支出"}メモはまだありません。</div>}
      </div>
    </Card>
  );

  return <div className="space-y-6">
    <Message msg={msg}/>

    <div className="grid gap-4 md:grid-cols-4">
      <Card><div className="text-sm text-slate-500">今月の収入</div><div className="mt-2 text-3xl font-black text-emerald-600">¥{yen(incomeTotal)}</div></Card>
      <Card><div className="text-sm text-slate-500">今月の支出</div><div className="mt-2 text-3xl font-black text-red-600">¥{yen(expenseTotal)}</div></Card>
      <Card><div className="text-sm text-slate-500">差分</div><div className={(balance >= 0 ? "text-emerald-600" : "text-red-600") + " mt-2 text-3xl font-black"}>¥{yen(balance)}</div></Card>
      <Card><div className="text-sm text-slate-500">NISA確認</div><div className={(monthlyLog?.nisa_checked ? "text-emerald-600" : "text-slate-400") + " mt-2 text-2xl font-black"}>{monthlyLog?.nisa_checked ? "確認済み" : "未確認"}</div></Card>
    </div>

    <Card>
      <H2>NISA・月次確認状況</H2>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm text-slate-500">対象月</div><div className="mt-1 text-xl font-black">{monthlyLog?.month ?? month}</div></div>
        <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm text-slate-500">投資額</div><div className="mt-1 text-xl font-black">¥{yen(Number(monthlyLog?.investment ?? 0))}</div></div>
        <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm text-slate-500">収入/支出</div><div className="mt-1 text-lg font-black">¥{yen(incomeTotal)} / ¥{yen(expenseTotal)}</div></div>
        <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm text-slate-500">月次メモ</div><div className="mt-1 font-semibold text-slate-800">{monthlyLog?.memo || "未入力"}</div></div>
      </div>
    </Card>

    <Card>
      <H2>お金メモ追加</H2>
      <p className="mt-2 text-sm text-slate-500">使った額や収入を、その都度メモします。登録後は下の「収入履歴」「支出履歴」に分かれて表示されます。</p>
      <form action={saveEntry} className="mt-5 grid gap-4 md:grid-cols-2">
        <Input label="日付" name="entry_date" type="date" defaultValue={today}/>
        <Select label="種別" name="entry_type"><option value="expense">支出</option><option value="income">収入</option></Select>
        <Input label="カテゴリ" name="category" placeholder="食費 / 交通 / 美容 / 趣味など"/>
        <Input label="金額" name="amount" type="number"/>
        <Input label="タイトル" name="title" placeholder="例：昼食、制汗剤、交通費"/>
        <Input label="メモ" name="memo"/>
        <div className="md:col-span-2"><Btn>メモ追加</Btn></div>
      </form>
    </Card>

    <Card>
      <H2>NISA・月次確認を登録</H2>
      <form action={saveMonthly} className="mt-5 grid gap-4 md:grid-cols-2">
        <Input label="月" name="month" type="month" defaultValue={monthlyLog?.month ?? month}/>
        <Input label="投資額" name="investment" type="number" defaultValue={monthlyLog?.investment}/>
        <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"><input type="checkbox" name="nisa_checked" defaultChecked={!!monthlyLog?.nisa_checked}/>NISA確認済み</label>
        <Input label="月次メモ" name="memo" defaultValue={monthlyLog?.memo}/>
        <div className="md:col-span-2"><Btn>月次確認を保存</Btn></div>
      </form>
    </Card>

    <div className="grid gap-6 lg:grid-cols-2">
      <EntryList title="今月の収入履歴" items={incomeEntries} type="income" />
      <EntryList title="今月の支出履歴" items={expenseEntries} type="expense" />
    </div>
  </div>;
}

const defaultRules = {
  wake_up_time: "06:55",
  sleep_time: "00:00",
  sleep_rule: "23:30以降は作業しない（強制終了）",
  breakfast_rule: "ご飯200〜250g＋納豆＋味噌汁＋卵＋プロテイン",
  lunch_rule: "おにぎり2個＋タンパク質（チキン or ツナ等）",
  dinner_rule: "ご飯最大300g＋タンパク質中心・腹8分",
  diet_control_rule: "揚げ物・高脂質は週2まで、連続は禁止",
  water_rule: "2000ml",
  commute_rule: "英語 or AWS（インプット）",
  lunch_break_rule: "復習（軽め）",
  extra_rules: [] as string[],
};

function RulesCard({ icon, title, children, accent = false }: { icon: string; title: string; children: React.ReactNode; accent?: boolean }) {
  return <Card className={accent ? "border-sky-200 bg-sky-50" : ""}><div className="mb-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-xl shadow-sm">{icon}</span><H2>{title}</H2></div><div className="space-y-4 text-base leading-8 text-slate-800 md:text-lg">{children}</div></Card>;
}

export function SettingsV5Section() {
  const [rules, setRules] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  async function load() {
    const uid = await userId();
    const { data, error } = await supabase.from("user_rules").select("*").eq("user_id", uid).maybeSingle();
    if (error) throw new Error(error.message);
    if (data) { setRules(data); return; }
    const { data: inserted, error: insertError } = await supabase.from("user_rules").insert({ user_id: uid, ...defaultRules }).select("*").single();
    if (insertError) throw new Error(insertError.message);
    setRules(inserted);
  }

  useEffect(() => { load().catch(e => setMsg({ type: "error", text: e.message })); }, []);

  async function save(fd: FormData) {
    try {
      const uid = await userId();
      const extraRules = String(fd.get("extra_rules") || "").split("\n").map((rule) => rule.trim()).filter(Boolean);
      await upsert("user_rules", {
        user_id: uid,
        wake_up_time: String(fd.get("wake_up_time") || defaultRules.wake_up_time),
        sleep_time: String(fd.get("sleep_time") || defaultRules.sleep_time),
        sleep_rule: String(fd.get("sleep_rule") || defaultRules.sleep_rule),
        breakfast_rule: String(fd.get("breakfast_rule") || defaultRules.breakfast_rule),
        lunch_rule: String(fd.get("lunch_rule") || defaultRules.lunch_rule),
        dinner_rule: String(fd.get("dinner_rule") || defaultRules.dinner_rule),
        diet_control_rule: String(fd.get("diet_control_rule") || defaultRules.diet_control_rule),
        water_rule: String(fd.get("water_rule") || defaultRules.water_rule),
        commute_rule: String(fd.get("commute_rule") || defaultRules.commute_rule),
        lunch_break_rule: String(fd.get("lunch_break_rule") || defaultRules.lunch_break_rule),
        extra_rules: extraRules,
        updated_at: new Date().toISOString(),
      }, "user_id");
      setMsg({ type: "ok", text: "ルールを保存しました。" });
      setEditMode(false);
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" });
    }
  }

  const r = rules ?? defaultRules;

  if (editMode) {
    return <div className="space-y-6"><Message msg={msg}/><Card><div className="flex items-start justify-between gap-4"><div><div className="text-sm font-semibold text-sky-700">Life OS Ver.5</div><h2 className="mt-1 text-4xl font-black text-slate-950">ルール編集</h2><p className="mt-2 text-sm text-slate-500">月1回だけ見直す場所。普段は表示モードで確認します。</p></div><button type="button" onClick={() => setEditMode(false)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold shadow-sm">キャンセル</button></div><form action={save} className="mt-6 grid gap-4 md:grid-cols-2"><Input label="起床時間" name="wake_up_time" type="time" defaultValue={r.wake_up_time}/><Input label="就寝時間" name="sleep_time" type="time" defaultValue={r.sleep_time}/><div className="md:col-span-2"><Textarea label="睡眠ルール" name="sleep_rule" rows={2} defaultValue={r.sleep_rule}/></div><Textarea label="朝食内容" name="breakfast_rule" rows={3} defaultValue={r.breakfast_rule}/><Textarea label="昼食ルール" name="lunch_rule" rows={3} defaultValue={r.lunch_rule}/><Textarea label="夕食ルール" name="dinner_rule" rows={3} defaultValue={r.dinner_rule}/><Textarea label="食事制御ルール" name="diet_control_rule" rows={3} defaultValue={r.diet_control_rule}/><Input label="水分目標" name="water_rule" defaultValue={r.water_rule}/><Textarea label="通勤ルール" name="commute_rule" rows={2} defaultValue={r.commute_rule}/><Textarea label="昼休みルール" name="lunch_break_rule" rows={2} defaultValue={r.lunch_break_rule}/><div className="md:col-span-2"><Textarea label="任意ルール（1行に1つ）" name="extra_rules" rows={5} defaultValue={(r.extra_rules ?? []).join("\n")} placeholder={"例：週平均体重で調整\n筋トレ優先\n夜は軽め"}/></div><div className="flex flex-col gap-3 md:col-span-2 md:flex-row"><button type="button" onClick={() => setEditMode(false)} className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700">キャンセル</button><button className="flex-1 rounded-2xl bg-sky-600 px-5 py-3 font-bold text-white shadow-sm">保存</button></div></form></Card></div>;
  }

  return <div className="space-y-6"><Message msg={msg}/><div className="flex items-start justify-between gap-4"><div><div className="text-sm font-semibold text-sky-700">Life OS Ver.5</div><h2 className="mt-1 text-4xl font-black text-slate-950">ルール</h2><p className="mt-2 text-sm text-slate-500">覚えるためではなく、毎日見て迷わず動くための画面。</p></div><button type="button" onClick={() => setEditMode(true)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold shadow-sm">✏️ 編集</button></div><RulesCard icon="🕒" title="最重要ルール" accent><p>起床：<strong>{r.wake_up_time}</strong></p><p>就寝：<strong>{r.sleep_time}</strong></p><p>{r.sleep_rule}</p></RulesCard><RulesCard icon="🍚" title="食事ルール"><div><p className="font-bold text-slate-950">朝</p><p>{r.breakfast_rule}</p></div><div><p className="font-bold text-slate-950">昼</p><p>{r.lunch_rule}</p></div><div><p className="font-bold text-slate-950">夜</p><p>{r.dinner_rule}</p></div><div><p className="font-bold text-slate-950">制御ルール</p><p>{r.diet_control_rule}</p></div></RulesCard><RulesCard icon="💧" title="水分・健康"><p>水分：<strong>{r.water_rule}</strong></p><p>不足時は夜で調整</p></RulesCard><RulesCard icon="🚃" title="スキマ時間活用"><p>通勤：{r.commute_rule}</p><p>昼：{r.lunch_break_rule}</p></RulesCard><RulesCard icon="🧩" title="任意ルール">{Array.isArray(r.extra_rules) && r.extra_rules.length > 0 ? <ul className="list-disc space-y-1 pl-5">{r.extra_rules.map((rule: string, index: number) => <li key={`${rule}-${index}`}>{rule}</li>)}</ul> : <p className="text-slate-500">任意ルールはまだありません。</p>}</RulesCard><button type="button" onClick={() => setConfirmed(true)} className="w-full rounded-2xl bg-slate-900 p-4 text-lg font-bold text-white shadow-sm">今日守る</button>{confirmed ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">今日のルール確認OK。あとはダッシュボード通りに動けば大丈夫です。</div> : null}</div>;
}

export function RecoveryV5Section() {
  const [msg,setMsg]=useState<Msg>(null);
  async function recover(){try{const uid=await userId(); const date=todayISO(); await insert("grooming_logs",{user_id:uid,date,category:"recovery",item_name:"歯磨き",is_done:true}); await insert("grooming_logs",{user_id:uid,date,category:"recovery",item_name:"シャワー",is_done:true}); await upsert("health_logs",{user_id:uid,date,water_ml:1000,updated_at:new Date().toISOString()},"user_id,date"); setMsg({type:"ok",text:"最低限リカバリを保存しました。体重だけ健康タブで入れれば完全OKです。"});}catch(e){setMsg({type:"error",text:e instanceof Error?e.message:"保存に失敗しました。"})}}
  return <Card><H2>今日は崩れた</H2><p className="mt-2 text-sm text-slate-500">歯磨き・シャワー・水1Lを一括保存します。体重は健康タブで入力してください。</p><Message msg={msg}/><button onClick={recover} className="mt-5 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white">最低限リカバリを実行</button></Card>
}

export function DashboardV5Section({ onGo }: { onGo: (key: any) => void }) {
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const today = todayISO();
  const dow = dayOfWeek();
  const ws = weekStartISO();

  const weeklyPlan: Record<number, string[]> = {
    0: ["全身トレ", "有酸素", "週次レビュー", "AIレビュー"],
    1: ["宅トレ30分", "有酸素15分", "体重測定"],
    2: ["ジムA", "有酸素15分", "勉強"],
    3: ["休み", "ストレッチ5分", "軽振り返り"],
    4: ["ジムB", "有酸素15分", "勉強"],
    5: ["有酸素15〜20分", "ストレッチ", "軽評価"],
    6: ["上半身トレ", "有酸素", "成果物タイム"],
  };

  function avg(arr: any[]) {
    const v = arr.filter((x) => x !== null && x !== undefined && !Number.isNaN(Number(x))).map(Number);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  }

  async function load() {
    const uid = await userId();
    const [health, weekHealth, routineT, routineL, groomingT, groomingL, householdT, householdL, interpersonal, studyToday, studyWeek, workoutWeek, outputs, weekly, outputReviews, settings] = await Promise.all([
      supabase.from("health_logs").select("*").eq("user_id", uid).eq("date", today).maybeSingle(),
      supabase.from("health_logs").select("*").eq("user_id", uid).gte("date", ws).lte("date", today),
      supabase.from("routine_templates").select("*").eq("user_id", uid).eq("is_active", true).or(`day_of_week.is.null,day_of_week.eq.${dow}`).order("display_order", { ascending: true }),
      supabase.from("routine_logs").select("*").eq("user_id", uid).eq("date", today),
      supabase.from("grooming_templates").select("*").eq("user_id", uid).eq("is_active", true).or(`day_of_week.is.null,day_of_week.eq.${dow}`).order("display_order", { ascending: true }),
      supabase.from("grooming_logs").select("*").eq("user_id", uid).eq("date", today),
      supabase.from("household_templates").select("*").eq("user_id", uid).eq("is_active", true).eq("day_of_week", dow).order("display_order", { ascending: true }),
      supabase.from("household_logs").select("*").eq("user_id", uid).eq("date", today),
      supabase.from("interpersonal_logs").select("*").eq("user_id", uid).eq("date", today).maybeSingle(),
      supabase.from("study_logs").select("*").eq("user_id", uid).eq("date", today),
      supabase.from("study_logs").select("*").eq("user_id", uid).gte("date", ws).lte("date", today),
      supabase.from("workout_logs").select("*").eq("user_id", uid).gte("date", ws).lte("date", today),
      supabase.from("outputs").select("*").eq("user_id", uid).gte("date", ws).lte("date", today),
      supabase.from("weekly_reviews").select("*").eq("user_id", uid).eq("week_start_date", ws).maybeSingle(),
      supabase.from("output_reviews").select("*").eq("user_id", uid).gte("review_date", ws).lte("review_date", today),
      supabase.from("user_settings").select("*").eq("user_id", uid).maybeSingle(),
    ]);
    const errors = [health, weekHealth, routineT, routineL, groomingT, groomingL, householdT, householdL, interpersonal, studyToday, studyWeek, workoutWeek, outputs, weekly, outputReviews, settings].map((r: any) => r.error?.message).filter(Boolean);
    if (errors.length) throw new Error(errors[0]);

    const rt = routineT.data ?? [];
    const rl = routineL.data ?? [];
    const gt = groomingT.data ?? [];
    const gl = groomingL.data ?? [];
    const ht = householdT.data ?? [];
    const hl = householdL.data ?? [];
    const h = health.data;
    const inter = interpersonal.data;
    const routineLogMap = new Map(rl.map((l: any) => [l.template_id, l]));
    const groomingLogMap = new Map(gl.map((l: any) => [`${l.category}:${l.item_name}`, l]));
    const householdLogMap = new Map(hl.map((l: any) => [l.task_name, l]));

    const checklist: Array<{ section: string; items: any[] }> = [
      { section: "朝", items: rt.filter((x: any) => x.category === "morning").map((x: any) => ({ key: `routine-${x.id}`, label: x.title, done: !!routineLogMap.get(x.id)?.is_done, tab: "routine", type: "routine", template: x })) },
      { section: "昼", items: rt.filter((x: any) => x.category === "noon").map((x: any) => ({ key: `routine-${x.id}`, label: x.title, done: !!routineLogMap.get(x.id)?.is_done, tab: "routine", type: "routine", template: x })) },
      { section: "夜", items: rt.filter((x: any) => x.category === "night").map((x: any) => ({ key: `routine-${x.id}`, label: x.title, done: !!routineLogMap.get(x.id)?.is_done, tab: "routine", type: "routine", template: x })) },
      { section: "清潔", items: gt.map((x: any) => ({ key: `grooming-${x.id}`, label: x.item_name, done: !!groomingLogMap.get(`${x.category}:${x.item_name}`)?.is_done, tab: "cleanliness", type: "grooming", template: x })) },
      { section: "家事", items: ht.map((x: any) => ({ key: `household-${x.id}`, label: x.task_name, done: !!householdLogMap.get(x.task_name)?.is_done, tab: "household", type: "household", template: x })) },
      { section: "対人", items: [
        { key: "inter-led", label: "主導1アクション", done: !!inter?.led_action_done, tab: "interpersonal", type: "interpersonal", field: "led_action_done" },
        { key: "inter-emp", label: "共感1回", done: !!inter?.empathy_done, tab: "interpersonal", type: "interpersonal", field: "empathy_done" },
        { key: "inter-opinion", label: "意見を言う", done: !!inter?.opinion_done, tab: "interpersonal", type: "interpersonal", field: "opinion_done" },
      ]},
      { section: "健康", items: [
        { key: "health-weight", label: "体重", done: h?.weight != null, tab: "health", type: "navigate" },
        { key: "health-body-fat", label: "体脂肪", done: h?.body_fat != null, tab: "health", type: "navigate" },
        { key: "health-water", label: "水分", done: h?.water_ml != null && Number(h.water_ml) >= Number(settings.data?.water_target_ml ?? 2000), tab: "health", type: "navigate" },
      ]},
      { section: "勉強・筋トレ・成果", items: [
        { key: "study", label: `勉強 ${(studyToday.data ?? []).reduce((s: number, x: any) => s + (Number(x.minutes) || 0), 0)}分`, done: (studyToday.data ?? []).length > 0, tab: "study", type: "navigate" },
        { key: "workout", label: "筋トレ記録", done: (workoutWeek.data ?? []).some((x: any) => x.date === today), tab: "workout", type: "navigate" },
        { key: "outputs", label: "成果物", done: (outputs.data ?? []).length > 0, tab: "outputs", type: "navigate" },
      ]},
    ];
    const doneCount = checklist.flatMap((s) => s.items).filter((i: any) => i.done).length;
    const totalCount = checklist.flatMap((s) => s.items).length;
    const completionRate = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
    const weekHealthRows = weekHealth.data ?? [];
    const todayStudyMinutes = (studyToday.data ?? []).reduce((s: number, x: any) => s + (Number(x.minutes) || 0), 0);
    const weekStudyMinutes = (studyWeek.data ?? []).reduce((s: number, x: any) => s + (Number(x.minutes) || 0), 0);
    const weekWorkoutCount = new Set((workoutWeek.data ?? []).map((x: any) => x.date)).size;
    const alerts: any[] = [];
    if (h?.weight == null) alerts.push(["体重未入力", "health"]);
    if (h?.body_fat == null) alerts.push(["体脂肪未入力", "health"]);
    if ((h?.water_ml ?? 0) < Number(settings.data?.water_target_ml ?? 2000)) alerts.push(["水分目標未達", "health"]);
    if (todayStudyMinutes <= 0) alerts.push(["勉強時間未入力", "study"]);
    if (dow === 0 && !weekly.data) alerts.push(["週次レビュー未完了", "weeklyReview"]);
    if (dow === 0 && (outputReviews.data ?? []).length === 0) alerts.push(["AIレビュー未実施", "outputs"]);
    setData({ checklist, alerts, completionRate, kpi: { avgWeight: avg(weekHealthRows.map((x: any) => x.weight)), avgBodyFat: avg(weekHealthRows.map((x: any) => x.body_fat)), study: weekStudyMinutes, workout: weekWorkoutCount, outputs: outputs.data?.length ?? 0 }, weekly: weekly.data, aiDone: (outputReviews.data ?? []).length > 0 });
  }

  useEffect(() => { load().catch((e) => setMsg({ type: "error", text: e.message })); }, []);

  async function toggleItem(item: any) {
    if (item.type === "navigate") { onGo(item.tab); return; }
    try {
      setSavingKey(item.key);
      const uid = await userId();
      if (item.type === "routine") {
        await upsert("routine_logs", { user_id: uid, template_id: item.template.id, date: today, is_done: !item.done, done_at: !item.done ? new Date().toISOString() : null, updated_at: new Date().toISOString() }, "user_id,template_id,date");
      }
      if (item.type === "grooming") {
        const { data: old, error: oldError } = await supabase.from("grooming_logs").select("*").eq("user_id", uid).eq("date", today).eq("category", item.template.category).eq("item_name", item.template.item_name).maybeSingle();
        if (oldError) throw new Error(oldError.message);
        if (old?.id) { const { error } = await supabase.from("grooming_logs").update({ is_done: !old.is_done, memo: null }).eq("id", old.id); if (error) throw new Error(error.message); }
        else { await insert("grooming_logs", { user_id: uid, date: today, category: item.template.category, item_name: item.template.item_name, is_done: true }); }
      }
      if (item.type === "household") {
        const { data: old, error: oldError } = await supabase.from("household_logs").select("*").eq("user_id", uid).eq("date", today).eq("task_name", item.template.task_name).maybeSingle();
        if (oldError) throw new Error(oldError.message);
        if (old?.id) { const { error } = await supabase.from("household_logs").update({ is_done: !old.is_done, updated_at: new Date().toISOString() }).eq("id", old.id); if (error) throw new Error(error.message); }
        else { await insert("household_logs", { user_id: uid, date: today, task_name: item.template.task_name, is_done: true, memo: item.template.memo ?? "" }); }
      }
      if (item.type === "interpersonal") {
        const base = { user_id: uid, date: today, led_action_done: false, empathy_done: false, opinion_done: false, memo: "" } as any;
        const { data: old, error: oldError } = await supabase.from("interpersonal_logs").select("*").eq("user_id", uid).eq("date", today).maybeSingle();
        if (oldError) throw new Error(oldError.message);
        await upsert("interpersonal_logs", { ...base, ...(old ?? {}), [item.field]: !item.done }, "user_id,date");
      }
      setMsg({ type: "ok", text: "ダッシュボードから更新しました。" });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "更新に失敗しました。" });
    } finally { setSavingKey(null); }
  }

  if (!data) return <Card><Message msg={msg}/><div className="text-slate-500">ダッシュボードを読み込み中...</div></Card>;
  return <div className="space-y-6"><Message msg={msg}/><Card><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><div className="text-sm font-semibold text-sky-700">{today}（{dayLabels[dow]}）</div><h2 className="mt-2 text-3xl font-black">今日の司令塔</h2><p className="mt-2 text-sm text-slate-500">各タブで作った今日の項目を集約します。完了できるものはこの画面から直接切り替えできます。</p></div><div className="rounded-3xl bg-slate-50 px-5 py-4 text-center"><div className="text-xs font-semibold text-slate-500">今日の完了率</div><div className="mt-1 text-3xl font-black text-slate-900">{data.completionRate}%</div></div></div><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => onGo("settings")} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold hover:bg-slate-200">ルール</button><button onClick={() => onGo("health")} className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500">今日の入力</button><button onClick={() => onGo("routine")} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold hover:bg-slate-200">ルーティン管理</button></div></Card><Card><H2>今日の予定</H2><div className="mt-4 grid gap-2 md:grid-cols-4">{weeklyPlan[dow].map((x) => <div key={x} className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold">{x}</div>)}</div></Card><Card><H2>今日のチェックリスト</H2><p className="mt-2 text-sm text-slate-500">朝・昼・夜・清潔・家事・対人・健康・学習/成果をまとめています。</p><div className="mt-5 space-y-5">{data.checklist.map((section: any) => <div key={section.section}><h3 className="mb-2 text-sm font-bold text-slate-600">{section.section}</h3>{section.items.length === 0 ? <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500">項目がありません。</div> : <div className="space-y-2">{section.items.map((item: any) => <button key={item.key} type="button" onClick={() => toggleItem(item)} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left hover:bg-slate-50"><span className="font-semibold text-slate-800">{item.label}</span><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${item.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{savingKey === item.key ? "保存中" : item.done ? "完了" : "未"}</span></button>)}</div>}</div>)}</div></Card><div className="grid gap-4 md:grid-cols-5"><Card><div className="text-xs text-slate-500">平均体重</div><div className="text-2xl font-black">{data.kpi.avgWeight?.toFixed(1) ?? "-"}kg</div></Card><Card><div className="text-xs text-slate-500">平均体脂肪</div><div className="text-2xl font-black">{data.kpi.avgBodyFat?.toFixed(1) ?? "-"}%</div></Card><Card><div className="text-xs text-slate-500">勉強</div><div className="text-2xl font-black">{data.kpi.study}分</div></Card><Card><div className="text-xs text-slate-500">筋トレ</div><div className="text-2xl font-black">{data.kpi.workout}回</div></Card><Card><div className="text-xs text-slate-500">成果物</div><div className="text-2xl font-black">{data.kpi.outputs}個</div></Card></div>{data.alerts.length > 0 && <Card><H2>記録漏れアラート</H2><div className="mt-4 space-y-2">{data.alerts.map((a: any) => <button key={a[0]} onClick={() => onGo(a[1])} className="block w-full rounded-2xl bg-yellow-50 p-3 text-left text-sm font-semibold text-yellow-800 hover:bg-yellow-100">{a[0]}</button>)}</div></Card>}{dow === 0 && <Card className="border-blue-200 bg-blue-50"><H2>日曜レビュー</H2><div className="mt-3 text-sm">週次レビュー：{data.weekly ? "完了" : "未完了"} / AIレビュー：{data.aiDone ? "完了" : "未実施"}</div><button onClick={() => onGo("weeklyReview")} className="mt-4 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500">週次レビューへ</button></Card>}</div>;
}
