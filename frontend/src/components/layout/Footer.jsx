import { Link } from "react-router-dom";
import { useStoreCollections } from "../../hooks/useStoreCollections";
import { footerPartners, popularSearches } from "../../data/marketing";

export function Footer() {
  const collections = useStoreCollections(3);
  const quickLinks = collections.length
    ? collections.map((collection) => ({
        label: collection.name,
        href: `/collections/${collection.handle}`,
      }))
    : [
        { label: "Rings", href: "/collections/rings" },
        { label: "Pendants", href: "/collections/pendants" },
      ];

  return (
    <footer className="mt-24 bg-[#140f0c] text-white">
      <div className="section-shell py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr,0.8fr,1fr]">
          <div>
            <p className="font-display text-4xl tracking-[0.18em] text-white">Aurora Gems</p>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/58">
              Crafting everyday luxury in silver and gold-toned finishes, with gift-ready
              presentation and a storefront that updates live from your latest admin edits.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Instagram", "Pinterest", "WhatsApp", "YouTube"].map((channel) => (
                <span
                  key={channel}
                  className="rounded-full border border-white/12 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/55"
                >
                  {channel}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/38">
              Collections
            </p>
            <div className="space-y-3 text-sm text-white/72">
              {quickLinks.map((link) => (
                <Link key={link.href} to={link.href}>
                  {link.label}
                </Link>
              ))}
              <Link to="/pages/gift-store">Gift Store</Link>
              <Link to="/search?sort=newest">New In</Link>
              <Link to="/account/login">Login</Link>
              <Link to="/account/register">Sign Up</Link>
            </div>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/38">
              Contact
            </p>
            <div className="space-y-3 text-sm text-white/60">
              <p>hello@auroragems.com</p>
              <p>+91 80000 00000</p>
              <p>Mon-Sat, 10AM-7PM</p>
              <Link to="/account/orders" className="block text-white/72">
                Track Orders
              </Link>
              <Link to="/account/profile" className="block text-white/72">
                Profile
              </Link>
            </div>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/38">
              Payment & Partners
            </p>
            <div className="flex flex-wrap gap-2">
              {footerPartners.map((partner) => (
                <span
                  key={partner}
                  className="rounded-full border border-white/12 px-3 py-2 text-xs text-white/62"
                >
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/38">
            Popular Searches
          </p>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((term) => (
              <Link
                key={term}
                to={`/search?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-white/12 px-3 py-2 text-xs text-white/58"
              >
                {term}
              </Link>
            ))}
          </div>
          <div className="mt-8 text-xs uppercase tracking-[0.22em] text-white/28">
            © 2026 Aurora Gems. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
