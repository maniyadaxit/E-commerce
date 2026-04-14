import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { getProducts } from "../api/catalogApi";
import { BestsellersCarousel } from "../components/home/BestsellersCarousel";
import { CategoryStrip } from "../components/home/CategoryStrip";
import { CollectionScroller } from "../components/home/CollectionScroller";
import { HeroCarousel } from "../components/home/HeroCarousel";
import { Testimonials } from "../components/home/Testimonials";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { colourCards, priceBuckets, promisePoints } from "../data/marketing";
import { useStoreCollections } from "../hooks/useStoreCollections";

const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

function isWithinLastSevenDays(createdAt) {
  if (!createdAt) {
    return false;
  }

  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) {
    return false;
  }

  return createdTime >= Date.now() - 7 * 24 * 60 * 60 * 1000;
}

export function HomePage() {
  const [bestsellers, setBestsellers] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const collections = useStoreCollections(3);

  const newsletterForm = useForm({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [bestData, latestData] = await Promise.all([
          getProducts({ size: 8, sort: "bestseller" }),
          getProducts({ size: 12, sort: "newest" }),
        ]);
        if (!active) {
          return;
        }

        setBestsellers(bestData.items || []);
        setLatest(
          (latestData.items || []).filter((product) => isWithinLastSevenDays(product.createdAt))
        );
      } catch {
        if (active) {
          setBestsellers([]);
          setLatest([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        load();
      }
    }

    load();

    const intervalId = window.setInterval(load, 30000);
    window.addEventListener("focus", load);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", load);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <>
      <HeroCarousel />
      <CategoryStrip />

      <section className="section-shell mt-16">
        <div className="grid gap-4 rounded-[2.3rem] bg-[#17120f] px-6 py-6 text-white shadow-soft md:grid-cols-2 xl:grid-cols-4">
          {promisePoints.map((point) => (
            <div
              key={point}
              className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] px-5 py-5 text-center"
            >
              <p className="text-[11px] uppercase tracking-[0.28em] text-accent/85">
                Aurora Promise
              </p>
              <p className="mt-3 font-display text-3xl">{point}</p>
            </div>
          ))}
        </div>
      </section>

      {loading ? (
        <section className="section-shell mt-20 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-72" />
          ))}
        </section>
      ) : (
        <BestsellersCarousel products={bestsellers} />
      )}

      <section className="section-shell mt-20">
        <div className="grid gap-5 lg:grid-cols-[1.04fr,0.96fr]">
          <Link
            to={collections[0] ? `/collections/${collections[0].handle}` : "/search?sort=newest"}
            className="group relative overflow-hidden rounded-[2.4rem] bg-[#17120f] px-8 py-10 text-white shadow-soft"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,169,110,0.22),transparent_28%)]" />
            <div className="relative">
              <p className="text-[11px] uppercase tracking-[0.28em] text-accent/85">
                Featured Collection
              </p>
              <h2 className="mt-4 max-w-sm font-display text-5xl leading-tight">
                {collections[0]?.name || "Curated gift-worthy essentials"}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/65">
                {collections[0]?.description ||
                  "A premium edit inspired by the editorial structure of the Aurora reference layout."}
              </p>
              <div className="mt-8 inline-flex rounded-full border border-white/14 px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-white/72 transition group-hover:border-accent/60 group-hover:text-accent">
                Explore Collection
              </div>
            </div>
          </Link>

          <div className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              {colourCards.slice(0, 2).map((card, index) => (
                <Link
                  key={card.label}
                  to={`/search?${card.query}`}
                  className="rounded-[2rem] bg-white px-6 py-7 shadow-soft"
                  style={{
                    background:
                      index === 0
                        ? "linear-gradient(145deg, rgba(255,255,255,1), rgba(237,225,210,1))"
                        : "linear-gradient(145deg, rgba(245,240,234,1), rgba(255,255,255,1))",
                  }}
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-copy/45">Finish Edit</p>
                  <p className="mt-3 font-display text-4xl text-ink">{card.label}</p>
                  <p className="mt-3 text-sm text-copy/68">Build the look around tone and finish first.</p>
                </Link>
              ))}
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {priceBuckets.map((bucket) => (
                <Link
                  key={bucket.label}
                  to={`/search?maxPrice=${bucket.max}`}
                  className="rounded-[1.8rem] border border-[#e2d8ca] bg-white px-5 py-6 shadow-soft transition hover:-translate-y-1 hover:border-accent/45"
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-copy/45">Budget Edit</p>
                  <p className="mt-3 font-display text-3xl text-ink">{bucket.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {loading ? null : <CollectionScroller title="New In" products={latest} />}

      <section className="section-shell mt-20 overflow-hidden rounded-[2.4rem] bg-[#17120f] px-6 py-10 text-white shadow-soft md:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-accent/85">Lookbook Edit</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Style directions for every kind of gifting.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/62">
            Browse by finish, budget, and occasion without losing the premium editorial feel
            from the Aurora home reference.
          </p>
        </div>
        <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
          {[
            { label: "Stacking Rings", href: "/collections/rings" },
            { label: "Layered Pendants", href: "/collections/pendants" },
            { label: "Statement Earrings", href: "/collections/earrings" },
            { label: "Gift Store", href: "/pages/gift-store" },
            { label: "Rose Gold Edit", href: "/search?color=ROSE_GOLD" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="min-w-[220px] rounded-[1.8rem] border border-white/10 bg-white/[0.04] px-5 py-6 transition hover:border-accent/40 hover:bg-white/[0.08]"
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Curated View</p>
              <p className="mt-4 font-display text-3xl text-white">{item.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <Testimonials />

      <section className="section-shell mt-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#17120f] px-6 py-10 text-white shadow-soft md:px-10 md:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,169,110,0.12),transparent_30%)]" />
          <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 font-display text-[18rem] leading-none text-white/5 md:block">
            ◆
          </div>
          <div className="relative">
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
        </div>
      </section>
    </>
  );
}
