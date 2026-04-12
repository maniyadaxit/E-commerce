import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCollectionProducts } from "../api/catalogApi";
import { FilterSidebar } from "../components/filters/FilterSidebar";
import { ProductGrid } from "../components/product/ProductGrid";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { mockProducts } from "../data/mockCatalog";

const initialFilters = {
  metal: [],
  color: [],
  style: [],
  minPrice: 0,
  maxPrice: 5000000,
  sort: "relevance",
};

export function CollectionPage() {
  const { handle } = useParams();
  const [filters, setFilters] = useState(initialFilters);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(
    async (nextPage, replace = false) => {
      setLoading(true);
      try {
        const response = await getCollectionProducts(handle, {
          page: nextPage,
          size: 9,
          metal: filters.metal[0],
          color: filters.color[0],
          style: filters.style[0],
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          sort: filters.sort,
        });
        setProducts((current) =>
          replace ? response.items : [...current, ...response.items]
        );
        setHasNext(response.hasNext);
        setPage(nextPage);
      } catch {
        setProducts(mockProducts);
        setHasNext(false);
      } finally {
        setLoading(false);
      }
    },
    [filters, handle]
  );

  useEffect(() => {
    loadProducts(0, true);
  }, [loadProducts]);

  const sentinelRef = useInfiniteScroll(
    () => {
      if (!loading && hasNext) {
        loadProducts(page + 1);
      }
    },
    hasNext
  );

  return (
    <section className="section-shell py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Collections", href: "/search" },
          { label: handle },
        ]}
      />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
            Collection
          </p>
          <h1 className="font-display text-5xl capitalize text-ink">{handle}</h1>
        </div>
        <select
          value={filters.sort}
          onChange={(event) =>
            setFilters((current) => ({ ...current, sort: event.target.value }))
          }
          className="rounded-full border border-ink/10 bg-white px-4 py-3 text-sm"
        >
          <option value="relevance">Relevance</option>
          <option value="price-low-high">Price Low-High</option>
          <option value="price-high-low">Price High-Low</option>
          <option value="newest">Newest</option>
          <option value="bestseller">Bestseller</option>
        </select>
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <FilterSidebar filters={filters} setFilters={setFilters} />
        <div>
          {loading && !products.length ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-[420px]" />
              ))}
            </div>
          ) : (
            <ProductGrid
              products={products}
              footer={
                hasNext ? (
                  <div ref={sentinelRef} className="flex justify-center">
                    <Button variant="secondary" onClick={() => loadProducts(page + 1)}>
                      Load More
                    </Button>
                  </div>
                ) : null
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}
