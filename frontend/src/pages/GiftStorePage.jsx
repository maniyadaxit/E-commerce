import { useEffect, useState } from "react";
import { searchProducts } from "../api/catalogApi";
import { ProductGrid } from "../components/product/ProductGrid";
import { Button } from "../components/ui/Button";

const giftFilters = {
  occasion: ["Wedding", "Birthday", "Anniversary", "Just Because"],
  theme: ["Evil Eye", "Nature", "Butterfly", "Romantic", "Zodiac", "Spiritual"],
  recipient: [
    "For Her",
    "For Him",
    "For Couple",
    "For Mother",
    "For Sister",
    "For Friend",
    "For Kids",
  ],
};

export function GiftStorePage() {
  const [activeRecipient, setActiveRecipient] = useState("For Her");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const response = await searchProducts({ recipient: activeRecipient, size: 12 });
        setProducts(response.items || []);
      } catch {
        setProducts([]);
      }
    }
    load();
  }, [activeRecipient]);

  return (
    <section className="section-shell py-10">
      <div className="rounded-[2.5rem] bg-ink px-6 py-10 text-white shadow-soft md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          Gift Store
        </p>
        <h1 className="mt-4 font-display text-5xl md:text-6xl">
          Premium gifting edits for every bond.
        </h1>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px,1fr]">
        <aside className="space-y-6 rounded-[2rem] bg-white p-6 shadow-soft">
          {Object.entries(giftFilters).map(([key, values]) => (
            <div key={key}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
                {key}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {values.map((value) => (
                  <Button
                    key={value}
                    variant={activeRecipient === value ? "accent" : "secondary"}
                    className="px-4 py-2"
                    onClick={() => key === "recipient" && setActiveRecipient(value)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </aside>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
