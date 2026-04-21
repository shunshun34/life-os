import { createClient } from "@/lib/supabase";

const BUCKET = "trip-images";

export type WallpaperSetting = {
  preset?: string | null;
  custom_path?: string | null;
  opacity_percent?: number | null;
};

export async function getWallpaperSetting() {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("ログインしていません");

  const result = await supabase
    .from("wallpaper_settings")
    .select("preset, custom_path, opacity_percent")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (result.error) throw new Error(`壁紙取得失敗: ${result.error.message}`);
  return result.data as WallpaperSetting | null;
}

export async function resolveWallpaperUrl(storagePath?: string | null) {
  if (!storagePath) return null;

  const supabase = createClient();
  const signed = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 60 * 24 * 7);

  if (signed.error) {
    throw new Error(`壁紙URL生成失敗: ${signed.error.message}`);
  }

  return signed.data.signedUrl;
}

export async function getResolvedWallpaperSetting() {
  const data = await getWallpaperSetting();
  const customUrl = data?.custom_path ? await resolveWallpaperUrl(data.custom_path) : null;
  return {
    ...data,
    custom_url: customUrl,
  };
}

export async function saveWallpaperSetting(data: {
  preset: string;
  opacityPercent: number;
  customPath?: string | null;
}) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("ログインしていません");

  const result = await supabase
    .from("wallpaper_settings")
    .upsert(
      {
        user_id: auth.user.id,
        preset: data.preset,
        custom_path: data.customPath ?? null,
        opacity_percent: data.opacityPercent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (result.error) throw new Error(`壁紙保存失敗: ${result.error.message}`);
}
