"use client";

import { useMemo, useState } from "react";
import DashboardShell from "./dashboard-shell";
import SidebarNav from "./sidebar-nav";
import { DASHBOARD_TABS } from "@/lib/life-os/constants";
import type { MainTab } from "@/lib/life-os/constants";
import { LegacyDashboardContent } from "./legacy-dashboard-content";
import NotesSection from "./sections/notes-section";
import GrowthSection from "./sections/growth-section";
import TravelSection from "./sections/travel-section";
import MoneySection from "./sections/money-section";
import LifestyleSection from "./sections/lifestyle-section";
import WallpaperSection from "./sections/wallpaper-section";
import GroomingSection from "./sections/grooming-section";
import SharedMemoSection from "./sections/shared-memo-section";
import LivingPrepSection from "./sections/living-prep-section";
import ReviewSection from "./sections/review-section";
import HobbySection from "./sections/hobby-section";
import HoloSection from "./sections/holo-section";
import AnalyticsSection from "./sections/analytics-section";

type RecordRow = {
  id: string;
  date: string;
  weight: number | null;
  sleep: number | null;
  study: number | null;
  memo: string | null;
  created_at: string;
};

type GoalRow = {
  id?: string;
  target_weight: number | null;
  target_sleep: number | null;
  target_study: number | null;
  memo: string | null;
};

type Props = {
  userEmail: string | null;
  records: RecordRow[];
  goal: GoalRow | null;
  onSaveRecord: (payload: {
    date: string;
    weight: number | null;
    sleep: number | null;
    study: number | null;
    memo: string;
  }) => Promise<void>;
  onUpdateRecord: (payload: {
    id: string;
    date: string;
    weight: number | null;
    sleep: number | null;
    study: number | null;
    memo: string;
  }) => Promise<void>;
  onDeleteRecord: (id: string) => Promise<void>;
  onSaveGoal: (payload: {
    target_weight: number | null;
    target_sleep: number | null;
    target_study: number | null;
    memo: string;
  }) => Promise<void>;
};

function PlaceholderSection({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm md:p-8">
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

export default function LifeOSDashboard(props: Props) {
  const [activeTab, setActiveTab] = useState<MainTab>("dashboard");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeTabMeta = useMemo(
    () => DASHBOARD_TABS.find((tab) => tab.key === activeTab),
    [activeTab]
  );

  let content: React.ReactNode = null;

  switch (activeTab) {
    case "dashboard":
    case "records":
      content = (
        <LegacyDashboardContent
          {...props}
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
        />
      );
      break;
    case "analytics":
      content = <AnalyticsSection records={props.records} goal={props.goal} />;
      break;
    case "notes":
      content = <NotesSection />;
      break;
    case "growth":
      content = <GrowthSection />;
      break;
    case "travel":
      content = <TravelSection />;
      break;
    case "money":
      content = <MoneySection />;
      break;
    case "lifestyle":
      content = <LifestyleSection />;
      break;
    case "wallpaper":
      content = <WallpaperSection />;
      break;
    case "grooming":
      content = <GroomingSection />;
      break;
    case "shared":
      content = <SharedMemoSection />;
      break;
    case "living":
      content = <LivingPrepSection />;
      break;
    case "review":
      content = <ReviewSection />;
      break;
    case "hobby":
      content = <HobbySection />;
      break;
    case "holo":
      content = <HoloSection />;
      break;
    default:
      content = (
        <PlaceholderSection
          title={activeTabMeta?.label ?? "準備中"}
          text="このタブは次段階で統合します。"
        />
      );
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <SidebarNav activeTab={activeTab} onChangeTab={setActiveTab} />

      <div className="flex-1 overflow-x-hidden">
        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                Life OS
              </div>
              <div className="truncate text-base font-bold text-slate-900">
                {activeTabMeta?.label ?? "ダッシュボード"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
            >
              メニュー
            </button>
          </div>
        </div>

        <DashboardShell
          activeTab={activeTab}
          userEmail={props.userEmail}
          errorMessage={errorMessage}
          successMessage={successMessage}
        >
          {content}
        </DashboardShell>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="メニューを閉じる"
            className="absolute inset-0 bg-slate-950/35"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[88%] max-w-[340px] overflow-y-auto border-r border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <div>
                <div className="text-sm font-semibold text-sky-600">Navigation</div>
                <div className="text-lg font-bold text-slate-950">Life OS</div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
              >
                閉じる
              </button>
            </div>

            <div className="p-4">
              <SidebarNav
                activeTab={activeTab}
                onChangeTab={setActiveTab}
                mobile
                onAfterSelect={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}