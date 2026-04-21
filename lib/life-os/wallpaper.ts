import { createClient } from "@/lib/supabase";

export type WallpaperMode = "preset" | "custom";

export type WallpaperSettingRow = {
  user_id: string;
  preset: string | null;
  custom_path: string | null;
  opacity_percent: number | null;
  mode?: WallpaperMode | null;
};

export async function getWallpaperSetting() {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("ログインしていません");

  const result = await supabase
    .from("wallpaper_settings")
    .select("*")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (result.error) throw new Error(`壁紙取得失敗: ${result.error.message}`);
  return result.data as WallpaperSettingRow | null;
}

export async function saveWallpaperSetting(data: {
  preset: string;
  opacityPercent: number;
  mode?: WallpaperMode;
  customPath?: string | null;
}) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("ログインしていません");

  const result = await supabase.from("wallpaper_settings").upsert(
    {
      user_id: auth.user.id,
      preset: data.preset,
      opacity_percent: data.opacityPercent,
      custom_path: data.customPath ?? null,
      mode: data.mode ?? "preset",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (result.error) throw new Error(`壁紙保存失敗: ${result.error.message}`);
}

export async function uploadCustomWallpaper(file: File) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("ログインしていません");

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${auth.user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const upload = await supabase.storage
    .from("wallpaper-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (upload.error) throw new Error(`画像アップロード失敗: ${upload.error.message}`);
  return filePath;
}

export async function getResolvedWallpaperSetting() {
  const supabase = createClient();
  const setting = await getWallpaperSetting();
  if (!setting) {
    return {
      preset: "aurora",
      opacityPercent: 45,
      mode: "preset" as WallpaperMode,
      customPath: null,
      imageUrl: null,
    };
  }

  let imageUrl: string | null = null;
  if (setting.mode === "custom" && setting.custom_path) {
    const { data } = supabase.storage.from("wallpaper-images").getPublicUrl(setting.custom_path);
    imageUrl = data.publicUrl;
  }

  return {
    preset: setting.preset ?? "aurora",
    opacityPercent: typeof setting.opacity_percent === "number" ? setting.opacity_percent : 45,
    mode: (setting.mode ?? "preset") as WallpaperMode,
    customPath: setting.custom_path ?? null,
    imageUrl,
  };
}
