import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/formatPrice";

export function CollectionScroller({ title, products = [] }) {
  return (
    <section className="section-shell mt-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
            Curated Edit
          </p>
          <h2 className="font-display text-4xl text-ink md:text-5xl">{title}</h2>
        </div>
        <Link to="/search?sort=newest" className="text-sm font-semibold text-accent">
          View All
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.35fr,1fr]">
        <div className="overflow-hidden rounded-[2rem] bg-ink p-8 text-white shadow-soft">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Latest Collection</p>
          <h3 className="mt-4 font-display text-5xl">Luxury Within Reach</h3>
          <p className="mt-4 max-w-md text-white/75">
            Sculpted silhouettes and premium finishes designed for everyday gifting.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {products.slice(0, 3).map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.slug}`}
              className="rounded-[1.5rem] bg-white p-3 shadow-soft"
            >
              <img
                src={product.primaryImageUrl}
                alt={product.name}
                className="aspect-[4/5] rounded-[1.2rem] object-cover"
                loading="lazy"
              />
              <p className="mt-3 line-clamp-2 text-sm font-medium text-ink">{product.name}</p>
              <p className="mt-2 text-sm text-copy/70">{formatPrice(product.price)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
