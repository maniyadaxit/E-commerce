import { ProductGrid } from "../components/product/ProductGrid";
import { useWishlist } from "../hooks/useWishlist";

export function WishlistPage() {
  const { items } = useWishlist();

  return (
    <section className="section-shell py-10">
      <h1 className="font-display text-5xl text-ink">Wishlist</h1>
      <div className="mt-8">
        <ProductGrid products={items} />
      </div>
    </section>
  );
}
