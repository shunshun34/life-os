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
    badge: "Life OS Ver.5",
    title: "ダッシュボード",
    subtitle: "今日やること・今週KPI・記録漏れ",
  },
  routine: {
    gradient: "from-blue-100 via-sky-100 to-cyan-100",
    badge: "Life OS Ver.5",
    title: "ルーティン",
    subtitle: "朝・昼・夜・曜日別タスク",
  },
  workout: {
    gradient: "from-orange-100 via-amber-50 to-yellow-100",
    badge: "Life OS Ver.5",
    title: "筋トレ",
    subtitle: "メニューと成長記録",
  },
  study: {
    gradient: "from-indigo-100 via-blue-50 to-sky-100",
    badge: "Life OS Ver.5",
    title: "勉強",
    subtitle: "転職・資格・英語の学習ログ",
  },
  cleanliness: {
    gradient: "from-pink-100 via-rose-50 to-orange-100",
    badge: "Life OS Ver.5",
    title: "清潔",
    subtitle: "朝夜週次ケアのチェック",
  },
  interpersonal: {
    gradient: "from-violet-100 via-purple-50 to-fuchsia-100",
    badge: "Life OS Ver.5",
    title: "対人",
    subtitle: "主導・共感・意見の定着",
  },
  outputs: {
    gradient: "from-emerald-100 via-teal-50 to-cyan-100",
    badge: "Life OS Ver.5",
    title: "成果物",
    subtitle: "アプリ改善・技術整理・AIレビュー",
  },
  weeklyReview: {
    gradient: "from-slate-100 via-gray-50 to-zinc-100",
    badge: "Life OS Ver.5",
    title: "週次レビュー",
    subtitle: "日曜5分レビューと改善1つ",
  },
  household: {
    gradient: "from-cyan-100 via-sky-50 to-blue-100",
    badge: "Life OS Ver.5",
    title: "家事",
    subtitle: "曜日固定の家事チェック",
  },
  health: {
    gradient: "from-lime-100 via-green-50 to-emerald-100",
    badge: "Life OS Ver.5",
    title: "健康",
    subtitle: "体重・体脂肪・水分・睡眠",
  },
  money: {
    gradient: "from-yellow-100 via-lime-50 to-green-100",
    badge: "Life OS Ver.5",
    title: "お金",
    subtitle: "収支メモとサブスク管理",
  },
  settings: {
    gradient: "from-slate-100 via-blue-50 to-indigo-100",
    badge: "Life OS Ver.5",
    title: "ルール",
    subtitle: "毎日見る行動固定表",
  },
  holo: {
    gradient: "from-cyan-100 via-sky-100 to-fuchsia-100",
    badge: "Life OS",
    title: "ホロ活",
    subtitle: "推し活・視聴・後で見る",
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