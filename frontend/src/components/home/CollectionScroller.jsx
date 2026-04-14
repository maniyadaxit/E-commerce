import { Link } from "react-router-dom";
import { ProductCard } from "../product/ProductCard";

export function CollectionScroller({ title, products = [] }) {
  return (
    <section className="section-shell mt-20">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
            Just In
          </p>
          <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">{title}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-copy/72">
            This section updates automatically and only shows products added in the last 7 days.
          </p>
        </div>
        <Link
          to="/search?sort=newest"
          className="text-[11px] font-semibold uppercase tracking-[0.24em] text-copy/65 transition hover:text-accent"
        >
          View All
        </Link>
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.78fr,1.22fr]">
        <div className="overflow-hidden rounded-[2.2rem] bg-ink p-8 text-white shadow-soft">
          <p className="text-[11px] uppercase tracking-[0.24em] text-accent/85">New Arrival Window</p>
          <h3 className="mt-4 font-display text-5xl">Only the freshest drops.</h3>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/68">
            Older catalog items are intentionally hidden here so shoppers always see what
            landed most recently from the admin panel.
          </p>
          <div className="mt-8 rounded-[1.7rem] border border-white/10 bg-white/5 p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
              Live rule
            </p>
            <p className="mt-3 font-display text-3xl text-white">Created within the last 7 days</p>
          </div>
        </div>
        {products.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[#d9ccbd] bg-white p-8 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">
              No recent products yet
            </p>
            <h3 className="mt-3 font-display text-4xl text-ink">
              Nothing new has been added in the last 7 days.
            </h3>
            <p className="mt-3 text-sm leading-7 text-copy/72">
              Add fresh products from the owner panel and they will appear here automatically
              without showing older catalog entries.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
