import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";

export function DashboardPage() {
  const { user } = useAuth();
  const { count } = useWishlist();

  return (
    <section className="section-shell py-10">
      <div className="rounded-[2.5rem] bg-white p-8 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/50">
          My Account
        </p>
        <h1 className="mt-3 font-display text-5xl text-ink">Hello, {user?.name}.</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link to="/account/orders" className="rounded-[1.75rem] bg-cream p-6">
            <p className="text-sm text-copy/60">Orders</p>
            <p className="mt-2 font-display text-4xl text-ink">Track</p>
          </Link>
          <Link to="/account/wishlist" className="rounded-[1.75rem] bg-cream p-6">
            <p className="text-sm text-copy/60">Wishlist</p>
            <p className="mt-2 font-display text-4xl text-ink">{count}</p>
          </Link>
          <Link to="/account/profile" className="rounded-[1.75rem] bg-cream p-6">
            <p className="text-sm text-copy/60">Profile</p>
            <p className="mt-2 font-display text-4xl text-ink">Edit</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
