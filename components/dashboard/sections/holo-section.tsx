"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  addHoloActivityLog,
  addHoloFavorite,
  addHoloWatchlist,
  deleteHoloActivityLog,
  deleteHoloFavorite,
  deleteHoloWatchlist,
  getHoloActivityLogs,
  getHoloFavorites,
  getHoloProfile,
  getHoloWatchlist,
  saveHoloProfile,
  updateHoloActivityLog,
  updateHoloFavorite,
  updateHoloWatchlist,
  uploadHoloImage,
} from "@/lib/life-os/holo";
import { DEFAULT_HOLO_THEME, HOLO_OSHI_THEMES, type HoloThemeKey } from "@/lib/life-os/constants";

type Visibility = "private" | "partner" | "public";

const visibilityLabel: Record<Visibility, string> = { private: "自分用", partner: "共有OK", public: "公開OK" };

export default function HoloSection() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [holoName, setHoloName] = useState("");
  const [fanSince, setFanSince] = useState("");
  const [favoriteMember, setFavoriteMember] = useState("");
  const [oshiIntro, setOshiIntro] = useState("");
  const [favoritePoints, setFavoritePoints] = useState("");
  const [profileVisibility, setProfileVisibility] = useState<Visibility>("private");
  const [oshiThemeKey, setOshiThemeKey] = useState<HoloThemeKey>(DEFAULT_HOLO_THEME);
  const [themeMessage, setThemeMessage] = useState("");
  const [msg, setMsg] = useState("");

  const [memberName, setMemberName] = useState("");
  const [favoriteLevel, setFavoriteLevel] = useState("最推し");
  const [reason, setReason] = useState("");
  const [editingFavoriteId, setEditingFavoriteId] = useState<string | null>(null);

  const [activityTitle, setActivityTitle] = useState("");
  const [activityType, setActivityType] = useState("ライブ");
  const [activityMember, setActivityMember] = useState("");
  const [activityPlace, setActivityPlace] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [activityMemo, setActivityMemo] = useState("");
  const [activitySatisfaction, setActivitySatisfaction] = useState("5");
  const [activityPhoto, setActivityPhoto] = useState<File | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  const [watchTitle, setWatchTitle] = useState("");
  const [watchMember, setWatchMember] = useState("");
  const [watchUrl, setWatchUrl] = useState("");
  const [watchMemo, setWatchMemo] = useState("");
  const [watchTag, setWatchTag] = useState("");
  const [editingWatchId, setEditingWatchId] = useState<string | null>(null);

  async function loadAll() {
    const [p, f, a, w] = await Promise.all([getHoloProfile(), getHoloFavorites(), getHoloActivityLogs(), getHoloWatchlist()]);
    setFavorites(f.data ?? []);
    setActivityLogs(a.data ?? []);
    setWatchlist(w.data ?? []);
    if (p.data) {
      setHoloName(p.data.holo_name ?? "");
      setFanSince(p.data.fan_since ?? "");
      setFavoriteMember(p.data.favorite_member ?? "");
      setOshiIntro(p.data.oshi_intro ?? "");
      setFavoritePoints(p.data.favorite_points ?? "");
      setProfileVisibility((p.data.visibility as Visibility) ?? "private");
    }
  }

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { const saved = typeof window !== "undefined" ? window.localStorage.getItem("lifeos-holo-theme") as HoloThemeKey | null : null; if (saved && saved in HOLO_OSHI_THEMES) setOshiThemeKey(saved); }, []);

  const top = useMemo(() => favorites.filter((f) => f.favorite_level === "最推し").length, [favorites]);
  const theme = HOLO_OSHI_THEMES[oshiThemeKey];
  const holoVars = { ["--holo-accent" as string]: theme.accent, ["--holo-accent-strong" as string]: theme.accentStrong, ["--holo-soft" as string]: theme.soft, ["--holo-soft-border" as string]: theme.softBorder } as CSSProperties;

  function applyTheme(next: HoloThemeKey) { setOshiThemeKey(next); if (typeof window !== "undefined") { window.localStorage.setItem("lifeos-holo-theme", next); window.dispatchEvent(new Event("lifeos:holo-theme-change")); } }
  async function handleSaveProfile() { await saveHoloProfile({ holo_name: holoName, fan_since: fanSince, favorite_member: favoriteMember, oshi_intro: oshiIntro, favorite_points: favoritePoints, visibility: profileVisibility }); setMsg("プロフィールを保存しました。"); await loadAll(); }

  function resetFavoriteForm() { setMemberName(""); setFavoriteLevel("最推し"); setReason(""); setEditingFavoriteId(null); }
  async function saveFavorite() { if (!memberName.trim()) return; const payload = { member_name: memberName, favorite_level: favoriteLevel, reason, recent_heat: 4, visibility: "private" }; if (editingFavoriteId) await updateHoloFavorite(editingFavoriteId, payload); else await addHoloFavorite(payload); resetFavoriteForm(); await loadAll(); }
  function startEditFavorite(item: any) { setEditingFavoriteId(item.id); setMemberName(item.member_name ?? ""); setFavoriteLevel(item.favorite_level ?? "推し"); setReason(item.reason ?? ""); }
  async function removeFavorite(id: string) { if (!confirm("この推し情報を削除しますか？")) return; await deleteHoloFavorite(id); await loadAll(); }

  function resetActivityForm() { setActivityTitle(""); setActivityType("ライブ"); setActivityMember(""); setActivityPlace(""); setActivityDate(""); setActivityMemo(""); setActivitySatisfaction("5"); setActivityPhoto(null); setEditingActivityId(null); }
  async function saveActivity() { if (!activityTitle.trim()) return; let imagePath: string | null = null; if (activityPhoto) imagePath = await uploadHoloImage(activityPhoto); const payload: any = { title: activityTitle, content_type: activityType, member_name: activityMember, watched_on: activityDate || null, memo: activityMemo, best_point: activityPlace, emo_score: Number(activitySatisfaction), visibility: "private" }; if (imagePath) payload.image_path = imagePath; if (editingActivityId) await updateHoloActivityLog(editingActivityId, payload); else await addHoloActivityLog(payload); resetActivityForm(); await loadAll(); }
  function startEditActivity(item: any) { setEditingActivityId(item.id); setActivityTitle(item.title ?? ""); setActivityType(item.content_type ?? "ライブ"); setActivityMember(item.member_name ?? ""); setActivityPlace(item.best_point ?? ""); setActivityDate(item.watched_on ?? ""); setActivityMemo(item.memo ?? ""); setActivitySatisfaction(String(item.emo_score ?? 5)); setActivityPhoto(null); }
  async function removeActivity(id: string) { if (!confirm("このホロ活記録を削除しますか？")) return; await deleteHoloActivityLog(id); await loadAll(); }

  function resetWatchForm() { setWatchTitle(""); setWatchMember(""); setWatchUrl(""); setWatchMemo(""); setWatchTag(""); setEditingWatchId(null); }
  async function saveWatch() { if (!watchTitle.trim()) return; const payload = { title: watchTitle, member_name: watchMember, content_type: "参考メモ", url: watchUrl, mood_tag: watchTag, priority: "中", visibility: "private", memo: watchMemo }; if (editingWatchId) await updateHoloWatchlist(editingWatchId, payload); else await addHoloWatchlist(payload); resetWatchForm(); await loadAll(); }
  function startEditWatch(item: any) { setEditingWatchId(item.id); setWatchTitle(item.title ?? ""); setWatchMember(item.member_name ?? ""); setWatchUrl(item.url ?? ""); setWatchMemo(item.memo ?? ""); setWatchTag(item.mood_tag ?? ""); }
  async function removeWatch(id: string) { if (!confirm("この参考メモを削除しますか？")) return; await deleteHoloWatchlist(id); await loadAll(); }

  return <div className="space-y-8 text-slate-900" style={holoVars}>
    <section className="holo-hero-card rounded-3xl border p-6 shadow-xl" style={{ backgroundImage: theme.heroGradient, borderColor: theme.softBorder }}>
      <p className="text-sm font-semibold text-cyan-200">リアルの推し活を残して、次の行動につなげる場所</p>
      <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="text-3xl font-bold tracking-tight">ホロ活</h1><p className="mt-2 text-sm text-slate-900/80">ライブ・聖地・グッズ・体験を写真付きで残すモードです。</p></div><div className="holo-theme-chip rounded-2xl border px-4 py-3 text-sm shadow-sm"><div className="font-semibold">現在の推しカラー</div><div className="mt-1 text-slate-600">{theme.emoji} {theme.label}</div></div></div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4"><StatCard label="最推し" value={String(top)} /><StatCard label="推し" value={String(favorites.length)} /><StatCard label="ホロ活記録" value={String(activityLogs.length)} /><StatCard label="参考メモ" value={String(watchlist.length)} /></div>
    </section>
    {msg ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{msg}</div> : null}

    <Panel title="ホロプロフィール" desc="自分のホロ活の入口"><Input label="ホロネーム" value={holoName} onChange={setHoloName} /><Input label="ファン歴" value={fanSince} onChange={setFanSince} /><Input label="最推し" value={favoriteMember} onChange={setFavoriteMember} /><Textarea label="推し紹介" value={oshiIntro} onChange={setOshiIntro} /><Textarea label="好きなポイント" value={favoritePoints} onChange={setFavoritePoints} /><Select label="表示範囲" value={profileVisibility} onChange={(v) => setProfileVisibility(v as Visibility)} options={["private", "partner", "public"]} /><PrimaryButton onClick={handleSaveProfile}>プロフィールを保存</PrimaryButton></Panel>

    <div className="grid gap-8 xl:grid-cols-2">
      <Panel title="最近の推し" desc="追加・編集・削除ができます"><Input label="メンバー名" value={memberName} onChange={setMemberName} /><Select label="推し区分" value={favoriteLevel} onChange={setFavoriteLevel} options={["最推し", "推し", "気になる"]} /><Textarea label="好きな理由" value={reason} onChange={setReason} /><div className="flex flex-wrap gap-2"><PrimaryButton onClick={saveFavorite}>{editingFavoriteId ? "推しを更新" : "推しを追加"}</PrimaryButton>{editingFavoriteId ? <SecondaryButton onClick={resetFavoriteForm}>キャンセル</SecondaryButton> : null}</div><div className="space-y-3">{favorites.length === 0 ? <EmptyCard text="まだ推しが登録されていません。" /> : favorites.map((item) => <EditableCard key={item.id} title={item.member_name} subtitle={item.favorite_level} body={item.reason || ""} onEdit={() => startEditFavorite(item)} onDelete={() => removeFavorite(item.id)} />)}</div></Panel>
      <Panel title="ホロ活記録" desc="ライブ・聖地・グッズ・体験を写真付きで残す"><Input label="タイトル" value={activityTitle} onChange={setActivityTitle} /><Select label="種別" value={activityType} onChange={setActivityType} options={["ライブ", "イベント", "グッズ", "聖地巡礼", "同じ体験", "コラボ", "メモ"]} /><Input label="メンバー" value={activityMember} onChange={setActivityMember} /><Input label="日付" value={activityDate} onChange={setActivityDate} type="date" /><Input label="場所・体験内容" value={activityPlace} onChange={setActivityPlace} /><Select label="満足度" value={activitySatisfaction} onChange={setActivitySatisfaction} options={["5", "4", "3", "2", "1"]} /><FileInput label="写真" onChange={setActivityPhoto} /><Textarea label="感想" value={activityMemo} onChange={setActivityMemo} /><div className="flex flex-wrap gap-2"><PrimaryButton onClick={saveActivity}>{editingActivityId ? "ホロ活記録を更新" : "ホロ活記録を保存"}</PrimaryButton>{editingActivityId ? <SecondaryButton onClick={resetActivityForm}>キャンセル</SecondaryButton> : null}</div></Panel>
    </div>

    <Panel title="参考にしたい推し活メモ" desc="他のファンの良い投稿・飾り方・聖地巡礼・行動をメモ"><Input label="タイトル" value={watchTitle} onChange={setWatchTitle} /><Input label="関連メンバー" value={watchMember} onChange={setWatchMember} /><Input label="URL" value={watchUrl} onChange={setWatchUrl} /><Input label="タグ" value={watchTag} onChange={setWatchTag} /><Textarea label="参考にしたい内容" value={watchMemo} onChange={setWatchMemo} /><div className="flex flex-wrap gap-2"><PrimaryButton onClick={saveWatch}>{editingWatchId ? "参考メモを更新" : "参考メモを追加"}</PrimaryButton>{editingWatchId ? <SecondaryButton onClick={resetWatchForm}>キャンセル</SecondaryButton> : null}</div><div className="space-y-3">{watchlist.length === 0 ? <EmptyCard text="まだ参考メモがありません。" /> : watchlist.map((item) => <EditableCard key={item.id} title={item.title} subtitle={`${item.member_name || "メンバー未設定"} / ${item.mood_tag || "タグなし"}`} body={item.memo || item.url || ""} onEdit={() => startEditWatch(item)} onDelete={() => removeWatch(item.id)} />)}</div></Panel>

    <Panel title="最近のホロ活" desc="写真付きで新しい順に見返す"><div className="space-y-3">{activityLogs.length === 0 ? <EmptyCard text="まだホロ活記録がありません。" /> : activityLogs.map((item) => <ActivityCard key={item.id} item={item} onEdit={() => startEditActivity(item)} onDelete={() => removeActivity(item.id)} />)}</div></Panel>

    <Panel title="推しカラー" desc="一番下で色を選びます"><div className="grid gap-3 md:grid-cols-2">{(Object.entries(HOLO_OSHI_THEMES) as Array<[HoloThemeKey, (typeof HOLO_OSHI_THEMES)[HoloThemeKey]]>).map(([key, item]) => { const active = key === oshiThemeKey; return <button key={key} type="button" onClick={() => applyTheme(key)} className="rounded-2xl border p-4 text-left transition" style={{ background: item.headerGradient, borderColor: active ? item.accent : "#e2e8f0", boxShadow: active ? `0 0 0 2px ${item.accent}22` : "0 1px 2px rgba(15,23,42,0.03)" }}><div className="text-lg font-semibold text-slate-900">{item.emoji} {item.label}</div><div className="mt-2 flex gap-2"><span className="h-4 w-10 rounded-full border border-white/80" style={{ background: item.accent }} /><span className="h-4 w-10 rounded-full border border-white/80" style={{ background: item.softBorder }} /></div></button>; })}</div><div className="flex flex-wrap items-center gap-3"><PrimaryButton onClick={() => { applyTheme(oshiThemeKey); setThemeMessage("推しカラーを保存しました。"); }}>推しカラーを保存</PrimaryButton>{themeMessage ? <span className="text-sm text-slate-600">{themeMessage}</span> : null}</div></Panel>
  </div>;
}

function Panel({ title, desc, children }: { title: string; desc: string; children: ReactNode; }) { return <section className="lifeos-panel rounded-3xl border p-6 shadow-sm"><div className="mb-5"><h2 className="text-xl font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{desc}</p></div><div className="space-y-4">{children}</div></section>; }
function StatCard({ label, value }: { label: string; value: string }) { return <div className="holo-theme-stat rounded-2xl border px-4 py-3 text-center shadow-sm"><div className="text-xs text-slate-500">{label}</div><div className="holo-theme-accent mt-1 text-xl font-bold">{value}</div></div>; }
function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string; }) { return <label className="block"><div className="mb-2 text-sm font-medium text-slate-700">{label}</div><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-cyan-400" /></label>; }
function FileInput({ label, onChange }: { label: string; onChange: (file: File | null) => void; }) { return <label className="block"><div className="mb-2 text-sm font-medium text-slate-700">{label}</div><input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0] ?? null)} className="block w-full rounded-2xl border px-4 py-3 text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-900" /></label>; }
function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void; }) { return <label className="block"><div className="mb-2 text-sm font-medium text-slate-700">{label}</div><textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-cyan-400" /></label>; }
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[]; }) { return <label className="block"><div className="mb-2 text-sm font-medium text-slate-700">{label}</div><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-cyan-400">{options.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>; }
function PrimaryButton({ children, onClick }: { children: ReactNode; onClick: () => void; }) { return <button type="button" onClick={onClick} className="holo-theme-button rounded-2xl px-4 py-3 text-sm font-semibold transition">{children}</button>; }
function SecondaryButton({ children, onClick }: { children: ReactNode; onClick: () => void; }) { return <button type="button" onClick={onClick} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">{children}</button>; }
function EmptyCard({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">{text}</div>; }
function EditableCard({ title, subtitle, body, onEdit, onDelete }: { title: string; subtitle: string; body: string; onEdit: () => void; onDelete: () => void; }) { return <div className="lifeos-card rounded-2xl border p-4"><div className="font-semibold text-slate-900">{title}</div><div className="holo-theme-accent text-sm font-medium">{subtitle}</div>{body ? <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{body}</div> : null}<div className="mt-3 flex gap-2"><SecondaryButton onClick={onEdit}>編集</SecondaryButton><button type="button" onClick={onDelete} className="rounded-2xl bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-700">削除</button></div></div>; }
function ActivityCard({ item, onEdit, onDelete }: { item: any; onEdit: () => void; onDelete: () => void; }) { return <div className="lifeos-card rounded-2xl border p-4">{item.image_url ? <img src={item.image_url} alt={item.title} className="mb-4 max-h-72 w-full rounded-2xl object-cover" /> : null}<div className="font-semibold text-slate-900">{item.title}</div><div className="holo-theme-accent text-sm font-medium">{item.content_type} / {item.member_name || "メンバー未設定"}</div><div className="text-xs text-slate-500">{item.watched_on || "日付未設定"} {item.best_point ? ` / ${item.best_point}` : ""}</div>{item.memo ? <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{item.memo}</div> : null}<div className="mt-3 flex gap-2"><SecondaryButton onClick={onEdit}>編集</SecondaryButton><button type="button" onClick={onDelete} className="rounded-2xl bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-700">削除</button></div></div>; }
