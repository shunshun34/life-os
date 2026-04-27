import { RuleItemManager } from "./rule-item-manager";
import { RulesSection } from "./rules-section";
import type { RuleItem } from "@/lib/rules/rule-items";

export function RulesView({
  rules,
  items = [],
  onEditHref = "/settings?mode=edit",
}: {
  rules: any;
  items?: RuleItem[];
  onEditHref?: string;
}) {
  return (
    <div className="space-y-5 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-sky-700">Life OS Ver.5</p>
          <h1 className="text-4xl font-black">ルール</h1>
          <p className="mt-1 text-slate-500">毎日見るための行動固定表</p>
        </div>

        <a
          href={onEditHref}
          className="rounded-full border bg-white px-4 py-2 text-sm font-bold shadow-sm"
        >
          ✏️ 編集
        </a>
      </header>

      <RulesSection icon="🕒" title="最重要ルール" accent>
        <p>起床：{rules.wake_up_time}</p>
        <p>就寝：{rules.sleep_time}</p>
        <p>{rules.sleep_rule}</p>
      </RulesSection>

      <RulesSection icon="🍚" title="食事ルール">
        <div>
          <p className="font-bold">朝</p>
          <p>{rules.breakfast_rule}</p>
        </div>
        <div>
          <p className="font-bold">昼</p>
          <p>{rules.lunch_rule}</p>
        </div>
        <div>
          <p className="font-bold">夜</p>
          <p>{rules.dinner_rule}</p>
        </div>
        <div>
          <p className="font-bold">制御ルール</p>
          <p>{rules.diet_control_rule}</p>
        </div>
      </RulesSection>

      <RulesSection icon="💧" title="水分・健康">
        <p>水分：{rules.water_rule}</p>
        <p>不足時は夜で調整</p>
      </RulesSection>

      <RulesSection icon="🚃" title="スキマ時間活用">
        <p>通勤：{rules.commute_rule}</p>
        <p>昼：{rules.lunch_break_rule}</p>
      </RulesSection>

      <RulesSection icon="🧩" title="任意ルール">
        {rules.extra_rules?.length ? (
          <ul className="list-disc space-y-1 pl-5">
            {rules.extra_rules.map((rule: string, index: number) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">任意ルールはまだありません。</p>
        )}
      </RulesSection>

      <RuleItemManager items={items} />

      <div className="rounded-2xl bg-slate-900 p-4 text-center text-lg font-bold text-white">
        今日守る
      </div>
    </div>
  );
}