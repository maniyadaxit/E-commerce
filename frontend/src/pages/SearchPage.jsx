import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchProducts } from "../api/catalogApi";
import { ProductGrid } from "../components/product/ProductGrid";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { useDebounce } from "../hooks/useDebounce";
import { popularSearches } from "../data/marketing";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!debouncedQuery) {
        setResults([]);
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const response = await searchProducts({ q: debouncedQuery, size: 9 });
        if (!active) {
          return;
        }
        setResults(response.items || []);
        setSuggestions((response.items || []).slice(0, 5));
      } catch {
        if (active) {
          setResults([]);
          setSuggestions([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    function refreshWhenVisible() {
      if (document.visibilityState === "visible" && debouncedQuery) {
        load();
      }
    }

    load();

    const intervalId = window.setInterval(() => {
      if (debouncedQuery) {
        load();
      }
    }, 30000);

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
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
          <ProductGrid
            products={results}
            emptyTitle={query ? "No matching products found." : "Start with a search term."}
            emptyDescription={
              query
                ? "Try a different keyword, finish, or category to find the right piece."
                : "Search by product name, metal, gifting intent, or collection."
            }
          />
        )}
      </div>
    </section>
  );
}
