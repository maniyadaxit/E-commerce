import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products = [],
  footer,
  emptyTitle = "No products available yet.",
  emptyDescription = "New catalog items will appear here once they are added from the owner panel.",
}) {
  if (!products.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-ink/12 bg-white/85 px-6 py-10 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/45">
          Catalog Empty
        </p>
        <h3 className="mt-3 font-display text-4xl text-ink">{emptyTitle}</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-copy/72">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {footer ? <div className="mt-8">{footer}</div> : null}
    </div>
  );
}
