"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function LogsPage() {
  const [data, setData] = useState<any[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("records")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("取得エラー:", error.message);
      return;
    }

    setData(data || []);
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from("records")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("削除エラー:", error.message);
      return;
    }

    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>一覧</h1>

      {data.map((d) => (
        <div key={d.id} style={{ marginBottom: "10px" }}>
          {d.date} / {d.weight}
          <button onClick={() => deleteItem(d.id)} style={{ marginLeft: "10px" }}>
            削除
          </button>
        </div>
      ))}
    </div>
  );
}