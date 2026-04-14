import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { formatPrice } from "../../utils/formatPrice";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { RatingStars } from "../ui/RatingStars";

export function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isSaved, toggle } = useWishlist();
  const savings =
    product.mrp && product.price && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;
  const isNewProduct = product.createdAt
    ? Date.now() - new Date(product.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000
    : false;

  return (
    <article className="group relative overflow-hidden rounded-[1.9rem] border border-[#e2d8ca] bg-white p-4 shadow-soft transition duration-300 hover:-translate-y-1.5 hover:border-accent/45">
      <button
        type="button"
        className="absolute right-5 top-5 z-10 rounded-full bg-white/90 p-2 shadow"
        onClick={() => toggle(product)}
      >
        <Heart
          size={16}
          className={isSaved(product.id) ? "fill-sale text-sale" : "text-ink"}
        />
      </button>

      <Link to={`/products/${product.slug}`}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[linear-gradient(145deg,#f3ece3,#e9decd)]">
          <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
            {isNewProduct ? <Badge tone="accent">New</Badge> : null}
            {product.sale ? <Badge tone="sale">Sale</Badge> : null}
            {product.bestseller ? <Badge tone="accent">Bestseller</Badge> : null}
          </div>
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] group-hover:opacity-0"
            loading="lazy"
          />
          <img
            src={product.hoverImageUrl || product.primaryImageUrl}
            alt={`${product.name} alternate`}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="mt-5 space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-copy/45">
          {(product.metal || "Silver").replaceAll("_", " ")}
        </p>
        <RatingStars value={product.rating || 0} reviews={product.reviewCount || 0} />
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-display text-2xl text-ink">{product.name}</h3>
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold text-ink">{formatPrice(product.price)}</span>
          {product.mrp > product.price ? (
            <span className="text-copy/50 line-through">
              {formatPrice(product.mrp)}
            </span>
          ) : null}
          {savings ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              {savings}% off
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {product.colourSwatches?.map((swatch) => (
            <span
              key={swatch}
              className="gold-ring inline-flex h-5 w-5 rounded-full bg-gradient-to-br from-white to-accent/30"
              title={swatch}
            />
          ))}
        </div>
        <Button
          className="w-full"
          onClick={() =>
            addItem({
              productId: product.id,
              quantity: 1,
              price: product.price,
              product: {
                name: product.name,
                slug: product.slug,
                primaryImageUrl: product.primaryImageUrl,
              },
            })
          }
        >
          Add to Cart
        </Button>
      </div>
    </article>
  );
}
