import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <section className="section-shell py-20">
      <div className="mx-auto max-w-2xl rounded-[2.5rem] bg-white p-10 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/50">
          404
        </p>
        <h1 className="mt-4 font-display text-6xl text-ink">Page not found.</h1>
        <p className="mt-4 text-sm text-copy/70">
          The page you requested isn&apos;t available in this storefront.
        </p>
        <Button as={Link} to="/" className="mt-8">
          Back to Home
        </Button>
      </div>
    </section>
  );
}
