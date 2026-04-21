"use client";

import { useEffect, useState } from "react";
import { addGroomingLog, deleteGroomingLog, getGroomingLogs } from "@/lib/life-os/grooming";

export default function GroomingSection() {
  const [items, setItems] = useState<any[]>([]);
  const [category, setCategory] = useState("スキンケア");
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0,10));
  const [message, setMessage] = useState("");

  async function load() { setItems(await getGroomingLogs()); }
  useEffect(() => { load(); }, []);

  async function handleSave() {
    try {
      setMessage("");
      if (!title.trim()) { setMessage("タイトルを入力してください。"); return; }
      await addGroomingLog({ category, title, memo, logDate });
      setTitle(""); setMemo(""); setMessage("身だしなみ記録を保存しました。"); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "保存に失敗しました。"); }
  }

  return <div className="space-y-8">
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">身だしなみ</h2>
      <p className="mt-2 text-sm text-slate-500">ケアの実施記録を残します。</p>
      {message ? <div className="mt-4 rounded-2xl border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-200">{message}</div> : null}
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label className="block"><div className="mb-2 text-sm font-medium text-slate-700">カテゴリ</div><select value={category} onChange={e=>setCategory(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"><option>スキンケア</option><option>ヘアケア</option><option>眉・顔</option><option>口臭・歯</option><option>体臭・制汗</option><option>その他</option></select></label>
        <label className="block"><div className="mb-2 text-sm font-medium text-slate-700">タイトル</div><input value={title} onChange={e=>setTitle(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"/></label>
        <label className="block"><div className="mb-2 text-sm font-medium text-slate-700">日付</div><input type="date" value={logDate} onChange={e=>setLogDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"/></label>
      </div>
      <label className="mt-4 block"><div className="mb-2 text-sm font-medium text-slate-700">メモ</div><textarea rows={4} value={memo} onChange={e=>setMemo(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"/></label>
      <button type="button" onClick={handleSave} className="mt-4 rounded-2xl bg-pink-400 px-5 py-3 font-semibold text-slate-950 hover:bg-pink-300">身だしなみ記録を保存</button>
    </section>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">一覧</h3>
      <div className="mt-5 space-y-3">
        {items.length===0 ? <Empty text="身だしなみ記録がありません。"/> : items.map(item => <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><div className="text-lg font-semibold text-slate-900">{item.title}</div><div className="mt-1 text-xs text-slate-500">{item.category} / {item.log_date}</div><div className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{item.memo || "-"}</div></div><button type="button" onClick={async()=>{await deleteGroomingLog(item.id); await load();}} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100">削除</button></div></div>)}
      </div>
    </section>
  </div>;
}

function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500">{text}</div>; }
