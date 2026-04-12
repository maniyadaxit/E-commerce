import { useEffect, useState } from "react";
import { getStores } from "../api/storeApi";
import { Button } from "../components/ui/Button";

export function StoreLocatorPage() {
  const [query, setQuery] = useState("");
  const [stores, setStores] = useState([]);
  const [activeStore, setActiveStore] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await getStores(query);
      setStores(data);
      setActiveStore(data[0]);
    }
    load();
  }, [query]);

  return (
    <section className="section-shell py-10">
      <div className="rounded-[2.5rem] bg-white p-8 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/50">
          Store Locator
        </p>
        <h1 className="mt-3 font-display text-5xl text-ink">Find a store near you.</h1>
        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="flex-1 rounded-full border border-ink/10 px-5 py-4"
            placeholder="Search by city or pincode"
          />
          <Button>Search</Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[360px,1fr]">
        <div className="space-y-4">
          {stores.map((store) => (
            <button
              key={store.name}
              type="button"
              className={`w-full rounded-[1.75rem] border p-5 text-left shadow-soft ${
                activeStore?.name === store.name
                  ? "border-accent bg-white"
                  : "border-ink/10 bg-white/70"
              }`}
              onClick={() => setActiveStore(store)}
            >
              <p className="font-display text-3xl text-ink">{store.city}</p>
              <p className="mt-2 text-sm font-semibold text-ink">{store.name}</p>
              <p className="mt-2 text-sm leading-6 text-copy/70">{store.address}</p>
            </button>
          ))}
        </div>
        {activeStore ? (
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-soft">
            <iframe
              title={activeStore.name}
              src={activeStore.mapEmbedUrl}
              className="h-[520px] w-full border-0"
              loading="lazy"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
