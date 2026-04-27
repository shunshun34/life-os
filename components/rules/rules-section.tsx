export function RulesSection({
  icon,
  title,
  children,
  accent = false,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm ${
        accent ? "bg-blue-50 border-blue-100" : "bg-white"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="space-y-2 text-base leading-8 text-slate-800">
        {children}
      </div>
    </section>
  );
}