import {
  createRuleItem,
  deleteRuleItem,
  updateRuleItem,
  type RuleCategory,
  type RuleItem,
} from "@/lib/rules/rule-items";

const CATEGORIES: RuleCategory[] = ["重要", "食事", "健康", "スキマ時間", "任意"];

const CATEGORY_ICONS: Record<RuleCategory, string> = {
  重要: "🕒",
  食事: "🍚",
  健康: "💧",
  スキマ時間: "🚃",
  任意: "🧩",
};

function CategorySelect({ defaultValue }: { defaultValue?: RuleCategory }) {
  return (
    <select
      name="category"
      defaultValue={defaultValue ?? "任意"}
      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-800"
    >
      {CATEGORIES.map((category) => (
        <option key={category} value={category}>
          {CATEGORY_ICONS[category]} {category}
        </option>
      ))}
    </select>
  );
}

export function RuleItemManager({ items }: { items: RuleItem[] }) {
  const grouped = CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <section className="space-y-5 pb-24">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-bold text-sky-700">登録</p>
          <h2 className="text-2xl font-black text-slate-950">ルールを追加</h2>
          <p className="mt-1 text-sm text-slate-500">
            固定ルール以外に、あとから増やしたいルールをここで登録します。
          </p>
        </div>

        <form action={createRuleItem} className="grid gap-3 md:grid-cols-[160px_1fr_1.3fr_100px_auto] md:items-start">
          <CategorySelect />
          <input
            name="title"
            placeholder="例：夜の制御"
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            required
          />
          <textarea
            name="body"
            placeholder="例：揚げ物・高脂質は週2まで。連続は禁止。"
            className="min-h-12 w-full rounded-xl border border-slate-200 p-3 text-sm"
            required
          />
          <input
            name="sort_order"
            type="number"
            defaultValue={100}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            aria-label="表示順"
          />
          <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white md:whitespace-nowrap">
            追加
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-bold text-sky-700">編集・削除</p>
          <h2 className="text-2xl font-black text-slate-950">追加ルール一覧</h2>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
            追加ルールはまだありません。上のフォームから登録できます。
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.category} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-lg font-black text-slate-950">
                {CATEGORY_ICONS[group.category]} {group.category}
              </h3>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-black text-slate-950">{item.title}</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.body}</p>
                      </div>

                      <form action={deleteRuleItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <button className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600">
                          削除
                        </button>
                      </form>
                    </div>

                    <details className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                      <summary className="cursor-pointer text-sm font-bold text-slate-700">編集する</summary>
                      <form action={updateRuleItem} className="mt-3 grid gap-3 md:grid-cols-[160px_1fr_1.3fr_100px_auto] md:items-start">
                        <input type="hidden" name="id" value={item.id} />
                        <CategorySelect defaultValue={item.category} />
                        <input
                          name="title"
                          defaultValue={item.title}
                          className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                          required
                        />
                        <textarea
                          name="body"
                          defaultValue={item.body}
                          className="min-h-12 w-full rounded-xl border border-slate-200 p-3 text-sm"
                          required
                        />
                        <input
                          name="sort_order"
                          type="number"
                          defaultValue={item.sort_order ?? 100}
                          className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                        />
                        <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white md:whitespace-nowrap">
                          保存
                        </button>
                      </form>
                    </details>
                  </article>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
