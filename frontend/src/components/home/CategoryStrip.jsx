import { Link } from "react-router-dom";
import { categoryStrip } from "../../data/marketing";

export function CategoryStrip() {
  return (
    <section className="section-shell mt-10">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {categoryStrip.map((category) => (
          <Link
            key={category}
            to={`/search?q=${encodeURIComponent(category)}`}
            className="gold-ring flex min-w-[110px] flex-col items-center gap-3 rounded-[1.5rem] bg-white px-4 py-5 text-center shadow-soft"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/12 font-display text-2xl text-accent">
              {category.charAt(0)}
            </span>
            <span className="text-sm font-medium text-ink">{category}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
