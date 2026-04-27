import { createClient } from "@/lib/supabase";

const HOLO_IMAGE_BUCKET = "trip-images";

async function userId() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("ログインしていません");
  return { supabase, userId: data.user.id };
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadHoloImage(file: File) {
  const { supabase, userId: uid } = await userId();
  const path = `${uid}/holo/${Date.now()}-${sanitizeFileName(file.name)}`;
  const result = await supabase.storage.from(HOLO_IMAGE_BUCKET).upload(path, file, { upsert: false });
  if (result.error) throw new Error(`ホロ活写真アップロード失敗: ${result.error.message}`);
  return path;
}

export async function createHoloImageUrl(path: string | null) {
  if (!path) return null;
  const { supabase } = await userId();
  const result = await supabase.storage.from(HOLO_IMAGE_BUCKET).createSignedUrl(path, 60 * 60 * 24);
  if (result.error) return null;
  return result.data.signedUrl;
}

export async function getHoloProfile() {
  const { supabase } = await userId();
  return await supabase.from("holo_profiles").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle();
}

export async function saveHoloProfile(data: any) {
  const { supabase, userId: uid } = await userId();
  const { data: existing } = await supabase.from("holo_profiles").select("id").eq("user_id", uid).maybeSingle();
  if (existing?.id) return await supabase.from("holo_profiles").update({ ...data, updated_at: new Date().toISOString() }).eq("id", existing.id);
  return await supabase.from("holo_profiles").insert({ user_id: uid, ...data });
}

export async function getHoloFavorites() {
  const { supabase } = await userId();
  return await supabase.from("holo_favorites").select("*").order("created_at", { ascending: false });
}

export async function addHoloFavorite(data: any) {
  const { supabase, userId: uid } = await userId();
  return await supabase.from("holo_favorites").insert({ user_id: uid, ...data });
}

export async function updateHoloFavorite(id: string, data: any) {
  const { supabase } = await userId();
  return await supabase.from("holo_favorites").update(data).eq("id", id);
}

export async function deleteHoloFavorite(id: string) {
  const { supabase } = await userId();
  return await supabase.from("holo_favorites").delete().eq("id", id);
}

export async function getHoloActivityLogs() {
  const { supabase } = await userId();
  const result = await supabase.from("holo_activity_logs").select("*").order("created_at", { ascending: false });
  if (result.error) return result;
  const enriched = await Promise.all((result.data ?? []).map(async (row: any) => ({ ...row, image_url: await createHoloImageUrl(row.image_path ?? null) })));
  return { ...result, data: enriched };
}

export async function addHoloActivityLog(data: any) {
  const { supabase, userId: uid } = await userId();
  return await supabase.from("holo_activity_logs").insert({ user_id: uid, ...data });
}

export async function updateHoloActivityLog(id: string, data: any) {
  const { supabase } = await userId();
  return await supabase.from("holo_activity_logs").update(data).eq("id", id);
}

export async function deleteHoloActivityLog(id: string) {
  const { supabase } = await userId();
  return await supabase.from("holo_activity_logs").delete().eq("id", id);
}

export async function getHoloWatchlist() {
  const { supabase } = await userId();
  return await supabase.from("holo_watchlist").select("*").order("created_at", { ascending: false });
}

export async function addHoloWatchlist(data: any) {
  const { supabase, userId: uid } = await userId();
  return await supabase.from("holo_watchlist").insert({ user_id: uid, ...data });
}

export async function updateHoloWatchlist(id: string, data: any) {
  const { supabase } = await userId();
  return await supabase.from("holo_watchlist").update(data).eq("id", id);
}

export async function deleteHoloWatchlist(id: string) {
  const { supabase } = await userId();
  return await supabase.from("holo_watchlist").delete().eq("id", id);
}

export async function getHoloHighlights() {
  const { supabase } = await userId();
  return await supabase.from("holo_highlights").select("*").order("created_at", { ascending: false });
}

export async function addHoloHighlight(data: any) {
  const { supabase, userId: uid } = await userId();
  return await supabase.from("holo_highlights").insert({ user_id: uid, ...data });
}
