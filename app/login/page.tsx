"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
      setLoading(true);
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !password) {
        alert("メールアドレスとパスワードを入力してください");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (error) {
        alert(`ログイン失敗: ${error.message}`);
        return;
      }
      router.replace("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h1 className="mb-2 text-center text-2xl font-bold text-white">Life OS</h1>
        <p className="mb-6 text-center text-sm text-slate-400">生活データを記録して、継続改善を支援する自己管理アプリ</p>
        <div className="grid gap-4">
          <input type="email" placeholder="メールアドレス" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400" />
          <input type="password" placeholder="パスワード" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400" />
          <button type="button" onClick={login} disabled={loading} className="rounded-xl bg-cyan-400 px-4 py-3 text-base font-medium text-slate-950 disabled:opacity-60">{loading ? "ログイン中..." : "ログイン"}</button>
        </div>
      </div>
    </main>
  );
}
