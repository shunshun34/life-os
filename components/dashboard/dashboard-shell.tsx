"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import type { MainTab } from "@/lib/life-os/constants";

type DashboardShellProps = {
  children: ReactNode;
  activeTab: MainTab;
  userEmail: string | null;
  errorMessage?: string;
  successMessage?: string;
};

const TAB_ACCENTS: Record<
  string,
  {
    gradient: string;
    badge: string;
    title: string;
    subtitle: string;
  }
> = {
  dashboard: {
    gradient: "from-cyan-100 via-sky-100 to-indigo-100",
    badge: "Life OS",
    title: "ダッシュボード",
    subtitle: "今日やることと全体状況",
  },
  input: {
    gradient: "from-blue-100 via-sky-100 to-cyan-100",
    badge: "Life OS",
    title: "記録",
    subtitle: "体重・睡眠・勉強の記録",
  },
  notes: {
    gradient: "from-pink-100 via-rose-50 to-fuchsia-100",
    badge: "Life OS",
    title: "メモ",
    subtitle: "日常メモと保存した知見",
  },
  growth: {
    gradient: "from-emerald-100 via-teal-50 to-green-100",
    badge: "Life OS",
    title: "成長",
    subtitle: "改善記録と振り返り",
  },
  travel: {
    gradient: "from-amber-100 via-orange-50 to-yellow-100",
    badge: "Life OS",
    title: "旅行",
    subtitle: "写真付き旅行記録",
  },
  wallpaper: {
    gradient: "from-rose-100 via-pink-50 to-violet-100",
    badge: "Life OS",
    title: "壁紙",
    subtitle: "背景と見た目設定",
  },
  money: {
    gradient: "from-lime-100 via-emerald-50 to-green-100",
    badge: "Life OS",
    title: "お金",
    subtitle: "収支と予算",
  },
  household: {
    gradient: "from-sky-100 via-cyan-50 to-blue-100",
    badge: "Life OS",
    title: "生活管理",
    subtitle: "家事・買い物・日常運用",
  },
  grooming: {
    gradient: "from-pink-100 via-rose-50 to-red-100",
    badge: "Life OS",
    title: "身だしなみ",
    subtitle: "ケアとメンテナンス",
  },
  shared: {
    gradient: "from-indigo-100 via-violet-50 to-purple-100",
    badge: "Life OS",
    title: "共有メモ",
    subtitle: "共有してもよい生活メモ",
  },
  livingPrep: {
    gradient: "from-orange-100 via-amber-50 to-yellow-100",
    badge: "Life OS",
    title: "暮らし準備",
    subtitle: "同棲・結婚を見据えた準備",
  },
  hobby: {
    gradient: "from-violet-100 via-purple-50 to-fuchsia-100",
    badge: "Life OS",
    title: "趣味",
    subtitle: "お酒・レビュー・楽しみ記録",
  },
  holo: {
    gradient: "from-cyan-100 via-sky-100 to-fuchsia-100",
    badge: "Life OS",
    title: "ホロ活",
    subtitle: "推し活・視聴・後で見る",
  },
  review: {
    gradient: "from-slate-100 via-gray-50 to-zinc-100",
    badge: "Life OS",
    title: "振り返り",
    subtitle: "日次レビューを残します。",
  },
  analytics: {
    gradient: "from-cyan-100 via-blue-50 to-indigo-100",
    badge: "Life OS",
    title: "分析",
    subtitle: "推移と傾向を確認",
  },
};

export default function DashboardShell({
  children,
  activeTab,
  userEmail,
  errorMessage,
  successMessage,
}: DashboardShellProps) {
  const accent = TAB_ACCENTS[activeTab] ?? TAB_ACCENTS.dashboard;

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  return (
    <div className="lifeos-light min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-4 md:px-6 md:py-6">
        <header
          className={`rounded-[32px] border border-slate-200 bg-gradient-to-r ${accent.gradient} px-6 py-6 shadow-sm md:px-8 md:py-8`}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="rounded-[28px] bg-white/70 px-6 py-5 shadow-sm backdrop-blur">
              <div className="text-sm font-semibold text-cyan-700">
                {accent.badge}
              </div>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
                {accent.title}
              </h1>
              <p className="mt-3 text-base text-slate-600 md:text-lg">
                {accent.subtitle}
              </p>
            </div>

            <div className="self-start rounded-[24px] border border-slate-200 bg-white/80 px-6 py-5 shadow-sm backdrop-blur md:min-w-[260px]">
              <div className="text-sm font-bold text-slate-900">ログイン中</div>
              <div className="mt-2 break-all text-base text-slate-600">
                {userEmail ?? "未ログイン"}
              </div>
            </div>
          </div>
        </header>

        {(errorMessage || successMessage) && (
          <div className="mt-4 space-y-3">
            {errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                {errorMessage}
              </div>
            ) : null}
            {successMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
                {successMessage}
              </div>
            ) : null}
          </div>
        )}

        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
}