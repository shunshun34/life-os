"use client";

import { useEffect, useMemo, useState } from "react";
import { getDailyReflections, saveDailyReflection } from "@/lib/life-os/review";

export default function ReviewSection() {
  const [items, setItems] = useState<any[]>([]);
  const [reflectionDate, setReflectionDate] = useState(new Date().toISOString().slice(0,10));
  const [todayWin, setTodayWin] = useState("");
  const [todayIssue, setTodayIssue] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [message, setMessage] = useState("");

  async function load() { setItems(await getDailyReflections()); }
  useEffect(() => { load(); }, []);

  async function handleSave() {
    try {
      setMessage("");
      await saveDailyReflection({ reflectionDate, todayWin, todayIssue, nextAction });
      setMessage("振り返りを保存しました。");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存に失敗しました。");
    }
  }

  const latest = useMemo(() => items[0] ?? null, [items]);

  return <div className="space-y-8">
    <section className="grid gap-4 md:grid-cols-3">
      <Stat title="保存件数" value={`${items.length}`} />
      <Stat title="最新日付" value={latest?.reflection_date ?? "-"} />
      <Stat title="次の一手" value={latest?.next_action ? "あり" : "未設定"} />
    </section>

    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">振り返り</h2>
      <p className="mt-2 text-sm text-slate-500">日次レビューを残します。</p>
      {message ? <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</div> : null}
      <label className="mt-5 block"><div className="mb-2 text-sm font-medium text-slate-700">日付</div><input type="date" value={reflectionDate} onChange={e=>setReflectionDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"/></label>
      <label className="mt-4 block"><div className="mb-2 text-sm font-medium text-slate-700">今日よかったこと</div><textarea rows={4} value={todayWin} onChange={e=>setTodayWin(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"/></label>
      <label className="mt-4 block"><div className="mb-2 text-sm font-medium text-slate-700">今日の課題</div><textarea rows={4} value={todayIssue} onChange={e=>setTodayIssue(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"/></label>
      <label className="mt-4 block"><div className="mb-2 text-sm font-medium text-slate-700">次の一手</div><textarea rows={4} value={nextAction} onChange={e=>setNextAction(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"/></label>
      <button type="button" onClick={handleSave} className="mt-4 rounded-2xl bg-slate-200 px-5 py-3 font-semibold text-slate-950 hover:bg-white">振り返りを保存</button>
    </section>

    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">履歴</h3>
      <div className="mt-5 space-y-3">
        {items.length===0 ? <Empty text="振り返りがありません。"/> : items.map(item => <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-lg font-semibold text-slate-900">{item.reflection_date}</div><div className="mt-3 text-sm text-slate-600 whitespace-pre-wrap">良かったこと: {item.today_win || "-"}</div><div className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">課題: {item.today_issue || "-"}</div><div className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">次の一手: {item.next_action || "-"}</div></div>)}
      </div>
    </section>
  </div>;
}

function Stat({ title, value }: { title: string; value: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-sm text-slate-500">{title}</div><div className="mt-2 text-2xl font-bold text-slate-900">{value}</div></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500">{text}</div>; }
