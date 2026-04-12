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

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white p-4 shadow-soft">
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
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-cream">
          {product.sale ? (
            <div className="absolute left-4 top-4 z-10">
              <Badge tone="sale">Sale</Badge>
            </div>
          ) : null}
          {product.bestseller ? (
            <div className="absolute left-4 top-14 z-10">
              <Badge tone="accent">Bestseller</Badge>
            </div>
          ) : null}
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:opacity-0"
            loading="lazy"
          />
          <img
            src={product.hoverImageUrl || product.primaryImageUrl}
            alt={`${product.name} alternate`}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="mt-4 space-y-3">
        <RatingStars value={product.rating || 0} reviews={product.reviewCount || 0} />
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-display text-2xl text-ink">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-ink">{formatPrice(product.price)}</span>
          {product.mrp > product.price ? (
            <span className="text-copy/50 line-through">
              {formatPrice(product.mrp)}
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
          className="w-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
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
