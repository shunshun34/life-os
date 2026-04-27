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
  const [summary, setSummary] = useState({ avgWeight: null as number | null, avgBodyFat: null as number | null, sleepRate: 0, waterRate: 0 });
  const [msg, setMsg] = useState<Msg>(null);
  const today = todayISO();
  async function load() {
    const uid = await userId();
    const weekStart = weekStartISO();
    const [{ data: todayLog }, { data: weekLogsData }] = await Promise.all([
      supabase.from("health_logs").select("*").eq("user_id", uid).eq("date", today).maybeSingle(),
      supabase.from("health_logs").select("*").eq("user_id", uid).gte("date", weekStart).lte("date", today).order("date", { ascending: true }),
    ]);
    setLog(todayLog);
    const logs = weekLogsData ?? [];
    setWeekLogs(logs);
    const avg = (arr: any[]) => { const valid = arr.filter((v) => v !== null && v !== undefined && !Number.isNaN(Number(v))).map(Number); return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null; };
    setSummary({ avgWeight: avg(logs.map((l) => l.weight)), avgBodyFat: avg(logs.map((l) => l.body_fat)), waterRate: logs.length ? Math.round((logs.filter((l) => (l.water_ml ?? 0) >= 2000).length / logs.length) * 100) : 0, sleepRate: logs.length ? Math.round((logs.filter((l) => (l.sleep_hours ?? 0) >= 7).length / logs.length) * 100) : 0 });
  }
  useEffect(() => { load().catch((e) => setMsg({ type: "error", text: e.message })); }, []);
  async function save(formData: FormData) { try { const uid = await userId(); await upsert("health_logs", { user_id: uid, date: today, weight: num(formData.get("weight")), body_fat: num(formData.get("body_fat")), water_ml: num(formData.get("water_ml")), sleep_hours: num(formData.get("sleep_hours")), no_phone_before_bed: formData.get("no_phone_before_bed") === "on", bowel_movement: formData.get("bowel_movement") === "on", condition_memo: String(formData.get("condition_memo") || ""), updated_at: new Date().toISOString() }, "user_id,date"); setMsg({ type: "ok", text: "健康ログを保存しました。" }); await load(); } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" }); } }
  const weightPoints = weekLogs.map((l) => ({ date: l.date, value: l.weight == null ? null : Number(l.weight) }));
  const bodyFatPoints = weekLogs.map((l) => ({ date: l.date, value: l.body_fat == null ? null : Number(l.body_fat) }));
  return <div className="space-y-6"><Message msg={msg} /><div className="grid gap-4 md:grid-cols-4"><Card><div className="text-sm text-slate-500">週平均体重</div><div className="mt-2 text-2xl font-black">{summary.avgWeight?.toFixed(1) ?? "-"}kg</div></Card><Card><div className="text-sm text-slate-500">週平均体脂肪</div><div className="mt-2 text-2xl font-black">{summary.avgBodyFat?.toFixed(1) ?? "-"}%</div></Card><Card><div className="text-sm text-slate-500">水分達成率</div><div className="mt-2 text-2xl font-black">{summary.waterRate}%</div></Card><Card><div className="text-sm text-slate-500">睡眠達成率</div><div className="mt-2 text-2xl font-black">{summary.sleepRate}%</div></Card></div><div className="grid gap-4 xl:grid-cols-2"><MiniLineChart title="体重推移" unit="kg" points={weightPoints} /><MiniLineChart title="体脂肪推移" unit="%" points={bodyFatPoints} /></div><Card><H2>今日の健康入力</H2><form action={save} className="mt-5 grid gap-4 md:grid-cols-2"><Input label="体重" name="weight" type="number" defaultValue={log?.weight} placeholder="kg" /><Input label="体脂肪" name="body_fat" type="number" defaultValue={log?.body_fat} placeholder="%" /><Input label="水分摂取量" name="water_ml" type="number" defaultValue={log?.water_ml} placeholder="ml" /><Input label="睡眠時間" name="sleep_hours" type="number" defaultValue={log?.sleep_hours} placeholder="時間" /><label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"><input type="checkbox" name="bowel_movement" defaultChecked={!!log?.bowel_movement} />便通あり</label><label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"><input type="checkbox" name="no_phone_before_bed" defaultChecked={!!log?.no_phone_before_bed} />寝る30分前スマホ禁止</label><div className="md:col-span-2"><Textarea label="体調メモ" name="condition_memo" defaultValue={log?.condition_memo} /></div><div className="md:col-span-2"><Btn>保存</Btn></div></form></Card></div>;
}

export function RoutineV5Section() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [msg, setMsg] = useState<Msg>(null);
  const today = todayISO();

  async function load() {
    const uid = await userId();
    const dow = dayOfWeek();
    const [{ data: t }, { data: l }] = await Promise.all([
      supabase.from("routine_templates").select("*").eq("user_id", uid).eq("is_active", true).or(`day_of_week.is.null,day_of_week.eq.${dow}`).order("display_order"),
      supabase.from("routine_logs").select("*").eq("user_id", uid).eq("date", today),
    ]);
    setTemplates(t ?? []); setLogs(l ?? []);
  }
  useEffect(() => { load().catch((e) => setMsg({ type: "error", text: e.message })); }, []);

  async function add(formData: FormData) {
    try {
      const uid = await userId();
      await insert("routine_templates", {
        user_id: uid,
        category: String(formData.get("category")),
        title: String(formData.get("title")),
        description: String(formData.get("description") || ""),
        day_of_week: num(formData.get("day_of_week")),
        estimated_minutes: num(formData.get("estimated_minutes")),
        display_order: num(formData.get("display_order")) ?? 0,
        is_active: true,
      });
      setMsg({ type: "ok", text: "ルーティンを追加しました。" }); await load();
    } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "追加に失敗しました。" }); }
  }
  async function toggle(t: any) {
    try {
      const uid = await userId();
      const old = logs.find((l) => l.template_id === t.id);
      await upsert("routine_logs", { user_id: uid, template_id: t.id, date: today, is_done: !old?.is_done, done_at: !old?.is_done ? new Date().toISOString() : null, updated_at: new Date().toISOString() }, "user_id,template_id,date");
      await load();
    } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" }); }
  }

  const groups = [["morning","朝"],["noon","昼"],["night","夜"],["weekly_fixed","曜日別"]];
  return <div className="space-y-6">
    <Message msg={msg} />
    <Card>
      <H2>ルーティン追加</H2>
      <form action={add} className="mt-5 grid gap-4 md:grid-cols-3">
        <Select label="カテゴリ" name="category"><option value="morning">朝</option><option value="noon">昼</option><option value="night">夜</option><option value="weekly_fixed">曜日別</option></Select>
        <Input label="タスク名" name="title" />
        <Input label="所要時間" name="estimated_minutes" type="number" />
        <Input label="曜日 0=日〜6=土（空欄で毎日）" name="day_of_week" type="number" />
        <Input label="表示順" name="display_order" type="number" />
        <Input label="メモ" name="description" />
        <div className="md:col-span-3"><Btn>追加</Btn></div>
      </form>
    </Card>
    {groups.map(([key, label]) => <Card key={key}>
      <H2>{label}</H2>
      <div className="mt-4 space-y-3">
        {templates.filter((t)=>t.category===key).map((t) => {
          const done = !!logs.find((l)=>l.template_id===t.id)?.is_done;
          return <button key={t.id} onClick={() => toggle(t)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-4 text-left">
            <div><div className="font-bold">{t.title}</div><div className="text-sm text-slate-500">{t.description}</div></div>
            <span className={`rounded-full px-3 py-1 text-xs ${done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{done ? "完了" : "未"}</span>
          </button>;
        })}
        {templates.filter((t)=>t.category===key).length === 0 && <div className="text-sm text-slate-500">項目がありません。</div>}
      </div>
    </Card>)}
  </div>;
}

export function CleanlinessV5Section() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [msg, setMsg] = useState<Msg>(null);
  const today = todayISO();
  async function load() {
    const uid = await userId(); const dow = dayOfWeek();
    const [{ data: t }, { data: l }] = await Promise.all([
      supabase.from("grooming_templates").select("*").eq("user_id", uid).eq("is_active", true).or(`day_of_week.is.null,day_of_week.eq.${dow}`).order("display_order"),
      supabase.from("grooming_logs").select("*").eq("user_id", uid).eq("date", today),
    ]);
    setTemplates(t ?? []); setLogs(l ?? []);
  }
  useEffect(()=>{load().catch(e=>setMsg({type:"error", text:e.message}))},[]);
  async function add(formData: FormData) {
    try {
      const uid = await userId();
      await insert("grooming_templates", { user_id: uid, category: String(formData.get("category")), item_name: String(formData.get("item_name")), day_of_week: num(formData.get("day_of_week")), display_order: num(formData.get("display_order")) ?? 0, is_active: true });
      setMsg({type:"ok", text:"清潔項目を追加しました。"}); await load();
    } catch(e){setMsg({type:"error", text:e instanceof Error?e.message:"追加に失敗しました。"})}
  }
  async function toggle(t:any) {
    try {
      const uid = await userId(); const old = logs.find(l=>l.category===t.category && l.item_name===t.item_name);
      if (old?.id) await supabase.from("grooming_logs").update({is_done: !old.is_done, memo:null}).eq("id", old.id);
      else await insert("grooming_logs", {user_id:uid,date:today,category:t.category,item_name:t.item_name,is_done:true});
      await load();
    } catch(e){setMsg({type:"error", text:e instanceof Error?e.message:"保存に失敗しました。"})}
  }
  const groups=[["morning","朝ケア"],["night","夜ケア"],["weekly","週次ケア"],["recovery","リカバリ"]];
  return <div className="space-y-6"><Message msg={msg}/>
    <Card><H2>清潔項目追加</H2><form action={add} className="mt-5 grid gap-4 md:grid-cols-3">
      <Select label="カテゴリ" name="category"><option value="morning">朝ケア</option><option value="night">夜ケア</option><option value="weekly">週次ケア</option></Select>
      <Input label="チェック項目" name="item_name"/><Input label="曜日（任意）" name="day_of_week" type="number"/><Input label="表示順" name="display_order" type="number"/>
      <div className="md:col-span-3"><Btn>追加</Btn></div>
    </form></Card>
    {groups.map(([key,label])=><Card key={key}><H2>{label}</H2><div className="mt-4 space-y-3">
      {templates.filter(t=>t.category===key).map(t=>{const old=logs.find(l=>l.category===t.category&&l.item_name===t.item_name); const done=!!old?.is_done; return <button key={t.id} onClick={()=>toggle(t)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-4 text-left"><span className="font-bold">{t.item_name}</span><span className={`rounded-full px-3 py-1 text-xs ${done?"bg-emerald-100 text-emerald-700":"bg-slate-100 text-slate-600"}`}>{done?"完了":"未"}</span></button>})}
      {templates.filter(t=>t.category===key).length===0 && <div className="text-sm text-slate-500">項目がありません。</div>}
    </div></Card>)}
  </div>
}

export function HouseholdV5Section() {
  const [templates,setTemplates]=useState<any[]>([]); const [logs,setLogs]=useState<any[]>([]); const [msg,setMsg]=useState<Msg>(null); const today=todayISO();
  async function load(){const uid=await userId(); const dow=dayOfWeek(); const [{data:t},{data:l}]=await Promise.all([supabase.from("household_templates").select("*").eq("user_id",uid).eq("is_active",true).eq("day_of_week",dow).order("display_order"), supabase.from("household_logs").select("*").eq("user_id",uid).eq("date",today)]); setTemplates(t??[]); setLogs(l??[]);}
  useEffect(()=>{load().catch(e=>setMsg({type:"error",text:e.message}))},[]);
  async function add(fd:FormData){try{const uid=await userId(); await insert("household_templates",{user_id:uid,task_name:String(fd.get("task_name")),day_of_week:Number(fd.get("day_of_week")),display_order:num(fd.get("display_order"))??0,memo:String(fd.get("memo")||""),is_active:true}); setMsg({type:"ok",text:"家事を追加しました。"}); await load();}catch(e){setMsg({type:"error",text:e instanceof Error?e.message:"追加に失敗しました。"})}}
  async function toggle(t:any){try{const uid=await userId(); const old=logs.find(l=>l.task_name===t.task_name); if(old?.id) await supabase.from("household_logs").update({is_done:!old.is_done,updated_at:new Date().toISOString()}).eq("id",old.id); else await insert("household_logs",{user_id:uid,date:today,task_name:t.task_name,is_done:true,memo:t.memo}); await load();}catch(e){setMsg({type:"error",text:e instanceof Error?e.message:"保存に失敗しました。"})}}
  return <div className="space-y-6"><Message msg={msg}/><Card><H2>家事テンプレ追加</H2><form action={add} className="mt-5 grid gap-4 md:grid-cols-3"><Input label="タスク名" name="task_name"/><Select label="曜日" name="day_of_week">{dayLabels.map((d,i)=><option key={i} value={i}>{d}</option>)}</Select><Input label="表示順" name="display_order" type="number"/><Input label="メモ" name="memo"/><div className="md:col-span-3"><Btn>追加</Btn></div></form></Card><Card><H2>今日の家事（{dayLabels[dayOfWeek()]}）</H2><div className="mt-4 space-y-3">{templates.map(t=>{const done=!!logs.find(l=>l.task_name===t.task_name)?.is_done; return <button key={t.id} onClick={()=>toggle(t)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-4 text-left"><div><div className="font-bold">{t.task_name}</div><div className="text-sm text-slate-500">{t.memo}</div></div><span className={`rounded-full px-3 py-1 text-xs ${done?"bg-emerald-100 text-emerald-700":"bg-slate-100 text-slate-600"}`}>{done?"完了":"未"}</span></button>})}{templates.length===0&&<div className="text-sm text-slate-500">今日の家事はありません。</div>}</div></Card></div>
}

export function StudyV5Section() {
  const [logs,setLogs]=useState<any[]>([]); const [settings,setSettings]=useState<any[]>([]); const [weekly,setWeekly]=useState(0); const [msg,setMsg]=useState<Msg>(null); const today=todayISO();
  async function load(){const uid=await userId(); const ws=weekStartISO(); const dow=dayOfWeek(); const [{data:l},{data:w},{data:s}]=await Promise.all([supabase.from("study_logs").select("*").eq("user_id",uid).eq("date",today).order("created_at",{ascending:false}),supabase.from("study_logs").select("*").eq("user_id",uid).gte("date",ws).lte("date",today),supabase.from("study_settings").select("*").eq("user_id",uid).eq("is_active",true).eq("day_of_week",dow)]); setLogs(l??[]); setSettings(s??[]); setWeekly((w??[]).reduce((sum,x)=>sum+(x.minutes??0),0));}
  useEffect(()=>{load().catch(e=>setMsg({type:"error",text:e.message}))},[]);
  async function save(fd:FormData){try{const uid=await userId(); await insert("study_logs",{user_id:uid,date:today,category:String(fd.get("category")),minutes:num(fd.get("minutes"))??0,content:String(fd.get("content")||""),focus_score:num(fd.get("focus_score")),understanding_score:num(fd.get("understanding_score")),memo:String(fd.get("memo")||"")}); setMsg({type:"ok",text:"勉強ログを保存しました。"}); await load();}catch(e){setMsg({type:"error",text:e instanceof Error?e.message:"保存に失敗しました。"})}}
  async function addSetting(fd:FormData){try{const uid=await userId(); await insert("study_settings",{user_id:uid,category:String(fd.get("category")),day_of_week:Number(fd.get("day_of_week")),target_minutes:num(fd.get("target_minutes"))??0,content_template:String(fd.get("content_template")||""),is_active:true}); setMsg({type:"ok",text:"勉強設定を追加しました。"}); await load();}catch(e){setMsg({type:"error",text:e instanceof Error?e.message:"追加に失敗しました。"})}}
  return <div className="space-y-6"><Message msg={msg}/><div className="grid gap-4 md:grid-cols-2"><Card><div className="text-sm text-slate-500">今週累計</div><div className="mt-2 text-3xl font-black">{weekly}分</div></Card><Card><div className="text-sm text-slate-500">今日の目標</div><div className="mt-2 space-y-1 text-sm">{settings.length?settings.map(s=><div key={s.id}>{s.category}：{s.target_minutes}分 {s.content_template}</div>):"未設定"}</div></Card></div><Card><H2>今日の勉強記録</H2><form action={save} className="mt-5 grid gap-4 md:grid-cols-2"><Select label="カテゴリ" name="category"><option>情報資格</option><option>英語</option><option>面接</option><option>その他</option></Select><Input label="勉強時間（分）" name="minutes" type="number"/><Input label="何をやったか" name="content"/><Select label="集中度" name="focus_score"><option>3</option><option>1</option><option>2</option><option>4</option><option>5</option></Select><Select label="理解度" name="understanding_score"><option>3</option><option>1</option><option>2</option><option>4</option><option>5</option></Select><Input label="メモ" name="memo"/><div className="md:col-span-2"><Btn>保存</Btn></div></form></Card><Card><H2>勉強設定追加</H2><form action={addSetting} className="mt-5 grid gap-4 md:grid-cols-2"><Select label="カテゴリ" name="category"><option>情報資格</option><option>英語</option><option>面接</option><option>その他</option></Select><Select label="曜日" name="day_of_week">{dayLabels.map((d,i)=><option key={i} value={i}>{d}</option>)}</Select><Input label="目標時間（分）" name="target_minutes" type="number"/><Input label="内容テンプレ" name="content_template"/><div className="md:col-span-2"><Btn>設定追加</Btn></div></form></Card><Card><H2>今日の記録</H2><div className="mt-4 space-y-3">{logs.map(l=><div key={l.id} className="rounded-2xl bg-slate-50 p-4"><div className="font-bold">{l.category}：{l.minutes}分</div><div className="text-sm text-slate-600">{l.content}</div></div>)}{logs.length===0&&<div className="text-sm text-slate-500">まだ記録がありません。</div>}</div></Card></div>
}

export function InterpersonalV5Section() {
  const [log,setLog]=useState<any>(null); const [counts,setCounts]=useState({led:0,emp:0,op:0}); const [msg,setMsg]=useState<Msg>(null); const today=todayISO();
  async function load(){const uid=await userId(); const ws=weekStartISO(); const [{data:t},{data:w}]=await Promise.all([supabase.from("interpersonal_logs").select("*").eq("user_id",uid).eq("date",today).maybeSingle(),supabase.from("interpersonal_logs").select("*").eq("user_id",uid).gte("date",ws).lte("date",today)]); setLog(t); setCounts({led:(w??[]).filter(x=>x.led_action_done).length,emp:(w??[]).filter(x=>x.empathy_done).length,op:(w??[]).filter(x=>x.opinion_done).length});}
  useEffect(()=>{load().catch(e=>setMsg({type:"error",text:e.message}))},[]);
  async function save(fd:FormData){try{const uid=await userId(); await upsert("interpersonal_logs",{user_id:uid,date:today,led_action_done:fd.get("led_action_done")==="on",empathy_done:fd.get("empathy_done")==="on",opinion_done:fd.get("opinion_done")==="on",memo:String(fd.get("memo")||"")},"user_id,date"); setMsg({type:"ok",text:"対人ログを保存しました。"}); await load();}catch(e){setMsg({type:"error",text:e instanceof Error?e.message:"保存に失敗しました。"})}}
  return <div className="space-y-6"><Message msg={msg}/><div className="grid gap-4 md:grid-cols-3"><Card><div className="text-sm text-slate-500">主導</div><div className="text-3xl font-black">{counts.led}</div></Card><Card><div className="text-sm text-slate-500">共感</div><div className="text-3xl font-black">{counts.emp}</div></Card><Card><div className="text-sm text-slate-500">意見</div><div className="text-3xl font-black">{counts.op}</div></Card></div><Card><H2>対人テンプレ</H2><div className="mt-4 space-y-3 text-sm"><div className="rounded-2xl bg-slate-50 p-4">俺はこう思う → なぜなら → どう思う？ → じゃあこうしよう</div><div className="rounded-2xl bg-slate-50 p-4">共感：それって〇〇ってこと？</div><div className="rounded-2xl bg-slate-50 p-4">決断：3秒仮決断。迷ったらA。後で修正OK。</div></div></Card><Card><H2>今日の対人ログ</H2><form action={save} className="mt-5 space-y-4"><label className="flex gap-3"><input type="checkbox" name="led_action_done" defaultChecked={!!log?.led_action_done}/>主導1アクション</label><label className="flex gap-3"><input type="checkbox" name="empathy_done" defaultChecked={!!log?.empathy_done}/>共感1回</label><label className="flex gap-3"><input type="checkbox" name="opinion_done" defaultChecked={!!log?.opinion_done}/>自分の意見</label><Textarea label="メモ" name="memo" defaultValue={log?.memo}/><Btn>保存</Btn></form></Card></div>
}

export function WorkoutV5Section() {
  const [plans, setPlans] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [weekCount, setWeekCount] = useState(0);
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(null);
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const today = todayISO();

  async function load() {
    const uid = await userId();
    const dow = dayOfWeek();
    const ws = weekStartISO();
    const [{ data: todayPlans }, { data: allPlans }, { data: todayLogs }, { data: weekLogs }, { data: allLogs }] = await Promise.all([
      supabase.from("workout_plans").select("*").eq("user_id", uid).eq("day_of_week", dow),
      supabase.from("workout_plans").select("*").eq("user_id", uid).order("day_of_week"),
      supabase.from("workout_logs").select("*").eq("user_id", uid).eq("date", today),
      supabase.from("workout_logs").select("date").eq("user_id", uid).gte("date", ws).lte("date", today),
      supabase.from("workout_logs").select("*").eq("user_id", uid).order("date", { ascending: false }).limit(80),
    ]);
    const ps = allPlans ?? [];
    setPlans(ps);
    setLogs(todayLogs ?? []);
    setHistory(allLogs ?? []);
    setWeekCount(new Set((weekLogs ?? []).map((x) => x.date)).size);
    const todayPlan = (todayPlans ?? [])[0];
    if (todayPlan) {
      const { data: planItems } = await supabase.from("workout_plan_items").select("*").eq("plan_id", todayPlan.id).order("display_order");
      setItems(planItems ?? []);
    } else setItems([]);
  }
  useEffect(() => { load().catch((e) => setMsg({ type: "error", text: e.message })); }, []);

  const todayPlan = plans.find((p) => p.day_of_week === dayOfWeek());
  const todayLogMap = new Map(logs.map((l) => [l.exercise_name, l]));
  const totalVolume = (log: any) => Number(log?.weight ?? 0) * Number(log?.reps ?? 0) * Number(log?.sets ?? 0);
  const lastLogFor = (name: string) => history.find((l) => l.exercise_name === name && l.date !== today);

  async function addPlan(fd: FormData) { try { const uid = await userId(); await insert("workout_plans", { user_id: uid, name: String(fd.get("name")), day_of_week: Number(fd.get("day_of_week")), estimated_minutes: num(fd.get("estimated_minutes")), memo: String(fd.get("memo") || "") }); setMsg({ type: "ok", text: "メニューを作成しました。" }); setShowNewPlan(false); await load(); } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "作成に失敗しました。" }); } }
  async function updatePlan(fd: FormData, id: string) { try { const { error } = await supabase.from("workout_plans").update({ name: String(fd.get("name")), day_of_week: Number(fd.get("day_of_week")), estimated_minutes: num(fd.get("estimated_minutes")), memo: String(fd.get("memo") || "") }).eq("id", id); if (error) throw new Error(error.message); setMsg({ type: "ok", text: "メニューを更新しました。" }); await load(); } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "更新に失敗しました。" }); } }
  async function deletePlan(id: string) { if (!confirm("このメニューを削除しますか？")) return; try { const { error } = await supabase.from("workout_plans").delete().eq("id", id); if (error) throw new Error(error.message); setMsg({ type: "ok", text: "メニューを削除しました。" }); await load(); } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "削除に失敗しました。" }); } }
  async function addItem(fd: FormData) { try { await insert("workout_plan_items", { plan_id: String(fd.get("plan_id")), exercise_name: String(fd.get("exercise_name")), body_part: String(fd.get("body_part") || ""), default_weight: num(fd.get("default_weight")), default_reps: num(fd.get("default_reps")), default_sets: num(fd.get("default_sets")), display_order: num(fd.get("display_order")) ?? 0 }); setMsg({ type: "ok", text: "種目を追加しました。" }); setShowNewItem(false); await load(); } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "追加に失敗しました。" }); } }
  async function updateItem(fd: FormData, id: string) { try { const { error } = await supabase.from("workout_plan_items").update({ exercise_name: String(fd.get("exercise_name")), body_part: String(fd.get("body_part") || ""), default_weight: num(fd.get("default_weight")), default_reps: num(fd.get("default_reps")), default_sets: num(fd.get("default_sets")), display_order: num(fd.get("display_order")) ?? 0 }).eq("id", id); if (error) throw new Error(error.message); setMsg({ type: "ok", text: "種目を更新しました。" }); await load(); } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "更新に失敗しました。" }); } }
  async function deleteItem(id: string) { if (!confirm("この種目を削除しますか？")) return; try { const { error } = await supabase.from("workout_plan_items").delete().eq("id", id); if (error) throw new Error(error.message); setMsg({ type: "ok", text: "種目を削除しました。" }); await load(); } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "削除に失敗しました。" }); } }
  async function saveLog(fd: FormData, item: any) { try { const uid = await userId(); const existing = todayLogMap.get(item.exercise_name); const payload = { user_id: uid, date: today, plan_id: todayPlan?.id, exercise_name: item.exercise_name, weight: num(fd.get("weight")), reps: num(fd.get("reps")), sets: num(fd.get("sets")), cardio_minutes: num(fd.get("cardio_minutes")), memo: String(fd.get("memo") || "") }; if (existing?.id) { const { error } = await supabase.from("workout_logs").update(payload).eq("id", existing.id); if (error) throw new Error(error.message); } else await insert("workout_logs", payload); setMsg({ type: "ok", text: "筋トレ記録を保存しました。" }); await load(); } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" }); } }
  async function deleteLog(id: string) { if (!confirm("今日の記録を削除しますか？")) return; try { const { error } = await supabase.from("workout_logs").delete().eq("id", id); if (error) throw new Error(error.message); setMsg({ type: "ok", text: "記録を削除しました。" }); await load(); } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "削除に失敗しました。" }); } }

  return <div className="space-y-6"><Message msg={msg}/><div className="grid gap-4 md:grid-cols-3"><Card><div className="text-sm text-slate-500">今週の実施回数</div><div className="text-3xl font-black">{weekCount}回</div></Card><Card><div className="text-sm text-slate-500">今日のメニュー</div><div className="mt-2 text-xl font-black">{todayPlan?.name ?? "未設定"}</div></Card><Card><div className="text-sm text-slate-500">今日の種目数</div><div className="mt-2 text-3xl font-black">{items.length}</div></Card></div><Card><H2>今日の筋トレ（{dayLabels[dayOfWeek()]}）</H2><p className="mt-2 text-sm text-slate-500">種目名をタップすると、記録・前回比較・履歴が開きます。</p><div className="mt-4 space-y-3">{items.map((item)=>{const open=openExerciseId===item.id; const current=todayLogMap.get(item.exercise_name); const prev=lastLogFor(item.exercise_name); const diff=current&&prev ? Number(current.weight??0)-Number(prev.weight??0) : null; return <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><button type="button" onClick={()=>setOpenExerciseId(open?null:item.id)} className="flex w-full items-center justify-between p-4 text-left"><div><div className="font-bold">{item.exercise_name}</div><div className="text-xs text-slate-500">{item.body_part || "部位未設定"}{current ? " / 今日記録済み" : ""}</div></div><span className="text-sm font-semibold text-sky-700">{open?"閉じる":"開く"}</span></button>{open&&<div className="border-t bg-slate-50 p-4"><div className="mb-4 grid gap-3 md:grid-cols-3"><div className="rounded-2xl bg-white p-3 text-sm"><div className="text-slate-500">前回</div><div className="font-bold">{prev ? `${prev.weight??"-"}kg × ${prev.reps??"-"}回 × ${prev.sets??"-"}set` : "記録なし"}</div></div><div className="rounded-2xl bg-white p-3 text-sm"><div className="text-slate-500">今回総負荷</div><div className="font-bold">{current ? `${totalVolume(current)}kg` : "未記録"}</div></div><div className="rounded-2xl bg-white p-3 text-sm"><div className="text-slate-500">前回比</div><div className="font-bold">{diff!==null ? `${diff>=0?"+":""}${diff}kg` : "-"}</div></div></div><form action={(fd)=>saveLog(fd,item)} className="grid gap-3 md:grid-cols-4"><Input label="重量" name="weight" type="number" defaultValue={current?.weight ?? item.default_weight}/><Input label="回数" name="reps" type="number" defaultValue={current?.reps ?? item.default_reps}/><Input label="セット" name="sets" type="number" defaultValue={current?.sets ?? item.default_sets}/><Input label="有酸素分" name="cardio_minutes" type="number" defaultValue={current?.cardio_minutes}/><div className="md:col-span-4"><Input label="一言ログ" name="memo" defaultValue={current?.memo}/></div><div className="flex flex-wrap gap-2 md:col-span-4"><Btn>{current?"記録を更新":"記録"}</Btn>{current?.id&&<button type="button" onClick={()=>deleteLog(current.id)} className="rounded-2xl bg-rose-100 px-5 py-3 font-semibold text-rose-700">記録削除</button>}</div></form><div className="mt-4 rounded-2xl bg-white p-3 text-sm"><div className="font-bold">直近履歴</div><div className="mt-2 space-y-1">{history.filter(h=>h.exercise_name===item.exercise_name).slice(0,5).map(h=><div key={h.id}>{h.date}：{h.weight??"-"}kg × {h.reps??"-"}回 × {h.sets??"-"}set / 総負荷 {totalVolume(h)}kg</div>)}{history.filter(h=>h.exercise_name===item.exercise_name).length===0&&<div className="text-slate-500">まだ履歴がありません。</div>}</div></div></div>}</div>})}{items.length===0&&<div className="text-sm text-slate-500">今日の種目がありません。</div>}</div></Card><Card><div className="flex items-center justify-between gap-3"><H2>メニュー管理</H2><button type="button" onClick={()=>setShowNewPlan(!showNewPlan)} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">＋メニュー作成</button></div>{showNewPlan&&<form action={addPlan} className="mt-5 grid gap-4 md:grid-cols-3"><Input label="メニュー名" name="name"/><Select label="曜日" name="day_of_week">{dayLabels.map((d,i)=><option key={i} value={i}>{d}</option>)}</Select><Input label="所要時間" name="estimated_minutes" type="number"/><Input label="メモ" name="memo"/><div className="md:col-span-3"><Btn>作成</Btn></div></form>}<div className="mt-4 space-y-3">{plans.map(plan=>{const open=openPlanId===plan.id; return <div key={plan.id} className="rounded-2xl border"><button type="button" onClick={()=>setOpenPlanId(open?null:plan.id)} className="flex w-full items-center justify-between p-4 text-left"><div className="font-bold">{dayLabels[plan.day_of_week]}曜：{plan.name}</div><span className="text-sm text-sky-700">{open?"閉じる":"編集"}</span></button>{open&&<form action={(fd)=>updatePlan(fd,plan.id)} className="grid gap-3 border-t bg-slate-50 p-4 md:grid-cols-3"><Input label="メニュー名" name="name" defaultValue={plan.name}/><Select label="曜日" name="day_of_week" defaultValue={plan.day_of_week}>{dayLabels.map((d,i)=><option key={i} value={i}>{d}</option>)}</Select><Input label="所要時間" name="estimated_minutes" type="number" defaultValue={plan.estimated_minutes}/><Input label="メモ" name="memo" defaultValue={plan.memo}/><div className="flex gap-2 md:col-span-3"><Btn>編集</Btn><button type="button" onClick={()=>deletePlan(plan.id)} className="rounded-2xl bg-rose-100 px-5 py-3 font-semibold text-rose-700">削除</button></div></form>}</div>})}</div></Card><Card><div className="flex items-center justify-between gap-3"><H2>種目管理</H2><button type="button" onClick={()=>setShowNewItem(!showNewItem)} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">＋種目追加</button></div>{showNewItem&&<form action={addItem} className="mt-5 grid gap-4 md:grid-cols-3"><Select label="メニュー" name="plan_id">{plans.map(p=><option key={p.id} value={p.id}>{dayLabels[p.day_of_week]}：{p.name}</option>)}</Select><Input label="種目名" name="exercise_name"/><Input label="部位" name="body_part"/><Input label="重量目標" name="default_weight" type="number"/><Input label="回数目標" name="default_reps" type="number"/><Input label="セット目標" name="default_sets" type="number"/><Input label="表示順" name="display_order" type="number"/><div className="md:col-span-3"><Btn>種目追加</Btn></div></form>}<div className="mt-4 space-y-3">{items.map(item=>{const open=openItemId===item.id; return <div key={item.id} className="rounded-2xl border"><button type="button" onClick={()=>setOpenItemId(open?null:item.id)} className="flex w-full items-center justify-between p-4 text-left"><div><div className="font-bold">{item.exercise_name}</div><div className="text-xs text-slate-500">{item.body_part || "部位未設定"}</div></div><span className="text-sm text-sky-700">{open?"閉じる":"編集"}</span></button>{open&&<form action={(fd)=>updateItem(fd,item.id)} className="grid gap-3 border-t bg-slate-50 p-4 md:grid-cols-3"><Input label="種目名" name="exercise_name" defaultValue={item.exercise_name}/><Input label="部位" name="body_part" defaultValue={item.body_part}/><Input label="重量目標" name="default_weight" type="number" defaultValue={item.default_weight}/><Input label="回数目標" name="default_reps" type="number" defaultValue={item.default_reps}/><Input label="セット目標" name="default_sets" type="number" defaultValue={item.default_sets}/><Input label="表示順" name="display_order" type="number" defaultValue={item.display_order}/><div className="flex gap-2 md:col-span-3"><Btn>編集</Btn><button type="button" onClick={()=>deleteItem(item.id)} className="rounded-2xl bg-rose-100 px-5 py-3 font-semibold text-rose-700">削除</button></div></form>}</div>})}</div></Card></div>;
}

export function OutputsV5Section() {
  const [outputs,setOutputs]=useState<any[]>([]); const [reviews,setReviews]=useState<any[]>([]); const [msg,setMsg]=useState<Msg>(null); const today=todayISO();
  async function load(){const uid=await userId(); const [{data:o},{data:r}]=await Promise.all([supabase.from("outputs").select("*").eq("user_id",uid).order("date",{ascending:false}),supabase.from("output_reviews").select("*").eq("user_id",uid)]); setOutputs(o??[]); setReviews(r??[]);}
  useEffect(()=>{load().catch(e=>setMsg({type:"error",text:e.message}))},[]);
  async function save(fd:FormData){try{const uid=await userId(); await insert("outputs",{user_id:uid,date:today,title:String(fd.get("title")),category:String(fd.get("category")),purpose:String(fd.get("purpose")||""),content_summary:String(fd.get("content_summary")||""),is_explainable:fd.get("is_explainable")==="on",status:String(fd.get("status")),memo:String(fd.get("memo")||"")}); setMsg({type:"ok",text:"成果物を保存しました。"}); await load();}catch(e){setMsg({type:"error",text:e instanceof Error?e.message:"保存に失敗しました。"})}}
  async function review(fd:FormData, outputId:string){try{const uid=await userId(); await upsert("output_reviews",{user_id:uid,output_id:outputId,review_date:today,good_points:String(fd.get("good_points")||""),improvements:String(fd.get("improvements")||""),third_person_critique:String(fd.get("third_person_critique")||""),interview_evaluation:String(fd.get("interview_evaluation")||""),next_action:String(fd.get("next_action")||""),updated_at:new Date().toISOString()},"user_id,output_id"); setMsg({type:"ok",text:"AIレビューを保存しました。"}); await load();}catch(e){setMsg({type:"error",text:e instanceof Error?e.message:"保存に失敗しました。"})}}
  const rmap=new Map(reviews.map(r=>[r.output_id,r]));
  return <div className="space-y-6"><Message msg={msg}/><Card><H2>成果物を追加</H2><form action={save} className="mt-5 grid gap-4 md:grid-cols-2"><Input label="タイトル" name="title"/><Select label="カテゴリ" name="category"><option>アプリ改善</option><option>技術整理</option><option>記事</option><option>その他</option></Select><Input label="目的" name="purpose"/><Select label="状態" name="status"><option>未着手</option><option>進行中</option><option>完了</option></Select><div className="md:col-span-2"><Textarea label="AIに見せる要約" name="content_summary"/></div><label className="flex items-center gap-3"><input type="checkbox" name="is_explainable"/>説明できる状態</label><Input label="メモ" name="memo"/><div className="md:col-span-2"><Btn>保存</Btn></div></form></Card>{outputs.map(o=>{const r=rmap.get(o.id); return <Card key={o.id}><div className="font-black">{o.title}</div><div className="mt-1 text-sm text-slate-500">{o.category} / {o.status} / 説明可能：{o.is_explainable?"Yes":"No"}</div><form action={(fd)=>review(fd,o.id)} className="mt-4 grid gap-3"><Textarea label="良い点" name="good_points" defaultValue={r?.good_points}/><Textarea label="改善点" name="improvements" defaultValue={r?.improvements}/><Textarea label="厳しい第三者ダメ出し" name="third_person_critique" defaultValue={r?.third_person_critique}/><Textarea label="面接官評価" name="interview_evaluation" defaultValue={r?.interview_evaluation}/><Textarea label="次の改善1つ" name="next_action" defaultValue={r?.next_action}/><Btn>AIレビュー保存</Btn></form></Card>})}</div>
}

export function WeeklyReviewV5Section() {
  const [summary,setSummary]=useState<any>({}); const [review,setReview]=useState<any>(null); const [msg,setMsg]=useState<Msg>(null); const today=todayISO(); const ws=weekStartISO();
  async function load(){const uid=await userId(); const [h,s,w,o,i,r,g]=await Promise.all([supabase.from("health_logs").select("*").eq("user_id",uid).gte("date",ws).lte("date",today),supabase.from("study_logs").select("*").eq("user_id",uid).gte("date",ws).lte("date",today),supabase.from("workout_logs").select("date").eq("user_id",uid).gte("date",ws).lte("date",today),supabase.from("outputs").select("*").eq("user_id",uid).gte("date",ws).lte("date",today),supabase.from("interpersonal_logs").select("*").eq("user_id",uid).gte("date",ws).lte("date",today),supabase.from("weekly_reviews").select("*").eq("user_id",uid).eq("week_start_date",ws).maybeSingle(),supabase.from("grooming_logs").select("*").eq("user_id",uid).gte("date",ws).lte("date",today)]); const avg=(arr:any[])=>{const v=arr.filter(x=>x!=null).map(Number); return v.length?v.reduce((a,b)=>a+b,0)/v.length:null}; setSummary({avgWeight:avg((h.data??[]).map(x=>x.weight)),avgBodyFat:avg((h.data??[]).map(x=>x.body_fat)),studyMinutes:(s.data??[]).reduce((sum,x)=>sum+(x.minutes??0),0),workoutCount:new Set((w.data??[]).map(x=>x.date)).size,outputCount:o.data?.length??0,ledActionCount:(i.data??[]).filter(x=>x.led_action_done).length,cleanlinessRate:g.data?.length?Math.round(((g.data??[]).filter(x=>x.is_done).length/(g.data??[]).length)*100):null}); setReview(r.data);}
  useEffect(()=>{load().catch(e=>setMsg({type:"error",text:e.message}))},[]);
  async function save(fd:FormData){try{const uid=await userId(); await upsert("weekly_reviews",{user_id:uid,week_start_date:ws,avg_weight:summary.avgWeight,avg_body_fat:summary.avgBodyFat,study_minutes_total:summary.studyMinutes,workout_count:summary.workoutCount,output_count:summary.outputCount,led_action_count:summary.ledActionCount,cleanliness_rate:summary.cleanlinessRate,good_points:String(fd.get("good_points")||""),bad_points:String(fd.get("bad_points")||""),ai_review_summary:String(fd.get("ai_review_summary")||""),next_improvement:String(fd.get("next_improvement")||"")},"user_id,week_start_date"); setMsg({type:"ok",text:"週次レビューを保存しました。"}); await load();}catch(e){setMsg({type:"error",text:e instanceof Error?e.message:"保存に失敗しました。"})}}
  return <div className="space-y-6"><Message msg={msg}/><div className="grid gap-4 md:grid-cols-3">{[["平均体重",summary.avgWeight?.toFixed?.(1)+"kg"],["平均体脂肪",summary.avgBodyFat?.toFixed?.(1)+"%"],["勉強",summary.studyMinutes+"分"],["筋トレ",summary.workoutCount+"回"],["成果物",summary.outputCount+"個"],["主導",summary.ledActionCount+"回"]].map(([a,b])=><Card key={a}><div className="text-sm text-slate-500">{a}</div><div className="text-2xl font-black">{String(b).startsWith("undefined")?"-":b}</div></Card>)}</div><Card><H2>AIレビュー用テンプレ</H2><pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm">{`この内容を評価してください。

① 良い点
② 改善点
③ 厳しい第三者としてダメ出し
④ 面接官なら採用するか（理由）`}</pre></Card><Card><H2>今週の振り返り</H2><form action={save} className="mt-5 grid gap-4"><Textarea label="今週よかったこと" name="good_points" defaultValue={review?.good_points}/><Textarea label="今週ダメだったこと" name="bad_points" defaultValue={review?.bad_points}/><Textarea label="AIレビュー結果要約" name="ai_review_summary" defaultValue={review?.ai_review_summary}/><Input label="来週の改善1つ" name="next_improvement" defaultValue={review?.next_improvement}/><Btn>保存</Btn></form></Card></div>
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
  const d = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0);
  const monthEnd = d.toISOString().slice(0, 10);
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
  const [data,setData]=useState<any>(null); const [msg,setMsg]=useState<Msg>(null);
  const today=todayISO(); const dow=dayOfWeek(); const ws=weekStartISO();
  async function load(){const uid=await userId(); const [health,routineT,routineL,groomT,groomL,houseT,houseL,inter,studyToday,studyWeek,workoutWeek,outputs,weekly,orev,settings]=await Promise.all([
    supabase.from("health_logs").select("*").eq("user_id",uid).eq("date",today).maybeSingle(),
    supabase.from("routine_templates").select("*").eq("user_id",uid).eq("is_active",true).or(`day_of_week.is.null,day_of_week.eq.${dow}`).order("display_order"),
    supabase.from("routine_logs").select("*").eq("user_id",uid).eq("date",today),
    supabase.from("grooming_templates").select("*").eq("user_id",uid).eq("is_active",true).or(`day_of_week.is.null,day_of_week.eq.${dow}`).order("display_order"),
    supabase.from("grooming_logs").select("*").eq("user_id",uid).eq("date",today),
    supabase.from("household_templates").select("*").eq("user_id",uid).eq("is_active",true).eq("day_of_week",dow).order("display_order"),
    supabase.from("household_logs").select("*").eq("user_id",uid).eq("date",today),
    supabase.from("interpersonal_logs").select("*").eq("user_id",uid).eq("date",today).maybeSingle(),
    supabase.from("study_logs").select("*").eq("user_id",uid).eq("date",today),
    supabase.from("study_logs").select("*").eq("user_id",uid).gte("date",ws).lte("date",today),
    supabase.from("workout_logs").select("*").eq("user_id",uid).gte("date",ws).lte("date",today),
    supabase.from("outputs").select("*").eq("user_id",uid).gte("date",ws).lte("date",today),
    supabase.from("weekly_reviews").select("*").eq("user_id",uid).eq("week_start_date",ws).maybeSingle(),
    supabase.from("output_reviews").select("*").eq("user_id",uid).gte("review_date",ws).lte("review_date",today),
    supabase.from("user_settings").select("*").eq("user_id",uid).maybeSingle(),
  ]);
  const rt=routineT.data??[], rl=routineL.data??[], gt=groomT.data??[], gl=groomL.data??[], ht=houseT.data??[], hl=houseL.data??[];
  const check=(section:string,items:any[])=>({section,items});
  const rmap=new Map(rl.map((l:any)=>[l.template_id,l])); const gmap=new Map(gl.map((l:any)=>[`${l.category}:${l.item_name}`,l])); const hmap=new Map(hl.map((l:any)=>[l.task_name,l]));
  const checklist=[
    check("朝",rt.filter((x:any)=>x.category==="morning").map((x:any)=>({label:x.title,done:!!rmap.get(x.id)?.is_done,tab:"routine"}))),
    check("昼",rt.filter((x:any)=>x.category==="noon").map((x:any)=>({label:x.title,done:!!rmap.get(x.id)?.is_done,tab:"routine"}))),
    check("夜",rt.filter((x:any)=>x.category==="night").map((x:any)=>({label:x.title,done:!!rmap.get(x.id)?.is_done,tab:"routine"}))),
    check("清潔",gt.map((x:any)=>({label:x.item_name,done:!!gmap.get(`${x.category}:${x.item_name}`)?.is_done,tab:"cleanliness"}))),
    check("家事",ht.map((x:any)=>({label:x.task_name,done:!!hmap.get(x.task_name)?.is_done,tab:"household"}))),
    check("対人",[{label:"主導1アクション",done:!!inter.data?.led_action_done,tab:"interpersonal"},{label:"共感1回",done:!!inter.data?.empathy_done,tab:"interpersonal"},{label:"意見を言う",done:!!inter.data?.opinion_done,tab:"interpersonal"}]),
    check("健康",[{label:"体重",done:health.data?.weight!=null,tab:"health"},{label:"体脂肪",done:health.data?.body_fat!=null,tab:"health"},{label:"水分",done:health.data?.water_ml!=null,tab:"health"}])
  ];
  const avg=(arr:any[])=>{const v=arr.filter(x=>x!=null).map(Number); return v.length?v.reduce((a,b)=>a+b,0)/v.length:null};
  const weekHealth=(await supabase.from("health_logs").select("*").eq("user_id",uid).gte("date",ws).lte("date",today)).data??[];
  const alerts:any[]=[]; if(health.data?.weight==null) alerts.push(["体重未入力","health"]); if(health.data?.body_fat==null) alerts.push(["体脂肪未入力","health"]); if((studyToday.data??[]).reduce((s:any,x:any)=>s+(x.minutes??0),0)<=0) alerts.push(["勉強時間未入力","study"]); if((health.data?.water_ml??0)<(settings.data?.water_target_ml??2000)) alerts.push(["水分目標未達","health"]); if(dow===0&&!weekly.data) alerts.push(["週次レビュー未完了","weeklyReview"]); if(dow===0&&(orev.data??[]).length===0) alerts.push(["AIレビュー未実施","outputs"]);
  setData({checklist,alerts,kpi:{avgWeight:avg(weekHealth.map(x=>x.weight)),avgBodyFat:avg(weekHealth.map(x=>x.body_fat)),study:(studyWeek.data??[]).reduce((s:any,x:any)=>s+(x.minutes??0),0),workout:new Set((workoutWeek.data??[]).map((x:any)=>x.date)).size,outputs:outputs.data?.length??0},weekly:weekly.data, aiDone:(orev.data??[]).length>0});
  }
  useEffect(()=>{load().catch(e=>setMsg({type:"error",text:e.message}))},[]);
  const weeklyPlan:Record<number,string[]>= {0:["全身トレ","有酸素","週次レビュー","AIレビュー"],1:["宅トレ30分","有酸素15分","体重測定"],2:["ジムA","有酸素15分","勉強"],3:["休み","ストレッチ5分","軽振り返り"],4:["ジムB","有酸素15分","勉強"],5:["有酸素15〜20分","ストレッチ","軽評価"],6:["上半身トレ","有酸素","成果物タイム"]};
  if(!data) return <Card><Message msg={msg}/><div className="text-slate-500">ダッシュボードを読み込み中...</div></Card>;
  return <div className="space-y-6"><Message msg={msg}/><Card><div className="text-sm font-semibold text-sky-700">{today}（{dayLabels[dow]}）</div><h2 className="mt-2 text-3xl font-black">今日の司令塔</h2><div className="mt-4 flex flex-wrap gap-2"><button onClick={()=>onGo("settings")} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold">ルール</button><button onClick={()=>onGo("health")} className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white">今日の入力</button></div></Card><Card><H2>今日の予定</H2><div className="mt-4 grid gap-2 md:grid-cols-4">{weeklyPlan[dow].map(x=><div key={x} className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold">{x}</div>)}</div></Card><Card><H2>今日のチェックリスト</H2><div className="mt-5 space-y-5">{data.checklist.map((s:any)=><div key={s.section}><h3 className="mb-2 text-sm font-bold text-slate-600">{s.section}</h3><div className="space-y-2">{s.items.map((i:any,idx:number)=><button key={idx} onClick={()=>onGo(i.tab)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-3 text-left"><span>{i.label}</span><span className={`rounded-full px-3 py-1 text-xs ${i.done?"bg-emerald-100 text-emerald-700":"bg-slate-100 text-slate-600"}`}>{i.done?"完了":"未"}</span></button>)}</div></div>)}</div></Card><div className="grid gap-4 md:grid-cols-5"><Card><div className="text-xs text-slate-500">平均体重</div><div className="text-2xl font-black">{data.kpi.avgWeight?.toFixed(1)??"-"}kg</div></Card><Card><div className="text-xs text-slate-500">平均体脂肪</div><div className="text-2xl font-black">{data.kpi.avgBodyFat?.toFixed(1)??"-"}%</div></Card><Card><div className="text-xs text-slate-500">勉強</div><div className="text-2xl font-black">{data.kpi.study}分</div></Card><Card><div className="text-xs text-slate-500">筋トレ</div><div className="text-2xl font-black">{data.kpi.workout}回</div></Card><Card><div className="text-xs text-slate-500">成果物</div><div className="text-2xl font-black">{data.kpi.outputs}個</div></Card></div>{data.alerts.length>0&&<Card><H2>記録漏れアラート</H2><div className="mt-4 space-y-2">{data.alerts.map((a:any)=><button key={a[0]} onClick={()=>onGo(a[1])} className="block w-full rounded-2xl bg-yellow-50 p-3 text-left text-sm font-semibold text-yellow-800">{a[0]}</button>)}</div></Card>}{dow===0&&<Card className="border-blue-200 bg-blue-50"><H2>日曜レビュー</H2><div className="mt-3 text-sm">週次レビュー：{data.weekly?"完了":"未完了"} / AIレビュー：{data.aiDone?"完了":"未実施"}</div><button onClick={()=>onGo("weeklyReview")} className="mt-4 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white">週次レビューへ</button></Card>}</div>
}
