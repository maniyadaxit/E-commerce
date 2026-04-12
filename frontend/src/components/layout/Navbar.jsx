import { ChevronDown, Heart, MapPin, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { MegaMenu } from "./MegaMenu";

export function Navbar() {
  const { user } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const megaMenuRef = useRef(null);

  const navLinks = [
    { label: "New In", href: "/search?sort=newest" },
    { label: "Rings", href: "/collections/rings" },
    { label: "Pendants", href: "/collections/pendants" },
    { label: "Earrings", href: "/collections/earrings" },
    { label: "Gift Store", href: "/pages/gift-store" },
  ];

  useEffect(() => {
    if (!megaMenuOpen) {
      return undefined;
    }

    function handleClickOutside(event) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setMegaMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMegaMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [megaMenuOpen]);

  return (
    <header className="sticky top-[43px] z-30 border-b border-ink/8 bg-cream/85 backdrop-blur">
      <div className="section-shell relative flex items-center justify-between gap-4 py-5">
        <div className="flex items-center gap-3 xl:hidden">
          <button
            type="button"
            className="rounded-full border border-ink/10 p-2"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            <Menu size={18} />
          </button>
        </div>

        <Link to="/" className="font-display text-4xl tracking-[0.2em] text-ink">
          AURORA GEMS
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-ink xl:flex">
          <div
            ref={megaMenuRef}
            className="relative"
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-2 transition hover:text-accent"
              onClick={() => setMegaMenuOpen((open) => !open)}
              aria-expanded={megaMenuOpen}
              aria-haspopup="true"
            >
              Shop By Category
              <ChevronDown
                size={16}
                className={`transition-transform ${megaMenuOpen ? "rotate-180" : ""}`}
              />
            </button>
            <MegaMenu open={megaMenuOpen} onNavigate={() => setMegaMenuOpen(false)} />
          </div>
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              className="transition hover:text-accent"
              onClick={() => setMegaMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <NavLink to="/search" className="hidden rounded-full border border-ink/10 p-3 md:inline-flex">
            <Search size={16} />
          </NavLink>
          <NavLink
            to="/pages/store-locator"
            className="hidden rounded-full border border-ink/10 p-3 md:inline-flex"
          >
            <MapPin size={16} />
          </NavLink>
          <NavLink
            to={user ? "/account/dashboard" : "/account/login"}
            className="rounded-full border border-ink/10 p-3"
          >
            <User size={16} />
          </NavLink>
          <NavLink to="/account/wishlist" className="relative rounded-full border border-ink/10 p-3">
            <Heart size={16} />
            {wishlistCount ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-ink">
                {wishlistCount}
              </span>
            ) : null}
          </NavLink>
          <NavLink to="/cart" className="relative rounded-full border border-ink/10 p-3">
            <ShoppingBag size={16} />
            {cartCount ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-ink">
                {cartCount}
              </span>
            ) : null}
          </NavLink>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-ink/8 bg-white px-4 py-4 xl:hidden">
          <div className="space-y-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.href}
                className="block rounded-2xl px-4 py-3 hover:bg-cream"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
