
import { createClient } from "@/lib/supabase";

function extractTags(input: string): string[] {
  const found = input.match(/#([^\s#]+)/g) ?? [];
  return [...new Set(found.map((tag) => tag.replace(/^#/, "")))];
}

export async function getNotes() {
  const supabase = createClient();
  return await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function addNote(data: {
  title: string;
  body: string;
  visibility: "private" | "partner" | "public";
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインしていません");

  return await supabase.from("notes").insert({
    user_id: user.id,
    title: data.title,
    body: data.body,
    tags: extractTags(`${data.title} ${data.body}`),
    visibility: data.visibility,
  });
}

export async function deleteNote(id: string) {
  const supabase = createClient();
  return await supabase.from("notes").delete().eq("id", id);
}
