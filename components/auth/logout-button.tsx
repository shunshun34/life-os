"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);

      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        alert(`ログアウト失敗: ${error.message}`);
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("ログアウト中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
    >
      {loading ? "ログアウト中..." : "ログアウト"}
    </button>
  );
}