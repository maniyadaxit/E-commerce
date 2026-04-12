import { Link } from "react-router-dom";
import { footerPartners, popularSearches } from "../../data/marketing";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-ink/10 bg-white">
      <div className="section-shell py-14">
        <div className="grid gap-10 lg:grid-cols-4">
          <div>
            <p className="font-display text-3xl text-ink">Aurora Gems</p>
            <p className="mt-4 text-sm leading-7 text-copy/75">
              Wear What You Feel with premium silver, rose gold, and occasion-led
              jewelry designed for everyday gifting and self-expression.
            </p>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-ink/60">
              Quick Links
            </p>
            <div className="space-y-3 text-sm">
              <Link to="/collections/rings">Rings</Link>
              <Link to="/collections/pendants">Pendants</Link>
              <Link to="/pages/gift-store">Gift Store</Link>
              <Link to="/blogs/tales">Tales</Link>
            </div>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-ink/60">
              Contact
            </p>
            <div className="space-y-3 text-sm text-copy/80">
              <p>hello@auroragems.com</p>
              <p>+91 80000 00000</p>
              <p>Mon-Sat, 10AM-7PM</p>
            </div>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-ink/60">
              Channel Partners
            </p>
            <div className="flex flex-wrap gap-2">
              {footerPartners.map((partner) => (
                <span
                  key={partner}
                  className="rounded-full border border-ink/10 px-3 py-2 text-xs"
                >
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-ink/10 pt-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-ink/50">
            Popular Searches
          </p>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((term) => (
              <Link
                key={term}
                to={`/search?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-ink/10 px-3 py-2 text-xs text-copy/80"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
