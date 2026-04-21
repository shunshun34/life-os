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
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

export default function LifeOSDashboard(props: Props) {
  const [activeTab, setActiveTab] = useState<MainTab>("dashboard");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeTabMeta = useMemo(
    () => DASHBOARD_TABS.find((tab) => tab.key === activeTab),
    [activeTab]
  );

  let content: React.ReactNode = null;

  switch (activeTab) {
    case "dashboard":
    case "records":
      content = <LegacyDashboardContent {...props} setErrorMessage={setErrorMessage} setSuccessMessage={setSuccessMessage} />;
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
      content = <PlaceholderSection title={activeTabMeta?.label ?? "準備中"} text="このタブは次段階で統合します。" />;
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      <SidebarNav activeTab={activeTab} onChangeTab={setActiveTab} />
      <div className="flex-1 overflow-x-hidden">
        <DashboardShell activeTab={activeTab} userEmail={props.userEmail} errorMessage={errorMessage} successMessage={successMessage}>
          {content}
        </DashboardShell>
      </div>
    </div>
  );
}
