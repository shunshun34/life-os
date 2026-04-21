export type MainTab =
  | "dashboard"
  | "records"
  | "analytics"
  | "notes"
  | "growth"
  | "travel"
  | "wallpaper"
  | "money"
  | "lifestyle"
  | "grooming"
  | "shared"
  | "living"
  | "hobby"
  | "holo"
  | "review";

export const DASHBOARD_TABS: Array<{ key: MainTab; label: string; description: string }> = [
  { key: "dashboard", label: "ダッシュボード", description: "今日やることと全体状況" },
  { key: "records", label: "記録", description: "体重・睡眠・勉強の記録" },
  { key: "analytics", label: "分析", description: "推移と相関の確認" },
  { key: "notes", label: "メモ", description: "日常メモと保存した知見" },
  { key: "growth", label: "成長", description: "改善記録と振り返り" },
  { key: "travel", label: "旅行", description: "写真付き旅行記録" },
  { key: "wallpaper", label: "壁紙", description: "背景と見た目設定" },
  { key: "money", label: "お金", description: "収支と予算" },
  { key: "lifestyle", label: "生活管理", description: "家事・買い物・日常運用" },
  { key: "grooming", label: "身だしなみ", description: "ケアとメンテナンス" },
  { key: "shared", label: "共有メモ", description: "共有してもよい生活メモ" },
  { key: "living", label: "暮らし準備", description: "同棲・結婚を見据えた準備" },
  { key: "hobby", label: "趣味", description: "お酒・レビュー・楽しみ記録" },
  { key: "holo", label: "ホロ活", description: "推し活・視聴・後で見る" },
  { key: "review", label: "振り返り", description: "週次・月次の見直し" },
];

export const TAB_ACCENTS: Record<MainTab, string> = {
  dashboard: "from-sky-100 via-cyan-50 to-indigo-100",
  records: "from-blue-100 via-sky-50 to-indigo-100",
  analytics: "from-indigo-100 via-sky-50 to-cyan-100",
  notes: "from-pink-100 via-rose-50 to-fuchsia-100",
  growth: "from-emerald-100 via-teal-50 to-cyan-100",
  travel: "from-amber-100 via-orange-50 to-yellow-100",
  wallpaper: "from-rose-100 via-pink-50 to-fuchsia-100",
  money: "from-lime-100 via-green-50 to-emerald-100",
  lifestyle: "from-cyan-100 via-sky-50 to-blue-100",
  grooming: "from-rose-100 via-pink-50 to-orange-100",
  shared: "from-indigo-100 via-sky-50 to-cyan-100",
  living: "from-orange-100 via-amber-50 to-yellow-100",
  hobby: "from-violet-100 via-purple-50 to-fuchsia-100",
  holo: "from-cyan-100 via-sky-50 to-indigo-100",
  review: "from-slate-100 via-slate-50 to-zinc-100",
};

export const TAB_BUTTON_ACCENTS: Record<MainTab, { bg: string; text: string; description: string; border: string }> = {
  dashboard: { bg: "#e0f2fe", text: "#075985", description: "#155e75", border: "#bae6fd" },
  records: { bg: "#dbeafe", text: "#1d4ed8", description: "#1e40af", border: "#bfdbfe" },
  analytics: { bg: "#e0e7ff", text: "#4338ca", description: "#3730a3", border: "#c7d2fe" },
  notes: { bg: "#fce7f3", text: "#be185d", description: "#9d174d", border: "#f9a8d4" },
  growth: { bg: "#d1fae5", text: "#047857", description: "#065f46", border: "#a7f3d0" },
  travel: { bg: "#ffedd5", text: "#c2410c", description: "#9a3412", border: "#fdba74" },
  wallpaper: { bg: "#ffe4e6", text: "#be123c", description: "#9f1239", border: "#fda4af" },
  money: { bg: "#ecfccb", text: "#4d7c0f", description: "#3f6212", border: "#d9f99d" },
  lifestyle: { bg: "#cffafe", text: "#0f766e", description: "#115e59", border: "#a5f3fc" },
  grooming: { bg: "#fce7f3", text: "#c026d3", description: "#a21caf", border: "#f5d0fe" },
  shared: { bg: "#e0e7ff", text: "#4338ca", description: "#3730a3", border: "#c7d2fe" },
  living: { bg: "#fef3c7", text: "#b45309", description: "#92400e", border: "#fde68a" },
  hobby: { bg: "#ede9fe", text: "#7c3aed", description: "#6d28d9", border: "#ddd6fe" },
  holo: { bg: "#cffafe", text: "#0891b2", description: "#0f766e", border: "#a5f3fc" },
  review: { bg: "#e2e8f0", text: "#334155", description: "#475569", border: "#cbd5e1" },
};

export type HoloThemeKey = "suisei" | "miko" | "marine" | "pekora" | "ayame" | "korone" | "ina" | "shirakami" | "okayu" | "subaru" | "kanata" | "bijou";

export const DEFAULT_HOLO_THEME: HoloThemeKey = "suisei";

export const HOLO_OSHI_THEMES: Record<
  HoloThemeKey,
  {
    label: string;
    emoji: string;
    headerGradient: string;
    heroGradient: string;
    soft: string;
    softBorder: string;
    accent: string;
    accentStrong: string;
    badge: string;
  }
> = {
  suisei: {
    label: "星街すいせい風",
    emoji: "☄️",
    headerGradient: "linear-gradient(135deg, #dff4ff 0%, #c9ecff 46%, #e4e8ff 100%)",
    heroGradient: "linear-gradient(135deg, #062340 0%, #0d3b66 46%, #7dd3fc 100%)",
    soft: "#ecfeff",
    softBorder: "#bae6fd",
    accent: "#38bdf8",
    accentStrong: "#0284c7",
    badge: "#e0f2fe",
  },
  miko: {
    label: "さくらみこ風",
    emoji: "🌸",
    headerGradient: "linear-gradient(135deg, #ffe5ef 0%, #ffeef7 48%, #fff6fb 100%)",
    heroGradient: "linear-gradient(135deg, #7f1d4f 0%, #be185d 45%, #f9a8d4 100%)",
    soft: "#fff1f7",
    softBorder: "#fbcfe8",
    accent: "#ec4899",
    accentStrong: "#db2777",
    badge: "#fdf2f8",
  },
  marine: {
    label: "宝鐘マリン風",
    emoji: "🏴‍☠️",
    headerGradient: "linear-gradient(135deg, #ffe4e6 0%, #fff1f2 50%, #fff7ed 100%)",
    heroGradient: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 42%, #fdba74 100%)",
    soft: "#fff7ed",
    softBorder: "#fdba74",
    accent: "#f97316",
    accentStrong: "#ea580c",
    badge: "#fff7ed",
  },
  pekora: {
    label: "兎田ぺこら風",
    emoji: "🥕",
    headerGradient: "linear-gradient(135deg, #e0f2fe 0%, #ecfeff 55%, #fff7ed 100%)",
    heroGradient: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 48%, #fdba74 100%)",
    soft: "#eff6ff",
    softBorder: "#bfdbfe",
    accent: "#3b82f6",
    accentStrong: "#2563eb",
    badge: "#eff6ff",
  },
  ayame: {
    label: "百鬼あやめ風",
    emoji: "😈",
    headerGradient: "linear-gradient(135deg, #ede9fe 0%, #f3e8ff 48%, #ffe4e6 100%)",
    heroGradient: "linear-gradient(135deg, #3b0764 0%, #7e22ce 42%, #fb7185 100%)",
    soft: "#faf5ff",
    softBorder: "#d8b4fe",
    accent: "#a855f7",
    accentStrong: "#9333ea",
    badge: "#f5f3ff",
  },
  korone: {
    label: "戌神ころね風",
    emoji: "🥐",
    headerGradient: "linear-gradient(135deg, #fef3c7 0%, #fff7ed 45%, #ffedd5 100%)",
    heroGradient: "linear-gradient(135deg, #78350f 0%, #b45309 45%, #fbbf24 100%)",
    soft: "#fffbeb",
    softBorder: "#fcd34d",
    accent: "#f59e0b",
    accentStrong: "#d97706",
    badge: "#fffbeb",
  },
  ina: {
    label: "一伊那尓栖風",
    emoji: "🐙",
    headerGradient: "linear-gradient(135deg, #f3e8ff 0%, #eef2ff 48%, #e0f2fe 100%)",
    heroGradient: "linear-gradient(135deg, #312e81 0%, #6d28d9 45%, #67e8f9 100%)",
    soft: "#faf5ff",
    softBorder: "#c4b5fd",
    accent: "#8b5cf6",
    accentStrong: "#7c3aed",
    badge: "#f5f3ff",
  },
  shirakami: {
    label: "白上フブキ風",
    emoji: "🌽",
    headerGradient: "linear-gradient(135deg, #ecfccb 0%, #f0fdf4 44%, #e0f2fe 100%)",
    heroGradient: "linear-gradient(135deg, #14532d 0%, #0f766e 45%, #7dd3fc 100%)",
    soft: "#f7fee7",
    softBorder: "#bef264",
    accent: "#65a30d",
    accentStrong: "#4d7c0f",
    badge: "#f7fee7",
  },
  okayu: {
    label: "猫又おかゆ風",
    emoji: "🍙",
    headerGradient: "linear-gradient(135deg, #f5f3ff 0%, #eef2ff 44%, #f8fafc 100%)",
    heroGradient: "linear-gradient(135deg, #312e81 0%, #4f46e5 45%, #94a3b8 100%)",
    soft: "#f5f3ff",
    softBorder: "#c4b5fd",
    accent: "#8b5cf6",
    accentStrong: "#7c3aed",
    badge: "#f5f3ff",
  },
  subaru: {
    label: "大空スバル風",
    emoji: "☀️",
    headerGradient: "linear-gradient(135deg, #fef3c7 0%, #fff7ed 42%, #ffedd5 100%)",
    heroGradient: "linear-gradient(135deg, #9a3412 0%, #ea580c 48%, #facc15 100%)",
    soft: "#fff7ed",
    softBorder: "#fdba74",
    accent: "#f97316",
    accentStrong: "#ea580c",
    badge: "#fff7ed",
  },
  kanata: {
    label: "天音かなた風",
    emoji: "💫",
    headerGradient: "linear-gradient(135deg, #dbeafe 0%, #e0f2fe 44%, #f5f3ff 100%)",
    heroGradient: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 45%, #c4b5fd 100%)",
    soft: "#eff6ff",
    softBorder: "#93c5fd",
    accent: "#38bdf8",
    accentStrong: "#0284c7",
    badge: "#eff6ff",
  },
  bijou: {
    label: "古石ビジュー風",
    emoji: "💎",
    headerGradient: "linear-gradient(135deg, #e0f2fe 0%, #ecfeff 44%, #f5f3ff 100%)",
    heroGradient: "linear-gradient(135deg, #164e63 0%, #0891b2 42%, #a78bfa 100%)",
    soft: "#ecfeff",
    softBorder: "#a5f3fc",
    accent: "#06b6d4",
    accentStrong: "#0891b2",
    badge: "#ecfeff",
  },
};
