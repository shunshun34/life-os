"use client";

import { useEffect } from "react";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  // 通知許可
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // 毎日21時通知
  useEffect(() => {
    if (!("Notification" in window)) return;

    const check = () => {
      const now = new Date();
      if (now.getHours() === 21 && now.getMinutes() === 0) {
        new Notification("Life OS", {
          body: "今日の記録を入力しよう",
        });
      }
    };

    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="lifeos-light min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-4">
        {children}
      </div>
    </div>
  );
}