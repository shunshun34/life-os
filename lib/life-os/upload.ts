
import { createClient } from "@/lib/supabase";

export const MAX_TRIP_FILES = 12;
export const TRIP_BUCKET = "trip-images";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadTripImages(files: File[], tripId: string) {
  if (files.length > MAX_TRIP_FILES) {
    throw new Error(`旅行写真は一度に${MAX_TRIP_FILES}枚までです。`);
  }

  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw new Error(authError.message);
  if (!user) throw new Error("ログインしていません");

  const uploadedPaths: string[] = [];

  for (const file of files) {
    const filePath = `${user.id}/${tripId}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const result = await supabase.storage.from(TRIP_BUCKET).upload(filePath, file, {
      upsert: false,
    });

    if (result.error) {
      throw new Error(`画像アップロード失敗: ${result.error.message}`);
    }

    uploadedPaths.push(filePath);
  }

  return uploadedPaths;
}

export async function createSignedImageUrl(path: string) {
  const supabase = createClient();
  const result = await supabase.storage
    .from(TRIP_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24);

  if (result.error) {
    throw new Error(`画像URL生成失敗: ${result.error.message}`);
  }

  return result.data.signedUrl;
}
