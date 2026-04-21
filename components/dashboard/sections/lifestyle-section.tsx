"use client";

import { useEffect, useMemo, useState } from "react";
import { addHouseholdTask, addShoppingItem, getHouseholdTasks, getShoppingItems, toggleHouseholdTask, toggleShoppingItem } from "@/lib/life-os/lifestyle";

type Visibility = "private" | "partner" | "public";

export default function LifestyleSection() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [shopping, setShopping] = useState<any[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskFrequency, setTaskFrequency] = useState("週1");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskVisibility, setTaskVisibility] = useState<Visibility>("private");
  const [shoppingTitle, setShoppingTitle] = useState("");
  const [shoppingQuantity, setShoppingQuantity] = useState("");
  const [shoppingVisibility, setShoppingVisibility] = useState<Visibility>("partner");
  const [message, setMessage] = useState("");

  async function load() {
    const [taskData, shoppingData] = await Promise.all([getHouseholdTasks(), getShoppingItems()]);
    setTasks(taskData);
    setShopping(shoppingData);
  }

  useEffect(() => { load(); }, []);

  async function handleSaveTask() {
    setMessage("");
    try {
      if (!taskTitle.trim()) { setMessage("家事タイトルを入力してください。"); return; }
      await addHouseholdTask({ title: taskTitle, frequency: taskFrequency, dueDate: taskDueDate, visibility: taskVisibility });
      setTaskTitle(""); setTaskDueDate(""); setMessage("家事タスクを保存しました。"); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "保存に失敗しました。"); }
  }

  async function handleSaveShopping() {
    setMessage("");
    try {
      if (!shoppingTitle.trim()) { setMessage("買い物タイトルを入力してください。"); return; }
      await addShoppingItem({ title: shoppingTitle, quantity: shoppingQuantity, visibility: shoppingVisibility });
      setShoppingTitle(""); setShoppingQuantity(""); setMessage("買い物リストを保存しました。"); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "保存に失敗しました。"); }
  }

  const pendingTaskCount = useMemo(() => tasks.filter((t) => !t.done).length, [tasks]);
  const pendingShoppingCount = useMemo(() => shopping.filter((s) => !s.done).length, [shopping]);

  return <div className="space-y-8">
    <section className="grid gap-4 md:grid-cols-2">
      <Stat title="未完了家事" value={String(pendingTaskCount)} />
      <Stat title="未完了買い物" value={String(pendingShoppingCount)} />
    </section>

    {message ? <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">{message}</div> : null}

    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">家事タスク</h2>
        <div className="mt-5 grid gap-4">
          <FieldInput label="タイトル" value={taskTitle} onChange={setTaskTitle} />
          <FieldSelect label="頻度" value={taskFrequency} onChange={setTaskFrequency} options={[["毎日","毎日"],["週1","週1"],["週2","週2"],["月1","月1"],["不定期","不定期"]]} />
          <FieldInput label="期限" type="date" value={taskDueDate} onChange={setTaskDueDate} />
          <FieldSelect label="表示範囲" value={taskVisibility} onChange={setTaskVisibility as any} options={[["private","自分用"],["partner","共有OK"],["public","公開OK"]]} />
          <button type="button" onClick={handleSaveTask} className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300">家事タスクを保存</button>
        </div>
        <div className="mt-6 space-y-3">
          {tasks.length===0 ? <Empty text="家事タスクがありません。"/> : tasks.map(task => (
            <div key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div><div className="font-semibold text-slate-900">{task.title}</div><div className="mt-1 text-xs text-slate-500">{task.frequency || "頻度未設定"} / {task.due_date || "期限なし"}</div></div>
                <button type="button" onClick={async()=>{await toggleHouseholdTask(task.id, !task.done); await load();}} className={`rounded-xl px-3 py-2 text-xs font-medium ${task.done ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30" : "bg-white text-slate-700 border border-slate-200"}`}>{task.done ? "完了" : "未完了"}</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">買い物リスト</h2>
        <div className="mt-5 grid gap-4">
          <FieldInput label="タイトル" value={shoppingTitle} onChange={setShoppingTitle} />
          <FieldInput label="数量" value={shoppingQuantity} onChange={setShoppingQuantity} />
          <FieldSelect label="表示範囲" value={shoppingVisibility} onChange={setShoppingVisibility as any} options={[["private","自分用"],["partner","共有OK"],["public","公開OK"]]} />
          <button type="button" onClick={handleSaveShopping} className="rounded-2xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-300">買い物リストを保存</button>
        </div>
        <div className="mt-6 space-y-3">
          {shopping.length===0 ? <Empty text="買い物リストがありません。"/> : shopping.map(item => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div><div className="font-semibold text-slate-900">{item.title}</div><div className="mt-1 text-xs text-slate-500">{item.quantity || "数量未設定"}</div></div>
                <button type="button" onClick={async()=>{await toggleShoppingItem(item.id, !item.done); await load();}} className={`rounded-xl px-3 py-2 text-xs font-medium ${item.done ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30" : "bg-white text-slate-700 border border-slate-200"}`}>{item.done ? "購入済み" : "未購入"}</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>;
}

function Stat({ title, value }: { title: string; value: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-sm text-slate-500">{title}</div><div className="mt-2 text-2xl font-bold text-slate-900">{value}</div></div>; }
function FieldInput({ label, value, onChange, type="text" }: { label: string; value: string; onChange: (v: string)=>void; type?: string }) { return <label className="block"><div className="mb-2 text-sm font-medium text-slate-700">{label}</div><input type={type} value={value} onChange={e=>onChange(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"/></label>; }
function FieldSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v:any)=>void; options: [string,string][] }) { return <label className="block"><div className="mb-2 text-sm font-medium text-slate-700">{label}</div><select value={value} onChange={e=>onChange(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400">{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500">{text}</div>; }
