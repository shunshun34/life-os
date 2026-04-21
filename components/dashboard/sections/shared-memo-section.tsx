"use client";

import { useEffect, useState } from "react";
import { addSharedMemo, deleteSharedMemo, getSharedMemos } from "@/lib/life-os/shared-memo";

type Visibility = "private" | "partner" | "public";
const VISIBILITY_LABEL: Record<Visibility, string> = { private: "自分用", partner: "共有OK", public: "公開OK" };

export default function SharedMemoSection() {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("partner");
  const [message, setMessage] = useState("");

  async function load() { setItems(await getSharedMemos()); }
  useEffect(() => { load(); }, []);

  async function handleSave() {
    try {
      setMessage("");
      if (!title.trim() && !body.trim()) { setMessage("タイトルか本文を入力してください。"); return; }
      await addSharedMemo({ title, body, visibility });
      setTitle(""); setBody(""); setMessage("共有メモを保存しました。"); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "保存に失敗しました。"); }
  }

  return <div className="space-y-8">
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">共有メモ</h2>
      <p className="mt-2 text-sm text-slate-500">二人で見てもよい内容だけを残します。</p>
      {message ? <div className="mt-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200">{message}</div> : null}
      <div className="mt-5 grid gap-4">
        <label className="block"><div className="mb-2 text-sm font-medium text-slate-700">タイトル</div><input value={title} onChange={e=>setTitle(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"/></label>
        <label className="block"><div className="mb-2 text-sm font-medium text-slate-700">本文</div><textarea rows={5} value={body} onChange={e=>setBody(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"/></label>
        <label className="block"><div className="mb-2 text-sm font-medium text-slate-700">表示範囲</div><select value={visibility} onChange={e=>setVisibility(e.target.value as Visibility)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"><option value="private">自分用</option><option value="partner">共有OK</option><option value="public">公開OK</option></select></label>
        <button type="button" onClick={handleSave} className="rounded-2xl bg-indigo-400 px-5 py-3 font-semibold text-slate-950 hover:bg-indigo-300">共有メモを保存</button>
      </div>
    </section>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">一覧</h3>
      <div className="mt-5 space-y-3">
        {items.length===0 ? <Empty text="共有メモがありません。"/> : items.map(item => <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><div className="text-lg font-semibold text-slate-900">{item.title || "無題メモ"}</div><div className="mt-1 text-xs text-slate-500">{VISIBILITY_LABEL[(item.visibility as Visibility) ?? "partner"]}</div><div className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{item.body || "-"}</div></div><button type="button" onClick={async()=>{await deleteSharedMemo(item.id); await load();}} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100">削除</button></div></div>)}
      </div>
    </section>
  </div>;
}

function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500">{text}</div>; }
