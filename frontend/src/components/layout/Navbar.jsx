import { Heart, LogIn, MapPin, Menu, Search, ShoppingBag, User, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useStoreCollections } from "../../hooks/useStoreCollections";
import { useWishlist } from "../../hooks/useWishlist";

export function Navbar() {
  const { user } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const collections = useStoreCollections();
  const [mobileOpen, setMobileOpen] = useState(false);
  const featuredCollections = collections.slice(0, 3);
  const accountLinks = user
    ? [
        { label: "Profile", href: "/account/profile" },
        { label: "Orders", href: "/account/orders" },
        { label: "Wishlist", href: "/account/wishlist" },
      ]
    : [
        { label: "Login", href: "/account/login" },
        { label: "Sign Up", href: "/account/register" },
      ];

  const navLinks = [
    { label: "New In", href: "/search?sort=newest" },
    ...(
      featuredCollections.length
        ? featuredCollections.map((collection) => ({
            label: collection.name,
            href: `/collections/${collection.handle}`,
          }))
        : [
            { label: "Rings", href: "/collections/rings" },
            { label: "Pendants", href: "/collections/pendants" },
            { label: "Earrings", href: "/collections/earrings" },
          ]
    ),
    { label: "Gift Store", href: "/pages/gift-store" },
  ];

  function Logo() {
    return (
      <Link to="/" className="shrink-0">
        <div className="font-display text-[1.6rem] leading-none tracking-[0.2em] text-ink 2xl:text-[2rem] 2xl:tracking-[0.24em]">
          AURORA GEMS
        </div>
        <div className="mt-1 hidden text-[9px] uppercase tracking-[0.34em] text-copy/45 2xl:block">
          Wear What You Feel
        </div>
      </Link>
    );
  }

  function IconButton({ to, label, children, badge, className = "" }) {
    return (
      <NavLink
        to={to}
        aria-label={label}
        className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e4d8ca] bg-white/85 text-copy transition hover:border-accent/50 hover:text-accent ${className}`}
      >
        {children}
        {badge ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
            {badge}
          </span>
        ) : null}
      </NavLink>
    );
  }

  return (
    <header className="sticky top-[43px] z-30 border-b border-[#e6dacb] bg-cream/90 backdrop-blur-xl">
      <div className="section-shell py-3">
        <div className="flex items-center justify-between gap-3 xl:hidden">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e4d8ca] bg-white/85 text-copy"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <Logo />
          <div className="flex items-center gap-2">
            <IconButton to="/search" label="Search">
              <Search size={16} />
            </IconButton>
            <IconButton to="/account/wishlist" label="Wishlist" badge={wishlistCount}>
              <Heart size={16} />
            </IconButton>
            <IconButton to="/cart" label="Cart" badge={cartCount}>
              <ShoppingBag size={16} />
            </IconButton>
          </div>
        </div>

        <div className="hidden xl:grid xl:grid-cols-[auto,1fr,auto] xl:items-center xl:gap-6 2xl:gap-10">
          <Logo />

          <nav className="flex items-center justify-center gap-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-copy/85 2xl:gap-7 2xl:text-[11px] 2xl:tracking-[0.24em]">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              className="max-w-[130px] truncate border-b border-transparent pb-1 transition hover:border-accent/60 hover:text-accent 2xl:max-w-[160px]"
            >
              {link.label}
            </NavLink>
          ))}
          </nav>

          <div className="flex items-center justify-end gap-3 text-sm">
            {user ? (
              <>
                <NavLink
                  to="/account/orders"
                  className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-copy/75 transition hover:text-accent 2xl:inline-flex"
                >
                  Orders
                </NavLink>
                <NavLink
                  to="/account/profile"
                  className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-copy/75 transition hover:text-accent 2xl:inline-flex"
                >
                  Profile
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/account/login"
                  className="hidden items-center gap-2 rounded-full border border-[#e4d8ca] bg-white/85 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-copy/75 transition hover:border-accent/50 hover:text-accent 2xl:inline-flex"
                >
                  <LogIn size={14} />
                  Login
                </NavLink>
                <NavLink
                  to="/account/register"
                  className="hidden items-center gap-2 rounded-full bg-ink px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-ink/85 2xl:inline-flex"
                >
                  <UserPlus size={14} />
                  Sign Up
                </NavLink>
              </>
            )}
            <IconButton to="/search" label="Search">
              <Search size={16} />
            </IconButton>
            <NavLink
              to="/search"
              className="hidden items-center gap-3 rounded-full border border-[#e4d8ca] bg-white/85 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-copy/70 transition hover:border-accent/50 hover:text-accent 2xl:inline-flex"
            >
              <Search size={15} />
              <span>Search jewelry</span>
            </NavLink>
            <IconButton to="/pages/store-locator" label="Store locator" className="hidden 2xl:inline-flex">
              <MapPin size={16} />
            </IconButton>
            <IconButton
              to={user ? "/account/dashboard" : "/account/login"}
              label="Account"
            >
              <User size={16} />
            </IconButton>
            <IconButton to="/account/wishlist" label="Wishlist" badge={wishlistCount}>
              <Heart size={16} />
            </IconButton>
            <IconButton to="/cart" label="Cart" badge={cartCount}>
              <ShoppingBag size={16} />
            </IconButton>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[#e6dacb] bg-white/95 px-4 py-4 xl:hidden">
          <NavLink
            to="/search"
            className="mb-4 flex items-center gap-3 rounded-[1.4rem] border border-[#e4d8ca] bg-cream/70 px-4 py-3 text-sm text-copy/75"
            onClick={() => setMobileOpen(false)}
          >
            <Search size={16} />
            <span>Search jewelry</span>
          </NavLink>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <NavLink
              to="/cart"
              className="inline-flex items-center justify-center gap-2 rounded-[1.2rem] border border-[#e4d8ca] bg-white px-3 py-3 text-sm font-medium text-copy/80"
              onClick={() => setMobileOpen(false)}
            >
              <ShoppingBag size={16} />
              Cart
            </NavLink>
            <NavLink
              to="/account/wishlist"
              className="inline-flex items-center justify-center gap-2 rounded-[1.2rem] border border-[#e4d8ca] bg-white px-3 py-3 text-sm font-medium text-copy/80"
              onClick={() => setMobileOpen(false)}
            >
              <Heart size={16} />
              Wishlist
            </NavLink>
          </div>
          <div className="space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.href}
                className="block rounded-[1.4rem] border border-transparent px-4 py-3 text-sm font-medium uppercase tracking-[0.18em] text-copy/85 transition hover:border-[#e4d8ca] hover:bg-cream/80 hover:text-accent"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            {accountLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className="block rounded-[1.4rem] border border-transparent px-4 py-3 text-sm font-medium uppercase tracking-[0.18em] text-copy/85 transition hover:border-[#e4d8ca] hover:bg-cream/80 hover:text-accent"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/account/dashboard"
              className="block rounded-[1.4rem] border border-transparent px-4 py-3 text-sm font-medium uppercase tracking-[0.18em] text-copy/85 transition hover:border-[#e4d8ca] hover:bg-cream/80 hover:text-accent"
              onClick={() => setMobileOpen(false)}
            >
              Account Home
            </NavLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}
