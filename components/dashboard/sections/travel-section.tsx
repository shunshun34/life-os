
"use client";

import { useEffect, useMemo, useState } from "react";
import { addTripPhotos, createTrip, deleteTrip, getTrips } from "@/lib/life-os/travel";
import { MAX_TRIP_FILES, uploadTripImages } from "@/lib/life-os/upload";

type Visibility = "private" | "partner" | "public";

const VISIBILITY_LABEL: Record<Visibility, string> = {
  private: "自分用",
  partner: "共有OK",
  public: "公開OK",
};

const PREFECTURES = [
  "北海道",
  "青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県",
  "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県",
  "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県",
];

const PREFECTURE_GRID_ROWS = [
  ["北海道"],
  ["青森県","岩手県","宮城県","秋田県","山形県","福島県"],
  ["茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県"],
  ["新潟県","富山県","石川県","福井県","山梨県","長野県"],
  ["岐阜県","静岡県","愛知県","三重県"],
  ["滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県"],
  ["鳥取県","島根県","岡山県","広島県","山口県"],
  ["徳島県","香川県","愛媛県","高知県"],
  ["福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県"],
  ["沖縄県"],
];

export default function TravelSection() {
  const [items, setItems] = useState<any[]>([]);
  const [prefecture, setPrefecture] = useState("東京都");
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [tripDate, setTripDate] = useState(new Date().toISOString().slice(0, 10));
  const [sharedWith, setSharedWith] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [message, setMessage] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await getTrips();
    setItems(data);
  }

  useEffect(() => {
    load();
  }, []);

  const visitedPrefectures = useMemo(() => {
    return new Set(
      items
        .map((item) => item.prefecture)
        .filter((value): value is string => Boolean(value))
    );
  }, [items]);

  async function handleSave() {
    setMessage("");
    try {
      if (!title.trim() && !memo.trim() && photoFiles.length === 0) {
        setMessage("タイトル・メモ・写真のどれかを入力してください。");
        return;
      }
      if (photoFiles.length > MAX_TRIP_FILES) {
        setMessage(`旅行写真は一度に${MAX_TRIP_FILES}枚までです。`);
        return;
      }

      setSaving(true);
      const trip = await createTrip({
        prefecture,
        title,
        memo,
        tripDate,
        sharedWith,
        visibility,
      });

      if (photoFiles.length > 0) {
        const paths = await uploadTripImages(photoFiles, trip.id);
        await addTripPhotos(trip.id, paths);
      }

      setPrefecture("東京都");
      setTitle("");
      setMemo("");
      setSharedWith("");
      setPhotoFiles([]);
      setMessage("旅行記録を保存しました。");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "旅行記録の保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTrip(id);
      setMessage("旅行記録を削除しました。");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "旅行記録の削除に失敗しました。");
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">旅行</h2>
            <p className="mt-2 text-sm text-slate-500">
              都道府県を選んで記録。行った場所は下の一覧で色分け表示します。
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            訪問済み {visitedPrefectures.size} / 47
          </div>
        </div>

        {message ? (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {message}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <div className="mb-2 text-sm font-medium text-slate-700">都道府県</div>
            <select
              value={prefecture}
              onChange={(e) => setPrefecture(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
            >
              {PREFECTURES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="mb-2 text-sm font-medium text-slate-700">タイトル</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
            />
          </label>

          <label className="block">
            <div className="mb-2 text-sm font-medium text-slate-700">日付</div>
            <input
              type="date"
              value={tripDate}
              onChange={(e) => setTripDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
            />
          </label>

          <label className="block">
            <div className="mb-2 text-sm font-medium text-slate-700">誰と行ったか</div>
            <input
              value={sharedWith}
              onChange={(e) => setSharedWith(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <div className="mb-2 text-sm font-medium text-slate-700">メモ</div>
          <textarea
            rows={5}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
          />
        </label>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <div className="mb-2 text-sm font-medium text-slate-700">表示範囲</div>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
            >
              <option value="private">自分用</option>
              <option value="partner">共有OK</option>
              <option value="public">公開OK</option>
            </select>
          </label>

          <label className="block">
            <div className="mb-2 text-sm font-medium text-slate-700">
              写真（{MAX_TRIP_FILES}枚まで）
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setPhotoFiles(Array.from(e.target.files ?? []))}
              className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
            />
          </label>
        </div>

        {photoFiles.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {photoFiles.map((file) => (
              <span
                key={`${file.name}-${file.size}`}
                className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200"
              >
                {file.name}
              </span>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-4 rounded-2xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-60"
        >
          {saving ? "保存中..." : "旅行記録を保存"}
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">行ったことのある都道府県</h3>
        <p className="mt-1 text-sm text-slate-500">訪問済みは明るく色がつきます。</p>

        <div className="mt-5 space-y-2">
          {PREFECTURE_GRID_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-wrap gap-2">
              {row.map((name) => {
                const visited = visitedPrefectures.has(name);
                return (
                  <div
                    key={name}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      visited
                        ? "border-emerald-400/40 bg-emerald-400/20 text-emerald-100"
                        : "border-slate-200 bg-white/60 text-slate-500"
                    }`}
                  >
                    {name}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">旅行一覧</h3>
        <div className="mt-5 space-y-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500">
              旅行記録がありません。
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-slate-900">{item.title || "無題の旅行"}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {item.trip_date || "-"} / {item.prefecture || "都道府県未設定"} / {VISIBILITY_LABEL[(item.visibility as Visibility) ?? "private"]}
                    </div>
                    <div className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{item.memo || "-"}</div>
                    {item.shared_with ? (
                      <div className="mt-2 text-xs text-slate-500">同行者: {item.shared_with}</div>
                    ) : null}

                    {item.trip_photos?.length ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {item.trip_photos.map((photo: any) => (
                          <div key={photo.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            {photo.url ? (
                              <img
                                src={photo.url}
                                alt="trip"
                                className="h-40 w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                                画像を表示できません
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
