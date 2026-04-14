import { Link } from "react-router-dom";
import { categoryStrip } from "../../data/marketing";
import { useStoreCollections } from "../../hooks/useStoreCollections";

export function CategoryStrip() {
  const collections = useStoreCollections(6);
  const items = collections.length
    ? collections.map((collection) => ({
        id: collection.id,
        label: collection.name,
        href: `/collections/${collection.handle}`,
        description: collection.description || "Curated everyday essentials",
        count: collection.productCount,
      }))
    : categoryStrip.map((category) => ({
        id: category,
        label: category,
        href: `/search?q=${encodeURIComponent(category)}`,
        description: "Fresh catalog edit",
        count: null,
      }));

  return (
    <section className="section-shell mt-16">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
          Browse by Type
        </p>
        <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">
          Discover signature categories.
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.href}
            className="group min-w-[170px] overflow-hidden rounded-[1.8rem] border border-[#e2d8ca] bg-white px-5 py-7 shadow-soft transition hover:-translate-y-1.5 hover:border-accent/45"
          >
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/12 font-display text-2xl text-accent transition group-hover:bg-accent group-hover:text-white">
              {item.label.charAt(0)}
            </span>
            <p className="mt-5 font-display text-3xl text-ink">{item.label}</p>
            <p className="mt-2 text-sm leading-6 text-copy/68">{item.description}</p>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-copy/45">
              {item.count ? `${item.count} styles` : "Explore now"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
