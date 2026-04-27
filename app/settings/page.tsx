import { getUserRules } from "@/lib/rules/get-user-rules";
import { RulesView } from "@/components/rules/rules-view";
import { RulesEditForm } from "@/components/rules/rules-edit-form";
import { getRuleItems } from "@/lib/rules/rule-items";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: { mode?: string };
}) {
  const [rules, items] = await Promise.all([getUserRules(), getRuleItems()]);
  const isEdit = searchParams?.mode === "edit";

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-3xl">
        {isEdit ? <RulesEditForm rules={rules} /> : <RulesView rules={rules} items={items} />}
      </div>
    </main>
  );
}