"use client";

import { useMemo, useState } from "react";
import DashboardShell from "./dashboard-shell";
import SidebarNav from "./sidebar-nav";
import { DASHBOARD_TABS } from "@/lib/life-os/constants";
import type { MainTab } from "@/lib/life-os/constants";
import HoloSection from "./sections/holo-section";
import {
  CleanlinessV5Section,
  DashboardV5Section,
  HealthV5Section,
  HouseholdV5Section,
  InterpersonalV5Section,
  MoneyV5Section,
  OutputsV5Section,
  RecoveryV5Section,
  RoutineV5Section,
  SettingsV5Section,
  StudyV5Section,
  WeeklyReviewV5Section,
  WorkoutV5Section,
} from "./sections/v5-sections";

type Props = {
  userEmail: string | null;
};

export default function LifeOSDashboard(props: Props) {
  const [activeTab, setActiveTab] = useState<MainTab>("dashboard");
  const [errorMessage] = useState("");
  const [successMessage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeTabMeta = useMemo(
    () => DASHBOARD_TABS.find((tab) => tab.key === activeTab),
    [activeTab]
  );

  let content: React.ReactNode = null;

  switch (activeTab) {
    case "dashboard":
      content = <DashboardV5Section onGo={setActiveTab} />;
      break;
    case "routine":
      content = <RoutineV5Section />;
      break;
    case "workout":
      content = <WorkoutV5Section />;
      break;
    case "study":
      content = <StudyV5Section />;
      break;
    case "cleanliness":
      content = <CleanlinessV5Section />;
      break;
    case "interpersonal":
      content = <InterpersonalV5Section />;
      break;
    case "outputs":
      content = <OutputsV5Section />;
      break;
    case "weeklyReview":
      content = <WeeklyReviewV5Section />;
      break;
    case "household":
      content = <HouseholdV5Section />;
      break;
    case "health":
      content = <HealthV5Section />;
      break;
    case "money":
      content = <MoneyV5Section />;
      break;
    case "settings":
      content = (
        <div className="space-y-6">
          <SettingsV5Section />
          <RecoveryV5Section />
        </div>
      );
      break;
    case "holo":
      content = <HoloSection />;
      break;
    default:
      content = <DashboardV5Section onGo={setActiveTab} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <div className="hidden lg:block">
        <SidebarNav activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

      <div className="min-w-0 flex-1 overflow-x-hidden">
        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                Life OS Ver.5
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
                <div className="text-xs font-semibold text-sky-600">Life OS Ver.5</div>
                <div className="mt-1 text-lg font-bold text-slate-900">メニュー</div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
              >
                閉じる
              </button>
            </div>
            <div className="p-3">
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
