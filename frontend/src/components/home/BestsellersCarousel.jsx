import { ProductCard } from "../product/ProductCard";

export function BestsellersCarousel({ products }) {
  return (
    <section className="section-shell mt-16">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
            Most Loved
          </p>
          <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">
            Best sellers worth repeating.
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-copy/72">
          These are the styles customers keep returning for, with standout gifting appeal
          and reliable everyday wear.
        </p>
      </div>
      {products?.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-[#d9ccbd] bg-white px-6 py-10 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">
            Waiting for bestsellers
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-copy/72">
            Once products and reviews start coming in, your best-performing pieces will show up here.
          </p>
        </div>
      )}
    </section>
  );
}
