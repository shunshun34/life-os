
import { createClient } from "@/lib/supabase";

function extractTags(input: string): string[] {
  const found = input.match(/#([^\s#]+)/g) ?? [];
  return [...new Set(found.map((tag) => tag.replace(/^#/, "")))];
}

export async function getGrowthLogs() {
  const supabase = createClient();
  return await supabase
    .from("growth_logs")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function addGrowthLog(data: {
  category: string;
  content: string;
  visibility: "private" | "partner" | "public";
  logDate: string;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインしていません");

  return await supabase.from("growth_logs").insert({
    user_id: user.id,
    category: data.category,
    content: data.content,
    tags: extractTags(`${data.category} ${data.content}`),
    visibility: data.visibility,
    log_date: data.logDate,
  });
}

export async function deleteGrowthLog(id: string) {
  const supabase = createClient();
  return await supabase.from("growth_logs").delete().eq("id", id);
}
