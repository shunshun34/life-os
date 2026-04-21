"use client";

import { DASHBOARD_TABS, MainTab, TAB_BUTTON_ACCENTS } from "@/lib/life-os/constants";

type Props = {
  activeTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
};

export default function SidebarNav({ activeTab, onChangeTab }: Props) {
  return (
    <aside className="sticky top-0 h-screen w-[280px] shrink-0 border-r border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-full flex-col px-4 py-6">
        <div className="mb-6 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
          <p className="text-sm font-semibold text-sky-600">Personal Dashboard</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Life OS</h1>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            生活・改善・趣味・推し活を
            <br />
            一つにまとめる自己管理OS
          </p>
        </div>

        <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {DASHBOARD_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const accent = TAB_BUTTON_ACCENTS[tab.key];
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onChangeTab(tab.key)}
                className="w-full rounded-2xl border px-4 py-3 text-left transition"
                style={
                  isActive
                    ? {
                        backgroundColor: accent.bg,
                        borderColor: accent.border,
                        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                      }
                    : {
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                      }
                }
              >
                <div
                  className="text-sm font-semibold"
                  style={{ color: isActive ? accent.text : "#0f172a" }}
                >
                  {tab.label}
                </div>
                <div
                  className="mt-1 text-xs leading-5"
                  style={{ color: isActive ? accent.description : "#64748b" }}
                >
                  {tab.description}
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
