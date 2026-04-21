export type Visibility = "private" | "partner" | "public";

export type AutoTag = {
  id: string;
  name: string;
  source: "manual" | "auto";
};

export type HobbyCategory =
  | "お酒"
  | "アニメ"
  | "漫画"
  | "ゲーム"
  | "音楽"
  | "配信"
  | "ガジェット"
  | "外食"
  | "その他";

export type HobbyArchiveItem = {
  id: string;
  title: string;
  category: HobbyCategory;
  subcategory: string | null;
  quick_note: string | null;
  best_point: string | null;
  weak_point: string | null;
  mood_tags: string[];
  scene_tags: string[];
  duration_minutes: number | null;
  satisfaction: number | null;
  repeat_score: number | null;
  memory_score: number | null;
  recommend_score: number | null;
  train_friendly: boolean;
  partner_friendly: boolean;
  visibility: Visibility;
  auto_tags: string[];
  created_at: string;
};

export type DrinkReview = {
  id: string;
  name: string;
  drink_type: string;
  maker: string | null;
  place: string | null;
  with_whom: string | null;
  price_band: string | null;
  easy_to_drink: number | null;
  satisfaction: number | null;
  repeat_score: number | null;
  paired_food: string | null;
  memory_note: string | null;
  visibility: Visibility;
  created_at: string;
};

export type HoloProfile = {
  user_id: string;
  holo_name: string | null;
  fan_since: string | null;
  oshi_main: string | null;
  oshi_style: string | null;
  self_intro: string | null;
  favorite_genres: string[];
  recommend_video_1: string | null;
  recommend_video_2: string | null;
  recommend_video_3: string | null;
  memory_video_1: string | null;
  memory_video_2: string | null;
  memory_video_3: string | null;
  visibility: Visibility;
  updated_at: string;
};

export type HoloOshi = {
  id: string;
  member_name: string;
  unit_name: string | null;
  oshi_level: "最推し" | "推し" | "気になる";
  started_at: string | null;
  reasons: string | null;
  strong_points: string[];
  heat_score: number | null;
  favorite_clip: string | null;
  memo: string | null;
  visibility: Visibility;
  created_at: string;
};

export type HoloActivity = {
  id: string;
  title: string;
  activity_type:
    | "配信"
    | "切り抜き"
    | "歌"
    | "MV"
    | "ライブ"
    | "グッズ"
    | "イベント"
    | "感想"
    | "考察";
  member_name: string;
  related_members: string[];
  watched_on: string | null;
  url: string | null;
  review: string | null;
  best_scene: string | null;
  emo_score: number | null;
  laugh_score: number | null;
  healing_score: number | null;
  repeat_score: number | null;
  train_friendly: boolean;
  visible_in_public_place: boolean;
  duration_minutes: number | null;
  visibility: Visibility;
  created_at: string;
};

export type HoloWatchLater = {
  id: string;
  title: string;
  member_name: string;
  content_type: string;
  url: string | null;
  priority_level: number | null;
  duration_minutes: number | null;
  train_friendly: boolean;
  audio_required: boolean;
  mood_tags: string[];
  visibility: Visibility;
  created_at: string;
};

export type HoloHighlight = {
  id: string;
  title: string;
  member_name: string;
  highlight_type: "神回" | "エモい" | "爆笑" | "癒やし" | "初見向け" | "自分用";
  url: string | null;
  reason: string | null;
  duration_minutes: number | null;
  train_friendly: boolean;
  visibility: Visibility;
  created_at: string;
};
