import { ProductCard } from "../product/ProductCard";

export function BestsellersCarousel({ products }) {
  return (
    <section className="section-shell mt-16">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
          Bestsellers
        </p>
        <h2 className="font-display text-4xl text-ink md:text-5xl">
          Pieces customers keep coming back for.
        </h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <div key={product.id} className="min-w-[280px] max-w-[280px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
