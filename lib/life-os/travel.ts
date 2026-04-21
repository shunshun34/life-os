
import { createClient } from "@/lib/supabase";
import { createSignedImageUrl } from "@/lib/life-os/upload";

export async function getTrips() {
  const supabase = createClient();

  const result = await supabase
    .from("trips")
    .select("*, trip_photos(*)")
    .order("trip_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (result.error) {
    throw new Error(`旅行取得失敗: ${result.error.message}`);
  }

  const rows = result.data ?? [];

  const enriched = await Promise.all(
    rows.map(async (trip: any) => {
      const photos = await Promise.all(
        (trip.trip_photos ?? []).map(async (photo: any) => {
          try {
            const url = await createSignedImageUrl(photo.storage_path);
            return { ...photo, url };
          } catch {
            return { ...photo, url: null };
          }
        })
      );
      return { ...trip, trip_photos: photos };
    })
  );

  return enriched;
}

export async function createTrip(data: {
  prefecture: string;
  title: string;
  memo: string;
  tripDate: string;
  sharedWith: string;
  visibility: "private" | "partner" | "public";
}) {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw new Error(authError.message);
  if (!user) throw new Error("ログインしていません");

  const result = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      prefecture: data.prefecture || null,
      title: data.title || null,
      memo: data.memo || null,
      trip_date: data.tripDate || null,
      shared_with: data.sharedWith || null,
      visibility: data.visibility,
    })
    .select("*")
    .single();

  if (result.error) {
    throw new Error(`旅行保存失敗: ${result.error.message}`);
  }

  return result.data;
}

export async function addTripPhotos(tripId: string, storagePaths: string[]) {
  if (storagePaths.length === 0) return;

  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw new Error(authError.message);
  if (!user) throw new Error("ログインしていません");

  const rows = storagePaths.map((path) => ({
    trip_id: tripId,
    user_id: user.id,
    storage_path: path,
  }));

  const result = await supabase.from("trip_photos").insert(rows);

  if (result.error) {
    throw new Error(`旅行写真保存失敗: ${result.error.message}`);
  }
}

export async function deleteTrip(id: string) {
  const supabase = createClient();

  const result = await supabase.from("trips").delete().eq("id", id);

  if (result.error) {
    throw new Error(`旅行削除失敗: ${result.error.message}`);
  }
}
