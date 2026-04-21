import { createClient } from "@/lib/supabase";
import type {
  DrinkReview,
  HobbyArchiveItem,
  HoloActivity,
  HoloHighlight,
  HoloOshi,
  HoloProfile,
  HoloWatchLater,
  Visibility,
} from "./types";

const supabase = createClient();

export const VISIBILITY_OPTIONS: { label: string; value: Visibility }[] = [
  { label: "自分用", value: "private" },
  { label: "共有OK", value: "partner" },
  { label: "公開OK", value: "public" },
];

export function buildAutoTags(text: string): string[] {
  const rules: Array<[RegExp, string]> = [
    [/(仕事|残業|会議|出社)/i, "#仕事"],
    [/(彼女|デート|二人|同棲|結婚)/i, "#関係"],
    [/(筋トレ|ジム|運動)/i, "#筋トレ"],
    [/(改善|反省|振り返り)/i, "#改善"],
    [/(お金|支出|家計|予算)/i, "#お金"],
    [/(ホロ|hololive|配信|切り抜き|推し)/i, "#ホロ活"],
    [/(酒|ビール|ワイン|日本酒|ハイボール)/i, "#お酒"],
  ];
  return [...new Set(rules.filter(([re]) => re.test(text)).map(([, tag]) => tag))];
}

export async function listHobbyArchive() {
  const { data, error } = await supabase
    .from("life_os_hobby_archive")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as HobbyArchiveItem[];
}

export async function createHobbyArchiveItem(payload: Omit<HobbyArchiveItem, "id" | "created_at" | "auto_tags">) {
  const text = `${payload.title} ${payload.quick_note ?? ""} ${payload.best_point ?? ""} ${payload.weak_point ?? ""}`;
  const auto_tags = buildAutoTags(text);
  const { error } = await supabase.from("life_os_hobby_archive").insert({ ...payload, auto_tags });
  if (error) throw error;
}

export async function listDrinkReviews() {
  const { data, error } = await supabase
    .from("life_os_drink_reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DrinkReview[];
}

export async function createDrinkReview(payload: Omit<DrinkReview, "id" | "created_at">) {
  const { error } = await supabase.from("life_os_drink_reviews").insert(payload);
  if (error) throw error;
}

export async function getHoloProfile() {
  const { data, error } = await supabase.from("life_os_holo_profile").select("*").maybeSingle();
  if (error) throw error;
  return data as HoloProfile | null;
}

export async function upsertHoloProfile(payload: Omit<HoloProfile, "updated_at">) {
  const { error } = await supabase.from("life_os_holo_profile").upsert(payload, { onConflict: "user_id" });
  if (error) throw error;
}

export async function listHoloOshi() {
  const { data, error } = await supabase
    .from("life_os_holo_oshi")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as HoloOshi[];
}

export async function createHoloOshi(payload: Omit<HoloOshi, "id" | "created_at">) {
  const { error } = await supabase.from("life_os_holo_oshi").insert(payload);
  if (error) throw error;
}

export async function listHoloActivities() {
  const { data, error } = await supabase
    .from("life_os_holo_activities")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as HoloActivity[];
}

export async function createHoloActivity(payload: Omit<HoloActivity, "id" | "created_at">) {
  const { error } = await supabase.from("life_os_holo_activities").insert(payload);
  if (error) throw error;
}

export async function listHoloWatchLater() {
  const { data, error } = await supabase
    .from("life_os_holo_watch_later")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as HoloWatchLater[];
}

export async function createHoloWatchLater(payload: Omit<HoloWatchLater, "id" | "created_at">) {
  const { error } = await supabase.from("life_os_holo_watch_later").insert(payload);
  if (error) throw error;
}

export async function listHoloHighlights() {
  const { data, error } = await supabase
    .from("life_os_holo_highlights")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as HoloHighlight[];
}

export async function createHoloHighlight(payload: Omit<HoloHighlight, "id" | "created_at">) {
  const { error } = await supabase.from("life_os_holo_highlights").insert(payload);
  if (error) throw error;
}
