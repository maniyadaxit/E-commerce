import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchProducts } from "../api/catalogApi";
import { ProductGrid } from "../components/product/ProductGrid";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { useDebounce } from "../hooks/useDebounce";
import { popularSearches } from "../data/marketing";
import { mockProducts } from "../data/mockCatalog";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    async function load() {
      if (!debouncedQuery) {
        setResults(mockProducts);
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const response = await searchProducts({ q: debouncedQuery, size: 9 });
        setResults(response.items);
        setSuggestions(response.items.slice(0, 5));
      } catch {
        const fallback = mockProducts.filter((product) =>
          product.name.toLowerCase().includes(debouncedQuery.toLowerCase())
        );
        setResults(fallback);
        setSuggestions(fallback.slice(0, 5));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [debouncedQuery]);

  return (
    <section className="section-shell py-10">
      <div className="relative rounded-[2rem] bg-white p-6 shadow-soft">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSearchParams(event.target.value ? { q: event.target.value } : {});
          }}
          className="w-full rounded-full border border-ink/10 px-5 py-4 text-lg"
          placeholder="Search rings, pendants, pure gold, evil eye..."
        />
        {query && suggestions.length ? (
          <div className="absolute left-6 right-6 top-[92px] rounded-[1.5rem] border border-ink/10 bg-white p-3 shadow-soft">
            {suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                className="block w-full rounded-2xl px-4 py-3 text-left text-sm hover:bg-cream"
                onClick={() => setQuery(item.name)}
              >
                {item.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {popularSearches.map((term) => (
          <Button
            key={term}
            variant="secondary"
            className="px-4 py-2"
            onClick={() => {
              setQuery(term);
              setSearchParams({ q: term });
            }}
          >
            {term}
          </Button>
        ))}
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[420px]" />
            ))}
          </div>
        ) : (
          <ProductGrid products={results} />
        )}
      </div>
    </section>
  );
}
