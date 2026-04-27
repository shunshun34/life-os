"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

export type RuleCategory = "重要" | "食事" | "健康" | "スキマ時間" | "任意";

export type RuleItem = {
  id: string;
  user_id: string;
  category: RuleCategory;
  title: string;
  body: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const CATEGORIES: RuleCategory[] = ["重要", "食事", "健康", "スキマ時間", "任意"];

function toCategory(value: FormDataEntryValue | null): RuleCategory {
  const text = String(value || "任意");
  return CATEGORIES.includes(text as RuleCategory) ? (text as RuleCategory) : "任意";
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No user");
  return { supabase, user };
}

export async function getRuleItems() {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("user_rule_items")
    .select("*")
    .eq("user_id", user.id)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    // SQL未適用でも画面全体が落ちないようにする
    if (error.code === "42P01") return [] as RuleItem[];
    throw error;
  }

  return (data ?? []) as RuleItem[];
}

export async function createRuleItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!title || !body) throw new Error("タイトルと内容を入力してください。");

  const { error } = await supabase.from("user_rule_items").insert({
    user_id: user.id,
    category: toCategory(formData.get("category")),
    title,
    body,
    sort_order: Number(formData.get("sort_order") || 100),
  });

  if (error) throw error;
  revalidatePath("/settings");
}

export async function updateRuleItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!id) throw new Error("更新対象がありません。  ");
  if (!title || !body) throw new Error("タイトルと内容を入力してください。 ");

  const { error } = await supabase
    .from("user_rule_items")
    .update({
      category: toCategory(formData.get("category")),
      title,
      body,
      sort_order: Number(formData.get("sort_order") || 100),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/settings");
}

export async function deleteRuleItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("削除対象がありません。 ");

  const { error } = await supabase
    .from("user_rule_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/settings");
}
