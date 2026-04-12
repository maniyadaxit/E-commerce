import { CheckboxGroup } from "./CheckboxGroup";
import { PriceSlider } from "./PriceSlider";

export function FilterSidebar({ filters, setFilters }) {
  const toggleValue = (key, value) => {
    setFilters((current) => {
      const exists = current[key].includes(value);
      return {
        ...current,
        [key]: exists
          ? current[key].filter((entry) => entry !== value)
          : [...current[key], value],
      };
    });
  };

  return (
    <aside className="card-surface space-y-8 rounded-[2rem] p-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
          Price Range
        </p>
        <PriceSlider
          minValue={filters.minPrice}
          maxValue={filters.maxPrice}
          onChange={({ min, max }) =>
            setFilters((current) => ({ ...current, minPrice: min, maxPrice: max }))
          }
        />
      </div>
      <CheckboxGroup
        title="Metal"
        options={[
          { label: "925 Silver", value: "SILVER" },
          { label: "Pure Gold", value: "GOLD" },
          { label: "Gold Plated", value: "GOLD_PLATED" },
          { label: "Lab Diamond", value: "LAB_DIAMOND" },
        ]}
        values={filters.metal}
        onToggle={(value) => toggleValue("metal", value)}
      />
      <CheckboxGroup
        title="Colour"
        options={[
          { label: "Silver", value: "SILVER" },
          { label: "Gold", value: "GOLD" },
          { label: "Rose Gold", value: "ROSE_GOLD" },
          { label: "Oxidised Silver", value: "OXIDISED" },
        ]}
        values={filters.color}
        onToggle={(value) => toggleValue("color", value)}
      />
      <CheckboxGroup
        title="Style"
        options={[
          { label: "Everyday", value: "Everyday" },
          { label: "Office", value: "Office" },
          { label: "Party", value: "Party" },
          { label: "Wedding", value: "Wedding" },
        ]}
        values={filters.style}
        onToggle={(value) => toggleValue("style", value)}
      />
    </aside>
  );
}
