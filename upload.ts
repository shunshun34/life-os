import { createClient } from "@/lib/supabase";

const BUCKET = "trip-images";
const MAX_TRIP_FILES = 12;
const MAX_FILE_MB = 8;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function randomPart() {
  return Math.random().toString(36).slice(2, 10);
}

async function getCurrentUserId() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("ログインが必要です。");
  return user.id;
}

async function uploadFiles(files: File[], prefix: "trip" | "wallpaper") {
  const userId = await getCurrentUserId();
  const supabase = createClient();

  if (prefix === "trip" && files.length > MAX_TRIP_FILES) {
    throw new Error(`旅行写真は一度に${MAX_TRIP_FILES}枚までです。`);
  }

  const uploadedPaths: string[] = [];

  try {
    for (const file of files) {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        throw new Error(`ファイルサイズは${MAX_FILE_MB}MB以下にしてください。`);
      }

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${userId}/${prefix}/${Date.now()}-${randomPart()}-${sanitizeFileName(file.name || `file.${ext}`)}`;

      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) throw error;
      uploadedPaths.push(path);
    }

    return uploadedPaths;
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from(BUCKET).remove(uploadedPaths);
    }
    throw error;
  }
}

export async function uploadTripImages(files: File[]) {
  return uploadFiles(files, "trip");
}

export async function uploadWallpaperImage(file: File) {
  const paths = await uploadFiles([file], "wallpaper");
  return paths[0] ?? null;
}
