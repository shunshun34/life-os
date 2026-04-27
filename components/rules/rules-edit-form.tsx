import { saveUserRules } from "@/lib/rules/save-user-rules";

export function RulesEditForm({ rules }: { rules: any }) {
  return (
    <form
      action={async (formData) => {
        "use server";

        const extraRulesText = String(formData.get("extra_rules") || "");
        const extraRules = extraRulesText
          .split("\n")
          .map((v) => v.trim())
          .filter(Boolean);

        await saveUserRules({
          wake_up_time: String(formData.get("wake_up_time") || ""),
          sleep_time: String(formData.get("sleep_time") || ""),
          sleep_rule: String(formData.get("sleep_rule") || ""),
          breakfast_rule: String(formData.get("breakfast_rule") || ""),
          lunch_rule: String(formData.get("lunch_rule") || ""),
          dinner_rule: String(formData.get("dinner_rule") || ""),
          diet_control_rule: String(formData.get("diet_control_rule") || ""),
          water_rule: String(formData.get("water_rule") || ""),
          commute_rule: String(formData.get("commute_rule") || ""),
          lunch_break_rule: String(formData.get("lunch_break_rule") || ""),
          extra_rules: extraRules,
        });
      }}
      className="space-y-4 pb-24"
    >
      <header>
        <h1 className="text-4xl font-black">ルール編集</h1>
        <p className="mt-1 text-slate-500">月1回だけ見直す場所</p>
      </header>

      <input name="wake_up_time" type="time" defaultValue={rules.wake_up_time} className="w-full rounded-xl border p-3" />
      <input name="sleep_time" type="time" defaultValue={rules.sleep_time} className="w-full rounded-xl border p-3" />

      <textarea name="sleep_rule" defaultValue={rules.sleep_rule} className="w-full rounded-xl border p-3" placeholder="睡眠ルール" />
      <textarea name="breakfast_rule" defaultValue={rules.breakfast_rule} className="w-full rounded-xl border p-3" placeholder="朝食内容" />
      <textarea name="lunch_rule" defaultValue={rules.lunch_rule} className="w-full rounded-xl border p-3" placeholder="昼食ルール" />
      <textarea name="dinner_rule" defaultValue={rules.dinner_rule} className="w-full rounded-xl border p-3" placeholder="夕食ルール" />
      <textarea name="diet_control_rule" defaultValue={rules.diet_control_rule} className="w-full rounded-xl border p-3" placeholder="食事制御ルール" />
      <input name="water_rule" defaultValue={rules.water_rule} className="w-full rounded-xl border p-3" placeholder="水分目標" />
      <textarea name="commute_rule" defaultValue={rules.commute_rule} className="w-full rounded-xl border p-3" placeholder="通勤ルール" />
      <textarea name="lunch_break_rule" defaultValue={rules.lunch_break_rule} className="w-full rounded-xl border p-3" placeholder="昼休みルール" />

      <textarea
        name="extra_rules"
        defaultValue={(rules.extra_rules ?? []).join("\n")}
        className="min-h-32 w-full rounded-xl border p-3"
        placeholder="任意ルール。1行に1つ"
      />

      <div className="flex gap-3">
        <a
          href="/settings"
          className="flex-1 rounded-xl border bg-white p-3 text-center font-bold"
        >
          キャンセル
        </a>
        <button className="flex-1 rounded-xl bg-blue-600 p-3 font-bold text-white">
          保存
        </button>
      </div>
    </form>
  );
}