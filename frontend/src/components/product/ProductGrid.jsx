import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, footer }) {
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
