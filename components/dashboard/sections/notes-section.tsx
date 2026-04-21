
"use client";

import { useEffect, useMemo, useState } from "react";
import { addNote, deleteNote, getNotes } from "@/lib/life-os/notes";

type Visibility = "private" | "partner" | "public";

const VISIBILITY_LABEL: Record<Visibility, string> = {
  private: "自分用",
  partner: "共有OK",
  public: "公開OK",
};

export default function NotesSection() {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const res = await getNotes();
    setItems(res.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.title ?? ""} ${item.body ?? ""} ${(item.tags ?? []).join(" ")}`
        .toLowerCase()
        .includes(q)
    );
  }, [items, query]);

  async function handleSave() {
    setMessage("");
    if (!title.trim() && !body.trim()) {
      setMessage("タイトルか本文を入力してください。");
      return;
    }
    await addNote({ title, body, visibility });
    setTitle("");
    setBody("");
    setVisibility("private");
    setMessage("メモを保存しました。");
    await load();
  }

  async function handleDelete(id: string) {
    await deleteNote(id);
    setMessage("メモを削除しました。");
    await load();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">メモ</h2>
        <p className="mt-2 text-sm text-slate-500">
          タイトル・本文・#タグを残せます。タグは自動抽出します。
        </p>

        {message ? (
          <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
            {message}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4">
          <label className="block">
            <div className="mb-2 text-sm font-medium text-slate-700">タイトル</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
            />
          </label>

          <label className="block">
            <div className="mb-2 text-sm font-medium text-slate-700">本文</div>
            <textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
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

          <button
            type="button"
            onClick={handleSave}
            className="w-fit rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
          >
            メモを保存
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">メモ一覧</h3>
            <p className="mt-1 text-sm text-slate-500">タイトル・本文・タグで検索できます。</p>
          </div>
          <input
            placeholder="検索"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
          />
        </div>

        <div className="mt-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500">
              メモがありません。
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{item.title || "無題メモ"}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {VISIBILITY_LABEL[(item.visibility as Visibility) ?? "private"]}
                    </div>
                    <div className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{item.body || "-"}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(item.tags ?? []).map((tag: string) => (
                        <span key={tag} className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
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
