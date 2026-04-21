"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  addHoloActivityLog,
  addHoloFavorite,
  addHoloHighlight,
  addHoloWatchlist,
  getHoloActivityLogs,
  getHoloFavorites,
  getHoloHighlights,
  getHoloProfile,
  getHoloWatchlist,
  saveHoloProfile,
} from "@/lib/life-os/holo";
import {
  DEFAULT_HOLO_THEME,
  HOLO_OSHI_THEMES,
  type HoloThemeKey,
} from "@/lib/life-os/constants";

type Visibility = "private" | "partner" | "public";

const visibilityLabel: Record<Visibility, string> = {
  private: "自分用",
  partner: "共有OK",
  public: "公開OK",
};

export default function HoloSection() {
  const [profile, setProfile] = useState<any | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);

  const [holoName, setHoloName] = useState("");
  const [fanSince, setFanSince] = useState("");
  const [favoriteMember, setFavoriteMember] = useState("");
  const [oshiIntro, setOshiIntro] = useState("");
  const [favoritePoints, setFavoritePoints] = useState("");
  const [profileVisibility, setProfileVisibility] = useState<Visibility>("private");
  const [oshiThemeKey, setOshiThemeKey] = useState<HoloThemeKey>(DEFAULT_HOLO_THEME);
  const [themeMessage, setThemeMessage] = useState("");

  const [memberName, setMemberName] = useState("");
  const [favoriteLevel, setFavoriteLevel] = useState("最推し");
  const [reason, setReason] = useState("");

  const [activityTitle, setActivityTitle] = useState("");
  const [activityType, setActivityType] = useState("配信");
  const [activityMember, setActivityMember] = useState("");
  const [activityMemo, setActivityMemo] = useState("");

  const [watchTitle, setWatchTitle] = useState("");
  const [watchMember, setWatchMember] = useState("");

  const [highlightTitle, setHighlightTitle] = useState("");
  const [highlightMember, setHighlightMember] = useState("");

  async function loadAll() {
    const [p, f, a, w, h] = await Promise.all([
      getHoloProfile(),
      getHoloFavorites(),
      getHoloActivityLogs(),
      getHoloWatchlist(),
      getHoloHighlights(),
    ]);
    setProfile(p.data ?? null);
    setFavorites(f.data ?? []);
    setActivityLogs(a.data ?? []);
    setWatchlist(w.data ?? []);
    setHighlights(h.data ?? []);
    if (p.data) {
      setHoloName(p.data.holo_name ?? "");
      setFanSince(p.data.fan_since ?? "");
      setFavoriteMember(p.data.favorite_member ?? "");
      setOshiIntro(p.data.oshi_intro ?? "");
      setFavoritePoints(p.data.favorite_points ?? "");
      setProfileVisibility((p.data.visibility as Visibility) ?? "private");
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("lifeos-holo-theme") as HoloThemeKey | null;
    if (saved && saved in HOLO_OSHI_THEMES) {
      setOshiThemeKey(saved);
      return;
    }
    setOshiThemeKey(DEFAULT_HOLO_THEME);
  }, []);

  const top = useMemo(() => favorites.filter((f) => f.favorite_level === "最推し").length, [favorites]);
  const theme = HOLO_OSHI_THEMES[oshiThemeKey];

  const holoVars = {
    ["--holo-accent" as string]: theme.accent,
    ["--holo-accent-strong" as string]: theme.accentStrong,
    ["--holo-soft" as string]: theme.soft,
    ["--holo-soft-border" as string]: theme.softBorder,
  } as CSSProperties;

  function applyTheme(next: HoloThemeKey) {
    setOshiThemeKey(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("lifeos-holo-theme", next);
      window.dispatchEvent(new Event("lifeos:holo-theme-change"));
    }
  }

  async function handleSaveProfile() {
    await saveHoloProfile({
      holo_name: holoName,
      fan_since: fanSince,
      favorite_member: favoriteMember,
      oshi_intro: oshiIntro,
      favorite_points: favoritePoints,
      visibility: profileVisibility,
    });
    await loadAll();
  }

  return (
    <div className="space-y-8 text-slate-900" style={holoVars}>
      <section
        className="holo-hero-card rounded-3xl border p-6 shadow-xl"
        style={{ backgroundImage: theme.heroGradient, borderColor: theme.softBorder }}
      >
        <p className="text-sm font-semibold text-cyan-200">推し活を整理して深める場所</p>
        <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ホロ活</h1>
            <p className="mt-2 text-sm text-slate-900/80">
              今日は {theme.emoji} {theme.label} でテンションを上げるモードです。
            </p>
          </div>
          <div className="holo-theme-chip rounded-2xl border px-4 py-3 text-sm shadow-sm">
            <div className="font-semibold">推しカラー</div>
            <div className="mt-1 text-slate-600">{theme.label}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="最推し" value={String(top)} />
          <StatCard label="推し" value={String(favorites.length)} />
          <StatCard label="後で見る" value={String(watchlist.length)} />
          <StatCard label="名場面" value={String(highlights.length)} />
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="ホロプロフィール" desc="自分のホロ活の入口">
          <Input label="ホロネーム" value={holoName} onChange={setHoloName} />
          <Input label="ファン歴" value={fanSince} onChange={setFanSince} />
          <Input label="最推し" value={favoriteMember} onChange={setFavoriteMember} />
          <Textarea label="推し紹介" value={oshiIntro} onChange={setOshiIntro} />
          <Textarea label="好きなポイント" value={favoritePoints} onChange={setFavoritePoints} />
          <Select label="表示範囲" value={profileVisibility} onChange={(v) => setProfileVisibility(v as Visibility)} options={["private", "partner", "public"]} />
          <PrimaryButton onClick={handleSaveProfile}>プロフィールを保存</PrimaryButton>
        </Panel>

        <Panel title="推しカラー" desc="自分だけテンションが上がる色に変える">
          <div className="grid gap-3 md:grid-cols-2">
            {(Object.entries(HOLO_OSHI_THEMES) as Array<[HoloThemeKey, (typeof HOLO_OSHI_THEMES)[HoloThemeKey]]>).map(([key, item]) => {
              const active = key === oshiThemeKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyTheme(key)}
                  className="rounded-2xl border p-4 text-left transition"
                  style={{
                    background: item.headerGradient,
                    borderColor: active ? item.accent : "#e2e8f0",
                    boxShadow: active ? `0 0 0 2px ${item.accent}22` : "0 1px 2px rgba(15,23,42,0.03)",
                  }}
                >
                  <div className="text-lg font-semibold text-slate-900">{item.emoji} {item.label}</div>
                  <div className="mt-2 flex gap-2">
                    <span className="h-4 w-10 rounded-full border border-white/80" style={{ background: item.accent }} />
                    <span className="h-4 w-10 rounded-full border border-white/80" style={{ background: item.softBorder }} />
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton onClick={() => { applyTheme(oshiThemeKey); setThemeMessage("推しカラーを保存しました。ホロ活ヘッダーにも反映しています。"); }}>
              推しカラーを保存
            </PrimaryButton>
            {themeMessage ? <span className="text-sm text-slate-600">{themeMessage}</span> : null}
          </div>
        </Panel>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="推し管理" desc="最推し・推し・気になるを整理">
          <Input label="メンバー名" value={memberName} onChange={setMemberName} />
          <Select label="推し区分" value={favoriteLevel} onChange={setFavoriteLevel} options={["最推し", "推し", "気になる"]} />
          <Textarea label="好きな理由" value={reason} onChange={setReason} />
          <PrimaryButton onClick={async () => { if (!memberName.trim()) return; await addHoloFavorite({ member_name: memberName, favorite_level: favoriteLevel, reason, recent_heat: 4, visibility: "private" }); setMemberName(""); setReason(""); await loadAll(); }}>
            推しを追加
          </PrimaryButton>
        </Panel>

        <Panel title="ホロ活記録" desc="見た・聴いた・感じたを残す">
          <Input label="タイトル" value={activityTitle} onChange={setActivityTitle} />
          <Select label="種別" value={activityType} onChange={setActivityType} options={["配信", "切り抜き", "歌", "MV", "ライブ", "グッズ", "イベント", "メモ"]} />
          <Input label="メンバー" value={activityMember} onChange={setActivityMember} />
          <Textarea label="感想" value={activityMemo} onChange={setActivityMemo} />
          <PrimaryButton onClick={async () => { if (!activityTitle.trim()) return; await addHoloActivityLog({ title: activityTitle, content_type: activityType, member_name: activityMember, memo: activityMemo, visibility: "private" }); setActivityTitle(""); setActivityMember(""); setActivityMemo(""); await loadAll(); }}>
            ホロ活記録を保存
          </PrimaryButton>
        </Panel>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="後で見る" desc="後で見たいものを整理">
          <Input label="タイトル" value={watchTitle} onChange={setWatchTitle} />
          <Input label="メンバー" value={watchMember} onChange={setWatchMember} />
          <PrimaryButton onClick={async () => { if (!watchTitle.trim()) return; await addHoloWatchlist({ title: watchTitle, member_name: watchMember, content_type: "切り抜き", priority: "中", visibility: "private" }); setWatchTitle(""); setWatchMember(""); await loadAll(); }}>
            後で見るに追加
          </PrimaryButton>
        </Panel>

        <Panel title="名場面ライブラリ" desc="神回・爆笑・癒やしを残す">
          <Input label="タイトル" value={highlightTitle} onChange={setHighlightTitle} />
          <Input label="メンバー" value={highlightMember} onChange={setHighlightMember} />
          <PrimaryButton onClick={async () => { if (!highlightTitle.trim()) return; await addHoloHighlight({ title: highlightTitle, member_name: highlightMember, category: "神回", favorite_score: 5, visibility: "private" }); setHighlightTitle(""); setHighlightMember(""); await loadAll(); }}>
            名場面を保存
          </PrimaryButton>
        </Panel>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="最近の推し" desc="推し情報の一覧">
          <div className="space-y-3">
            {favorites.length === 0 ? (
              <EmptyCard text="まだ推しが登録されていません。" />
            ) : (
              favorites.map((item) => (
                <ListCard
                  key={item.id}
                  title={item.member_name}
                  subtitle={item.favorite_level}
                  meta={visibilityLabel[(item.visibility as Visibility) ?? "private"]}
                  body={item.reason || ""}
                />
              ))
            )}
          </div>
        </Panel>
        <Panel title="最近のホロ活" desc="新しい順に見返す">
          <div className="space-y-3">
            {activityLogs.length === 0 ? (
              <EmptyCard text="まだホロ活記録がありません。" />
            ) : (
              activityLogs.map((item) => (
                <ListCard
                  key={item.id}
                  title={item.title}
                  subtitle={`${item.content_type} / ${item.member_name || "メンバー未設定"}`}
                  meta={item.watched_on || ""}
                  body={item.memo || ""}
                />
              ))
            )}
          </div>
        </Panel>
      </div>

      <Panel title="名場面一覧" desc="残した場面をまとめて見返す">
        <div className="space-y-3">
          {highlights.length === 0 ? (
            <EmptyCard text="まだ名場面がありません。" />
          ) : (
            highlights.map((item) => (
              <ListCard
                key={item.id}
                title={item.title}
                subtitle={`${item.category || "神回"} / ${item.member_name || "メンバー未設定"}`}
                meta={visibilityLabel[(item.visibility as Visibility) ?? "private"]}
                body={item.memo || ""}
              />
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}

function Panel({ title, desc, children }: { title: string; desc: string; children: ReactNode; }) {
  return (
    <section className="lifeos-panel rounded-3xl border p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{desc}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="holo-theme-stat rounded-2xl border px-4 py-3 text-center shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="holo-theme-accent mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void; }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-cyan-400" />
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void; }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-cyan-400" />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[]; }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-cyan-400">
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}

function PrimaryButton({ children, onClick }: { children: ReactNode; onClick: () => void; }) {
  return (
    <button type="button" onClick={onClick} className="holo-theme-button rounded-2xl px-4 py-3 text-sm font-semibold transition">
      {children}
    </button>
  );
}

function EmptyCard({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">{text}</div>;
}

function ListCard({ title, subtitle, meta, body }: { title: string; subtitle: string; meta: string; body: string; }) {
  return (
    <div className="lifeos-card rounded-2xl border p-4">
      <div className="flex flex-col gap-1">
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="holo-theme-accent text-sm font-medium">{subtitle}</div>
        <div className="text-xs text-slate-500">{meta}</div>
      </div>
      {body ? <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{body}</div> : null}
    </div>
  );
}
