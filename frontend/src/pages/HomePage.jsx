import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { getProducts } from "../api/catalogApi";
import { BondGrid } from "../components/home/BondGrid";
import { BestsellersCarousel } from "../components/home/BestsellersCarousel";
import { CategoryStrip } from "../components/home/CategoryStrip";
import { CollectionScroller } from "../components/home/CollectionScroller";
import { HeroCarousel } from "../components/home/HeroCarousel";
import { Testimonials } from "../components/home/Testimonials";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { colourCards, priceBuckets, promisePoints, recipients } from "../data/marketing";
import { mockProducts } from "../data/mockCatalog";

const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export function HomePage() {
  const [bestsellers, setBestsellers] = useState(mockProducts);
  const [latest, setLatest] = useState(mockProducts);
  const [loading, setLoading] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);

  const newsletterForm = useForm({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    async function load() {
      try {
        const [bestData, latestData] = await Promise.all([
          getProducts({ size: 8, sort: "bestseller" }),
          getProducts({ size: 6, sort: "newest" }),
        ]);
        setBestsellers(bestData.items?.length ? bestData.items : mockProducts);
        setLatest(latestData.items?.length ? latestData.items : mockProducts);
      } catch {
        setBestsellers(mockProducts);
        setLatest(mockProducts);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <>
      <HeroCarousel />
      <CategoryStrip />

      <section className="section-shell mt-10">
        <div className="grid gap-4 rounded-[2rem] bg-ink px-6 py-5 text-white shadow-soft md:grid-cols-2 xl:grid-cols-4">
          {promisePoints.map((point) => (
            <div key={point} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-center">
              <p className="text-xs uppercase tracking-[0.28em] text-accent">Aurora Promise</p>
              <p className="mt-2 font-display text-3xl">{point}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell mt-16 grid gap-4 lg:grid-cols-2">
        {recipients.map((recipient, index) => (
          <Link
            key={recipient.label}
            to={recipient.href}
            className="overflow-hidden rounded-[2rem] p-8 text-white shadow-soft"
            style={{
              background:
                index === 0
                  ? "linear-gradient(135deg, rgba(27,27,27,.85), rgba(27,27,27,.35)), url(https://placehold.co/1200x800/png?text=Gift+for+Him)"
                  : "linear-gradient(135deg, rgba(200,169,110,.85), rgba(27,27,27,.25)), url(https://placehold.co/1200x800/png?text=Gift+for+Her)",
            }}
          >
            <p className="text-xs uppercase tracking-[0.24em]">Shop by Recipient</p>
            <h2 className="mt-4 font-display text-5xl">{recipient.label}</h2>
          </Link>
        ))}
      </section>

      <section className="section-shell mt-16">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
            Luxury Within Reach
          </p>
          <h2 className="font-display text-4xl text-ink md:text-5xl">Pick a budget, then buy better.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {priceBuckets.map((bucket, index) => (
            <Link
              key={bucket.label}
              to={`/search?maxPrice=${bucket.max}`}
              className="rounded-[2rem] bg-white p-8 shadow-soft"
              style={{
                background:
                  index === 1
                    ? "linear-gradient(135deg, rgba(200,169,110,0.22), white)"
                    : "linear-gradient(135deg, rgba(27,27,27,0.05), white)",
              }}
            >
              <p className="font-display text-4xl text-ink">{bucket.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {loading ? (
        <section className="section-shell mt-16 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-72" />
          ))}
        </section>
      ) : (
        <CollectionScroller title="Latest Collections" products={latest} />
      )}

      <section className="section-shell mt-16">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
            Shop by Colour
          </p>
          <h2 className="font-display text-4xl text-ink md:text-5xl">Finish first, outfit second.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {colourCards.map((card) => (
            <Link
              key={card.label}
              to={`/search?${card.query}`}
              className="rounded-[2rem] bg-white p-6 shadow-soft"
            >
              <p className="font-display text-3xl text-ink">{card.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <BondGrid />
      <BestsellersCarousel products={bestsellers} />
      <Testimonials />

      <section className="section-shell mt-16">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-[2rem] bg-white px-6 py-5 shadow-soft"
          onClick={() => setAboutOpen((open) => !open)}
        >
          <span className="font-display text-4xl text-ink">About Aurora Gems</span>
          <ChevronDown className={`transition ${aboutOpen ? "rotate-180" : ""}`} />
        </button>
        {aboutOpen ? (
          <div className="mt-4 rounded-[2rem] bg-white p-6 text-sm leading-7 text-copy/80 shadow-soft">
            Aurora Gems is a modern jewelry storefront built around expressive gifting,
            premium finishes, and warm editorial storytelling for everyday luxury.
          </div>
        ) : null}
      </section>

      <section className="section-shell mt-16">
        <div className="rounded-[2rem] bg-ink px-6 py-8 text-white shadow-soft md:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            Newsletter
          </p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            Weekly launches, styling edits, and early offers.
          </h2>
          <form
            className="mt-6 grid gap-3 md:grid-cols-[1fr,auto]"
            onSubmit={newsletterForm.handleSubmit(() => newsletterForm.reset())}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-white placeholder:text-white/50"
              {...newsletterForm.register("email")}
            />
            <Button type="submit" variant="accent">
              Subscribe
            </Button>
          </form>
          {newsletterForm.formState.errors.email ? (
            <p className="mt-2 text-sm text-red-300">
              {newsletterForm.formState.errors.email.message}
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
