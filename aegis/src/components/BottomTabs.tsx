export type TabKey = "evidence" | "metrics" | "policy";

const tabs: { key: TabKey; label: string }[] = [
  { key: "evidence", label: "Evidence" },
  { key: "metrics", label: "Metrics" },
  { key: "policy", label: "Policy" },
];

export default function BottomTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <div className="border border-neutral-800 bg-neutral-950 p-3">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            type="button"
            className={[
              "border px-3 py-2 font-mono text-xs font-semibold tracking-[0.1em] uppercase transition",
              active === t.key
                ? "border-red-500/50 bg-red-500/10 text-red-400"
                : "border-neutral-800 bg-neutral-900 text-neutral-500 hover:border-neutral-700 hover:text-neutral-400",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
