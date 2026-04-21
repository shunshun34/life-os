"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getWallpaperSetting,
  saveWallpaperSetting,
  uploadCustomWallpaper,
  type WallpaperMode,
} from "@/lib/life-os/wallpaper";

const PRESETS = [
  { key: "aurora", label: "オーロラ" },
  { key: "midnight", label: "ミッドナイト" },
  { key: "ocean", label: "オーシャン" },
  { key: "forest", label: "フォレスト" },
  { key: "sunset", label: "サンセット" },
];

export default function WallpaperSection() {
  const [preset, setPreset] = useState("aurora");
  const [opacity, setOpacity] = useState(45);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<WallpaperMode>("preset");
  const [file, setFile] = useState<File | null>(null);
  const [currentCustomPath, setCurrentCustomPath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getWallpaperSetting();
        if (data?.preset) setPreset(data.preset);
        if (typeof data?.opacity_percent === "number") setOpacity(data.opacity_percent);
        if (data?.mode === "custom" || data?.mode === "preset") setMode(data.mode);
        if (data?.custom_path) setCurrentCustomPath(data.custom_path);
      } catch {}
    })();
  }, []);

  const previewStyle = useMemo(() => {
    const base =
      preset === "aurora" ? "linear-gradient(135deg, rgba(56,189,248,0.6), rgba(244,114,182,0.18))" :
      preset === "midnight" ? "linear-gradient(135deg, rgba(148,163,184,0.45), rgba(226,232,240,0.9))" :
      preset === "ocean" ? "linear-gradient(135deg, rgba(14,165,233,0.55), rgba(34,211,238,0.2))" :
      preset === "forest" ? "linear-gradient(135deg, rgba(16,185,129,0.55), rgba(132,204,22,0.2))" :
      "linear-gradient(135deg, rgba(249,115,22,0.55), rgba(244,114,182,0.2))";

    return {
      backgroundImage: base,
      opacity: Math.max(0.25, opacity / 100),
    };
  }, [preset, opacity]);

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");
      let customPath = currentCustomPath;

      if (mode === "custom" && file) {
        customPath = await uploadCustomWallpaper(file);
        setCurrentCustomPath(customPath);
      }

      if (mode === "custom" && !customPath) {
        throw new Error("カスタム画像を選択してください。");
      }

      await saveWallpaperSetting({
        preset,
        opacityPercent: opacity,
        mode,
        customPath: mode === "custom" ? customPath : null,
      });
      setMessage("壁紙設定を保存しました。リロードすると反映が安定します。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">壁紙</h2>
        <p className="mt-2 text-sm text-slate-500">プリセットに加えて、自分の好きな画像も背景にできます。</p>

        {message ? (
          <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">{message}</div>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-3 text-sm font-semibold text-slate-700">壁紙モード</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("preset")}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${mode === "preset" ? "border-sky-200 bg-sky-50 text-sky-800" : "border-slate-200 bg-white text-slate-700"}`}
              >
                プリセット
              </button>
              <button
                type="button"
                onClick={() => setMode("custom")}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${mode === "custom" ? "border-sky-200 bg-sky-50 text-sky-800" : "border-slate-200 bg-white text-slate-700"}`}
              >
                カスタム
              </button>
            </div>
          </div>

          <label className="block rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
              <span>透過度</span>
              <span className="text-sky-700">{opacity}%</span>
            </div>
            <input type="range" min={0} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-sky-500" />
          </label>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="block rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-2 text-sm font-semibold text-slate-700">プリセット</div>
            <select value={preset} onChange={(e) => setPreset(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400">
              {PRESETS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
            </select>
          </label>

          <label className="block rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-2 text-sm font-semibold text-slate-700">カスタム画像</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:font-semibold file:text-slate-900"
            />
            <p className="mt-2 text-xs text-slate-500">
              {currentCustomPath ? "保存済みカスタム画像があります。新しい画像を選ばなければ再利用されます。" : "まだカスタム画像は保存されていません。"}
            </p>
          </label>
        </div>

        <div className="mt-5 rounded-[28px] border border-slate-200 bg-slate-50 p-6">
          <div className="mb-3 text-sm font-semibold text-slate-700">プレビュー</div>
          <div className="relative h-56 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-inner">
            <div className="absolute inset-0" style={previewStyle} />
            <div className="absolute inset-0 bg-white/50" />
            <div className="relative z-10 flex h-full items-end p-6">
              <div className="rounded-3xl bg-white/80 px-5 py-4 shadow-lg backdrop-blur-sm">
                <div className="text-sm font-semibold text-sky-700">Life OS</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">白基調プレビュー</div>
                <div className="mt-1 text-sm text-slate-600">タイトルの読みやすさも含めた見え方です。</div>
              </div>
            </div>
          </div>
        </div>

        <button type="button" onClick={handleSave} disabled={saving} className="mt-5 rounded-2xl bg-sky-600 px-5 py-3 font-semibold text-slate-900 transition hover:bg-sky-500 disabled:opacity-60">
          {saving ? "保存中..." : "壁紙設定を保存"}
        </button>
      </section>
    </div>
  );
}
