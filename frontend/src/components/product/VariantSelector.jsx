export function VariantSelector({ title, options = [], value, onChange }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/50">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const optionValue = option.value ?? option;
          const optionLabel = option.label ?? option;
          return (
            <button
              key={optionValue}
              type="button"
              className={`rounded-full border px-4 py-2 text-sm ${
                value === optionValue
                  ? "border-accent bg-accent/10 text-ink"
                  : "border-ink/10 bg-white text-copy"
              }`}
              onClick={() => onChange(optionValue)}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
