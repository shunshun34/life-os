import { createClient } from "@/lib/supabase";

async function userId() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("ログインしていません");
  return { supabase, userId: data.user.id };
}

export async function getHoloProfile() {
  const { supabase } = await userId();
  return await supabase.from("holo_profiles").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle();
}

export async function saveHoloProfile(data: any) {
  const { supabase, userId: uid } = await userId();
  const { data: existing } = await supabase.from("holo_profiles").select("id").eq("user_id", uid).maybeSingle();
  if (existing?.id) {
    return await supabase.from("holo_profiles").update({ ...data, updated_at: new Date().toISOString() }).eq("id", existing.id);
  }
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

export async function getHoloActivityLogs() {
  const { supabase } = await userId();
  return await supabase.from("holo_activity_logs").select("*").order("created_at", { ascending: false });
}

export async function addHoloActivityLog(data: any) {
  const { supabase, userId: uid } = await userId();
  return await supabase.from("holo_activity_logs").insert({ user_id: uid, ...data });
}

export async function getHoloWatchlist() {
  const { supabase } = await userId();
  return await supabase.from("holo_watchlist").select("*").order("created_at", { ascending: false });
}

export async function addHoloWatchlist(data: any) {
  const { supabase, userId: uid } = await userId();
  return await supabase.from("holo_watchlist").insert({ user_id: uid, ...data });
}

export async function getHoloHighlights() {
  const { supabase } = await userId();
  return await supabase.from("holo_highlights").select("*").order("created_at", { ascending: false });
}

export async function addHoloHighlight(data: any) {
  const { supabase, userId: uid } = await userId();
  return await supabase.from("holo_highlights").insert({ user_id: uid, ...data });
}
