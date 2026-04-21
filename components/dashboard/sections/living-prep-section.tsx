"use client";

import { useEffect, useMemo, useState } from "react";
import { addLivingPrepTask, getLivingPrepTasks, toggleLivingPrepTask } from "@/lib/life-os/living-prep";

type Visibility = "private" | "partner" | "public";

export default function LivingPrepSection() {
  const [items, setItems] = useState<any[]>([]);
  const [category, setCategory] = useState("同棲");
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("partner");
  const [message, setMessage] = useState("");

  async function load() { setItems(await getLivingPrepTasks()); }
  useEffect(() => { load(); }, []);

  async function handleSave() {
    try {
      setMessage("");
      if (!title.trim()) { setMessage("タイトルを入力してください。"); return; }
      await addLivingPrepTask({ category, title, memo, dueDate, visibility });
      setTitle(""); setMemo(""); setDueDate(""); setMessage("暮らし準備タスクを保存しました。"); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "保存に失敗しました。"); }
  }

  const doneCount = useMemo(() => items.filter(i => i.done).length, [items]);

  return <div className="space-y-8">
    <section className="grid gap-4 md:grid-cols-2">
      <Stat title="完了" value={`${doneCount}`} />
      <Stat title="未完了" value={`${Math.max(items.length - doneCount, 0)}`} />
    </section>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">暮らし準備</h2>
      <p className="mt-2 text-sm text-slate-500">同棲・結婚・引っ越しに向けたタスク管理。</p>
      {message ? <div className="mt-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-200">{message}</div> : null}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block"><div className="mb-2 text-sm font-medium text-slate-700">カテゴリ</div><select value={category} onChange={e=>setCategory(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"><option>同棲</option><option>結婚</option><option>引っ越し</option><option>家電・家具</option><option>お金</option><option>手続き</option></select></label>
        <label className="block"><div className="mb-2 text-sm font-medium text-slate-700">タイトル</div><input value={title} onChange={e=>setTitle(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"/></label>
        <label className="block"><div className="mb-2 text-sm font-medium text-slate-700">期限</div><input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"/></label>
        <label className="block"><div className="mb-2 text-sm font-medium text-slate-700">表示範囲</div><select value={visibility} onChange={e=>setVisibility(e.target.value as Visibility)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"><option value="private">自分用</option><option value="partner">共有OK</option><option value="public">公開OK</option></select></label>
      </div>
      <label className="mt-4 block"><div className="mb-2 text-sm font-medium text-slate-700">メモ</div><textarea rows={4} value={memo} onChange={e=>setMemo(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"/></label>
      <button type="button" onClick={handleSave} className="mt-4 rounded-2xl bg-orange-400 px-5 py-3 font-semibold text-slate-950 hover:bg-orange-300">暮らし準備タスクを保存</button>
    </section>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">一覧</h3>
      <div className="mt-5 space-y-3">
        {items.length===0 ? <Empty text="暮らし準備タスクがありません。"/> : items.map(item => <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><div className="text-lg font-semibold text-slate-900">{item.title}</div><div className="mt-1 text-xs text-slate-500">{item.category || "カテゴリ未設定"} / {item.due_date || "期限なし"}</div><div className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{item.memo || "-"}</div></div><button type="button" onClick={async()=>{await toggleLivingPrepTask(item.id, !item.done); await load();}} className={`rounded-xl px-3 py-2 text-xs font-medium ${item.done ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30" : "bg-white text-slate-700 border border-slate-200"}`}>{item.done ? "完了" : "未完了"}</button></div></div>)}
      </div>
    </section>
  </div>;
}

function Stat({ title, value }: { title: string; value: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-sm text-slate-500">{title}</div><div className="mt-2 text-2xl font-bold text-slate-900">{value}</div></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500">{text}</div>; }
