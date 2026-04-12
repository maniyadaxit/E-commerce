export function PriceSlider({ minValue, maxValue, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <input
        type="number"
        min="0"
        value={minValue}
        onChange={(event) => onChange({ min: Number(event.target.value), max: maxValue })}
        className="rounded-2xl border border-ink/10 px-4 py-3"
        placeholder="Min"
      />
      <input
        type="number"
        min="0"
        value={maxValue}
        onChange={(event) => onChange({ min: minValue, max: Number(event.target.value) })}
        className="rounded-2xl border border-ink/10 px-4 py-3"
        placeholder="Max"
      />
    </div>
  );
}
