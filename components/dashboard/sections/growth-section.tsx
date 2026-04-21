
"use client";

import { useEffect, useState } from "react";
import { addGrowthLog, deleteGrowthLog, getGrowthLogs } from "@/lib/life-os/growth";

type Visibility = "private" | "partner" | "public";

const VISIBILITY_LABEL: Record<Visibility, string> = {
  private: "自分用",
  partner: "共有OK",
  public: "公開OK",
};

export default function GrowthSection() {
  const [items, setItems] = useState<any[]>([]);
  const [category, setCategory] = useState("改善");
  const [content, setContent] = useState("");
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10));
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [message, setMessage] = useState("");

  async function load() {
    const res = await getGrowthLogs();
    setItems(res.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    setMessage("");
    if (!content.trim()) {
      setMessage("内容を入力してください。");
      return;
    }
    await addGrowthLog({ category, content, visibility, logDate });
    setContent("");
    setMessage("成長ログを保存しました。");
    await load();
  }

  async function handleDelete(id: string) {
    await deleteGrowthLog(id);
    setMessage("成長ログを削除しました。");
    await load();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">成長</h2>
        <p className="mt-2 text-sm text-slate-500">改善・学び・反省・次の行動を蓄積します。</p>

        {message ? (
          <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {message}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="block">
            <div className="mb-2 text-sm font-medium text-slate-700">カテゴリ</div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
            >
              <option>改善</option>
              <option>学び</option>
              <option>反省</option>
              <option>気づき</option>
            </select>
          </label>

          <label className="block">
            <div className="mb-2 text-sm font-medium text-slate-700">日付</div>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
            />
          </label>

          <label className="block">
            <div className="mb-2 text-sm font-medium text-slate-700">表示範囲</div>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
            >
              <option value="private">自分用</option>
              <option value="partner">共有OK</option>
              <option value="public">公開OK</option>
            </select>
          </label>
        </div>

        <label className="mt-4 block">
          <div className="mb-2 text-sm font-medium text-slate-700">内容</div>
          <textarea
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
          />
        </label>

        <button
          type="button"
          onClick={handleSave}
          className="mt-4 rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-300"
        >
          成長ログを保存
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">成長ログ一覧</h3>
        <div className="mt-5 space-y-3">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500">
              成長ログがありません。
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{item.category}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {item.log_date} / {VISIBILITY_LABEL[(item.visibility as Visibility) ?? "private"]}
                    </div>
                    <div className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{item.content}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
