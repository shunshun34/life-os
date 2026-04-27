export type MainTab =
  | "dashboard"
  | "routine"
  | "workout"
  | "study"
  | "cleanliness"
  | "interpersonal"
  | "outputs"
  | "weeklyReview"
  | "household"
  | "health"
  | "money"
  | "settings"
  | "holo";

export const DASHBOARD_TABS: Array<{ key: MainTab; label: string; description: string }> = [
  { key: "dashboard", label: "ダッシュボード", description: "今日やること・KPI・記録漏れ" },
  { key: "routine", label: "ルーティン", description: "朝・昼・夜・曜日別タスク" },
  { key: "workout", label: "筋トレ", description: "メニューと成長記録" },
  { key: "study", label: "勉強", description: "情報資格・英語・面接の学習ログ" },
  { key: "cleanliness", label: "清潔", description: "朝夜週次ケアのチェック" },
  { key: "interpersonal", label: "対人", description: "主導・共感・意見の定着" },
  { key: "outputs", label: "成果物", description: "アプリ改善・技術整理・AIレビュー" },
  { key: "weeklyReview", label: "週次レビュー", description: "日曜5分レビューと改善1つ" },
  { key: "household", label: "家事", description: "曜日固定の家事チェック" },
  { key: "health", label: "健康", description: "体重・体脂肪・水分・睡眠" },
  { key: "money", label: "お金", description: "都度のお金メモとNISA確認" },
  { key: "settings", label: "ルール", description: "毎日見る行動固定表" },
  { key: "holo", label: "ホロ活", description: "現状維持の独立スペース" },
];

export const TAB_ACCENTS: Record<MainTab, string> = {
  dashboard: "from-sky-100 via-cyan-50 to-indigo-100",
  routine: "from-blue-100 via-sky-50 to-cyan-100",
  workout: "from-orange-100 via-amber-50 to-yellow-100",
  study: "from-indigo-100 via-blue-50 to-sky-100",
  cleanliness: "from-pink-100 via-rose-50 to-orange-100",
  interpersonal: "from-violet-100 via-purple-50 to-fuchsia-100",
  outputs: "from-emerald-100 via-teal-50 to-cyan-100",
  weeklyReview: "from-slate-100 via-gray-50 to-zinc-100",
  household: "from-cyan-100 via-sky-50 to-blue-100",
  health: "from-lime-100 via-green-50 to-emerald-100",
  money: "from-yellow-100 via-lime-50 to-green-100",
  settings: "from-slate-100 via-blue-50 to-indigo-100",
  holo: "from-cyan-100 via-sky-50 to-fuchsia-100",
};

export const TAB_BUTTON_ACCENTS: Record<MainTab, { bg: string; text: string; description: string; border: string }> = {
  dashboard: { bg: "#e0f2fe", text: "#075985", description: "#155e75", border: "#bae6fd" },
  routine: { bg: "#dbeafe", text: "#1d4ed8", description: "#1e40af", border: "#bfdbfe" },
  workout: { bg: "#ffedd5", text: "#c2410c", description: "#9a3412", border: "#fdba74" },
  study: { bg: "#e0e7ff", text: "#4338ca", description: "#3730a3", border: "#c7d2fe" },
  cleanliness: { bg: "#fce7f3", text: "#be185d", description: "#9d174d", border: "#f9a8d4" },
  interpersonal: { bg: "#ede9fe", text: "#7c3aed", description: "#6d28d9", border: "#ddd6fe" },
  outputs: { bg: "#d1fae5", text: "#047857", description: "#065f46", border: "#a7f3d0" },
  weeklyReview: { bg: "#e2e8f0", text: "#334155", description: "#475569", border: "#cbd5e1" },
  household: { bg: "#cffafe", text: "#0f766e", description: "#115e59", border: "#a5f3fc" },
  health: { bg: "#ecfccb", text: "#4d7c0f", description: "#3f6212", border: "#d9f99d" },
  money: { bg: "#fef3c7", text: "#b45309", description: "#92400e", border: "#fde68a" },
  settings: { bg: "#e0e7ff", text: "#4338ca", description: "#3730a3", border: "#c7d2fe" },
  holo: { bg: "#cffafe", text: "#0891b2", description: "#0f766e", border: "#a5f3fc" },
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
    headerGradient: "linear-gradient(135deg, #fee2e2 0%, #fff1f2 48%, #ffffff 100%)",
    heroGradient: "linear-gradient(135deg, #450a0a 0%, #b91c1c 48%, #ef4444 100%)",
    soft: "#fff1f2",
    softBorder: "#fecaca",
    accent: "#dc2626",
    accentStrong: "#991b1b",
    badge: "#fee2e2",
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
    headerGradient: "linear-gradient(135deg, #ffffff 0%, #fff1f2 48%, #fecaca 100%)",
    heroGradient: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 48%, #ffffff 100%)",
    soft: "#fff1f2",
    softBorder: "#fecaca",
    accent: "#ef4444",
    accentStrong: "#b91c1c",
    badge: "#ffffff",
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
    headerGradient: "linear-gradient(135deg, #ffffff 0%, #e0f2fe 48%, #bfdbfe 100%)",
    heroGradient: "linear-gradient(135deg, #0f172a 0%, #2563eb 48%, #ffffff 100%)",
    soft: "#eff6ff",
    softBorder: "#bfdbfe",
    accent: "#2563eb",
    accentStrong: "#1d4ed8",
    badge: "#ffffff",
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
    headerGradient: "linear-gradient(135deg, #ffedd5 0%, #fef3c7 48%, #fef9c3 100%)",
    heroGradient: "linear-gradient(135deg, #9a3412 0%, #f97316 48%, #facc15 100%)",
    soft: "#fff7ed",
    softBorder: "#fde68a",
    accent: "#f97316",
    accentStrong: "#ea580c",
    badge: "#fef3c7",
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
    headerGradient: "linear-gradient(135deg, #faf5ff 0%, #fce7f3 48%, #f5d0fe 100%)",
    heroGradient: "linear-gradient(135deg, #581c87 0%, #a855f7 48%, #ec4899 100%)",
    soft: "#faf5ff",
    softBorder: "#f5d0fe",
    accent: "#a855f7",
    accentStrong: "#7e22ce",
    badge: "#fce7f3",
  },
};
