import { createClient } from "@/lib/supabase";

export type Visibility = "private" | "partner" | "public";

async function getAuthedUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインしていません");
  return { supabase, userId: user.id };
}

export async function getHoloProfile() {
  const supabase = createClient();
  return await supabase
    .from("holo_profiles")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
}

export async function saveHoloProfile(data: {
  holo_name?: string;
  fan_since?: string;
  favorite_member?: string;
  oshi_intro?: string;
  favorite_points?: string;
  visibility?: Visibility;
}) {
  const { supabase, userId } = await getAuthedUserId();

  const { data: existing } = await supabase
    .from("holo_profiles")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    return await supabase
      .from("holo_profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  }

  return await supabase.from("holo_profiles").insert({ user_id: userId, ...data });
}

export async function getHoloFavorites() {
  const supabase = createClient();
  return await supabase.from("holo_favorites").select("*").order("created_at", { ascending: false });
}

export async function addHoloFavorite(data: {
  member_name: string;
  favorite_level: string;
  reason?: string;
  charm_points?: string;
  recent_heat?: number;
  visibility?: Visibility;
}) {
  const { supabase, userId } = await getAuthedUserId();
  return await supabase.from("holo_favorites").insert({ user_id: userId, ...data });
}

export async function getHoloActivityLogs() {
  const supabase = createClient();
  return await supabase.from("holo_activity_logs").select("*").order("created_at", { ascending: false });
}

export async function addHoloActivityLog(data: {
  title: string;
  content_type: string;
  member_name?: string;
  watched_on?: string | null;
  url?: string;
  memo?: string;
  best_point?: string;
  emo_score?: number;
  laugh_score?: number;
  healing_score?: number;
  rewatch_score?: number;
  is_train_friendly?: boolean;
  visibility?: Visibility;
}) {
  const { supabase, userId } = await getAuthedUserId();
  return await supabase.from("holo_activity_logs").insert({ user_id: userId, ...data });
}

export async function getHoloWatchlist() {
  const supabase = createClient();
  return await supabase.from("holo_watchlist").select("*").order("created_at", { ascending: false });
}

export async function addHoloWatchlist(data: {
  title: string;
  member_name?: string;
  content_type?: string;
  url?: string;
  priority?: string;
  duration_minutes?: number | null;
  mood_tag?: string;
  is_train_friendly?: boolean;
  visibility?: Visibility;
}) {
  const { supabase, userId } = await getAuthedUserId();
  return await supabase.from("holo_watchlist").insert({ user_id: userId, ...data });
}

export async function getHoloHighlights() {
  const supabase = createClient();
  return await supabase.from("holo_highlights").select("*").order("created_at", { ascending: false });
}

export async function addHoloHighlight(data: {
  title: string;
  member_name?: string;
  category?: string;
  memo?: string;
  url?: string;
  favorite_score?: number;
  is_train_friendly?: boolean;
  visibility?: Visibility;
}) {
  const { supabase, userId } = await getAuthedUserId();
  return await supabase.from("holo_highlights").insert({ user_id: userId, ...data });
}
