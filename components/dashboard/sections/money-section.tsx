"use client";

import { useEffect, useMemo, useState } from "react";
import { addMoneyEntry, deleteMoneyEntry, getMoneyEntries } from "@/lib/life-os/money";

type Visibility = "private" | "partner" | "public";
const VISIBILITY_LABEL: Record<Visibility, string> = { private: "自分用", partner: "共有OK", public: "公開OK" };

export default function MoneySection() {
  const [items, setItems] = useState<any[]>([]);
  const [entryType, setEntryType] = useState<"income"|"expense">("expense");
  const [category, setCategory] = useState("食費");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0,10));
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [message, setMessage] = useState("");

  async function load() { setItems(await getMoneyEntries()); }
  useEffect(() => { load(); }, []);

  async function handleSave() {
    try {
      if (!amount || Number(amount) <= 0) { setMessage("金額を入力してください。"); return; }
      await addMoneyEntry({ entryType, category, title, amount: Number(amount), memo, entryDate, visibility });
      setTitle(""); setAmount(""); setMemo(""); setMessage("お金データを保存しました。"); await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : "保存に失敗しました。"); }
  }

  const summary = useMemo(() => {
    const income = items.filter(i=>i.entry_type==="income").reduce((s,i)=>s+Number(i.amount||0),0);
    const expense = items.filter(i=>i.entry_type==="expense").reduce((s,i)=>s+Number(i.amount||0),0);
    return { income, expense, balance: income - expense };
  }, [items]);

  return <div className="space-y-8">
    <section className="grid gap-4 md:grid-cols-3">
      <Card title="収入合計" value={`¥${summary.income.toLocaleString()}`} />
      <Card title="支出合計" value={`¥${summary.expense.toLocaleString()}`} />
      <Card title="差額" value={`¥${summary.balance.toLocaleString()}`} />
    </section>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">お金</h2>
      {message ? <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div> : null}
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Select label="種別" value={entryType} onChange={setEntryType as any} options={[["income","収入"],["expense","支出"]]} />
        <Input label="カテゴリ" value={category} onChange={setCategory} />
        <Input label="日付" type="date" value={entryDate} onChange={setEntryDate} />
        <Input label="タイトル" value={title} onChange={setTitle} />
        <Input label="金額" value={amount} onChange={setAmount} />
        <Select label="表示範囲" value={visibility} onChange={setVisibility as any} options={[["private","自分用"],["partner","共有OK"],["public","公開OK"]]} />
      </div>
      <label className="mt-4 block"><div className="mb-2 text-sm font-medium text-slate-700">メモ</div><textarea rows={4} value={memo} onChange={e=>setMemo(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"/></label>
      <button type="button" onClick={handleSave} className="mt-4 rounded-2xl bg-green-400 px-5 py-3 font-semibold text-slate-950 hover:bg-green-300">お金データを保存</button>
    </section>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">一覧</h3>
      <div className="mt-5 space-y-3">
        {items.length===0 ? <Empty text="お金データがありません。"/> : items.map(item => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div><div className="text-lg font-semibold text-slate-900">{item.title || item.category} / ¥{Number(item.amount||0).toLocaleString()}</div>
              <div className="mt-1 text-xs text-slate-500">{item.entry_type==="income"?"収入":"支出"} / {item.category} / {item.entry_date} / {VISIBILITY_LABEL[(item.visibility as Visibility) ?? "private"]}</div>
              <div className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{item.memo || "-"}</div></div>
              <button type="button" onClick={async()=>{await deleteMoneyEntry(item.id); await load();}} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100">削除</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>;
}

function Card({ title, value }: { title: string; value: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-sm text-slate-500">{title}</div><div className="mt-2 text-2xl font-bold text-slate-900">{value}</div></div>; }
function Input({ label, value, onChange, type="text" }: { label: string; value: string; onChange: (v: string)=>void; type?: string }) { return <label className="block"><div className="mb-2 text-sm font-medium text-slate-700">{label}</div><input type={type} value={value} onChange={e=>onChange(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"/></label>; }
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v:any)=>void; options: [string,string][] }) { return <label className="block"><div className="mb-2 text-sm font-medium text-slate-700">{label}</div><select value={value} onChange={e=>onChange(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400">{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500">{text}</div>; }
