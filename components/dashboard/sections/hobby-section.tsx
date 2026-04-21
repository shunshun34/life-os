"use client";

import { useEffect, useMemo, useState } from "react";
import { addDrink, addHobby, getDrinks, getHobbies } from "@/lib/life-os/hobbies";

export default function HobbySection() {
  const [hobbies, setHobbies] = useState<any[]>([]);
  const [drinks, setDrinks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("その他");
  const [memo, setMemo] = useState("");
  const [bestPoint, setBestPoint] = useState("");
  const [badPoint, setBadPoint] = useState("");
  const [satisfaction, setSatisfaction] = useState("4");
  const [repeatScore, setRepeatScore] = useState("4");
  const [memoryScore, setMemoryScore] = useState("4");
  const [visibility, setVisibility] = useState("private");

  const [drinkName, setDrinkName] = useState("");
  const [drinkType, setDrinkType] = useState("その他");
  const [drinkPlace, setDrinkPlace] = useState("");
  const [drinkMemo, setDrinkMemo] = useState("");

  async function load() {
    const h = await getHobbies();
    const d = await getDrinks();
    setHobbies(h.data || []);
    setDrinks(d.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAddHobby() {
    if (!title.trim()) return;
    await addHobby({
      title,
      category,
      memo,
      best_point: bestPoint,
      bad_point: badPoint,
      satisfaction: Number(satisfaction),
      repeat_score: Number(repeatScore),
      memory_score: Number(memoryScore),
      visibility,
    });
    setTitle("");
    setMemo("");
    setBestPoint("");
    setBadPoint("");
    load();
  }

  async function handleAddDrink() {
    if (!drinkName.trim()) return;
    await addDrink({
      name: drinkName,
      type: drinkType,
      place: drinkPlace,
      memo: drinkMemo,
      satisfaction: 4,
      repeat_score: 4,
      memory_score: 4,
      visibility: "private",
    });
    setDrinkName("");
    setDrinkPlace("");
    setDrinkMemo("");
    load();
  }

  const topHobbies = useMemo(
    () => [...hobbies].sort((a, b) => (b.satisfaction ?? 0) - (a.satisfaction ?? 0)).slice(0, 5),
    [hobbies]
  );

  return (
    <div className="space-y-8 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">趣味アーカイブ登録</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <div className="mb-2 text-sm">タイトル</div>
            <input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="block">
            <div className="mb-2 text-sm">カテゴリ</div>
            <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>その他</option>
              <option>アニメ</option>
              <option>漫画</option>
              <option>ゲーム</option>
              <option>音楽</option>
              <option>ガジェット</option>
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="block"><div className="mb-2 text-sm">一言メモ</div><textarea className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3" value={memo} onChange={(e)=>setMemo(e.target.value)} /></label>
          <label className="block"><div className="mb-2 text-sm">良かった点</div><textarea className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3" value={bestPoint} onChange={(e)=>setBestPoint(e.target.value)} /></label>
          <label className="block"><div className="mb-2 text-sm">微妙だった点</div><textarea className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3" value={badPoint} onChange={(e)=>setBadPoint(e.target.value)} /></label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <label><div className="mb-2 text-sm">満足度</div><input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3" value={satisfaction} onChange={(e)=>setSatisfaction(e.target.value)} /></label>
          <label><div className="mb-2 text-sm">またやりたい度</div><input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3" value={repeatScore} onChange={(e)=>setRepeatScore(e.target.value)} /></label>
          <label><div className="mb-2 text-sm">思い出度</div><input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3" value={memoryScore} onChange={(e)=>setMemoryScore(e.target.value)} /></label>
          <label><div className="mb-2 text-sm">表示範囲</div><select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3" value={visibility} onChange={(e)=>setVisibility(e.target.value)}><option value="private">自分用</option><option value="partner">共有OK</option><option value="public">公開OK</option></select></label>
        </div>
        <button onClick={handleAddHobby} className="mt-4 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950">趣味記録を保存</button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">お酒レビュー</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label><div className="mb-2 text-sm">お酒名</div><input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3" value={drinkName} onChange={(e)=>setDrinkName(e.target.value)} /></label>
          <label><div className="mb-2 text-sm">種類</div><input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3" value={drinkType} onChange={(e)=>setDrinkType(e.target.value)} /></label>
          <label><div className="mb-2 text-sm">場所</div><input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3" value={drinkPlace} onChange={(e)=>setDrinkPlace(e.target.value)} /></label>
          <label><div className="mb-2 text-sm">メモ</div><textarea className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3" value={drinkMemo} onChange={(e)=>setDrinkMemo(e.target.value)} /></label>
        </div>
        <button onClick={handleAddDrink} className="mt-4 rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950">お酒レビューを保存</button>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold">満足度上位</h3>
          <ul className="mt-4 space-y-2 text-slate-600">
            {topHobbies.length === 0 ? <li>まだありません</li> : topHobbies.map((h) => <li key={h.id}>{h.title} ⭐ {h.satisfaction}</li>)}
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold">思い出即わかり表</h3>
          <ul className="mt-4 space-y-2 text-slate-600">
            {hobbies.length === 0 ? <li>まだありません</li> : hobbies.slice(0,5).map((h) => <li key={h.id}>{h.title} / {h.category} / 思い出度 {h.memory_score}</li>)}
          </ul>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold">最近のお酒</h3>
        <ul className="mt-4 space-y-2 text-slate-600">
          {drinks.length === 0 ? <li>まだありません</li> : drinks.map((d) => <li key={d.id}>{d.name} / {d.type || "種類未設定"} / {d.place || "場所未設定"}</li>)}
        </ul>
      </section>
    </div>
  );
}
