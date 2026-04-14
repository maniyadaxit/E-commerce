import { Link } from "react-router-dom";

const menuColumns = [
  {
    heading: "Rings",
    links: ["Shop by Price", "Shop by Metal", "Shop by Colour", "Shop by Style"],
  },
  {
    heading: "Pendants",
    links: ["Shop by Price", "Shop by Metal", "Shop by Colour", "Shop by Style"],
  },
  {
    heading: "Bracelets",
    links: ["Shop by Price", "Shop by Metal", "Shop by Colour", "Shop by Style"],
  },
  {
    heading: "Other",
    links: ["Mangalsutras", "Chains", "Nose Pins", "Kids", "Sets", "Personalised"],
  },
];

export function MegaMenu({ open, collections = [], onNavigate }) {
  return (
    <div
      className={`card-surface absolute left-1/2 top-full z-40 mt-5 hidden w-[min(90vw,72rem)] -translate-x-1/2 p-8 transition-all duration-200 xl:block ${
        open
          ? "visible translate-y-0 opacity-100 pointer-events-auto"
          : "invisible translate-y-3 opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {collections.length ? (
        <div className="grid grid-cols-4 gap-5">
          {collections.slice(0, 8).map((collection) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.handle}`}
              className="rounded-[1.75rem] border border-ink/8 bg-cream/35 p-5 transition hover:border-accent"
              onClick={onNavigate}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
                Collection
              </p>
              <p className="mt-3 font-display text-3xl text-ink">{collection.name}</p>
              <p className="mt-3 text-sm leading-6 text-copy/72">
                {collection.description || "Browse the live collection edit."}
              </p>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-accent">
                {collection.productCount} products
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-8">
          {menuColumns.map((column) => (
            <div key={column.heading}>
              <p className="mb-4 font-display text-2xl text-ink">{column.heading}</p>
              <div className="space-y-3 text-sm text-copy/80">
                {column.links.map((link) => (
                  <Link
                    key={link}
                    className="block transition hover:text-accent"
                    to={`/search?q=${encodeURIComponent(link)}`}
                    onClick={onNavigate}
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
