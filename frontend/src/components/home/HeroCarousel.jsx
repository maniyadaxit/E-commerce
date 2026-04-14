import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { heroSlides } from "../../data/marketing";
import { Button } from "../ui/Button";

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroSlides.length);
    }, 4500);
    return () => window.clearInterval(interval);
  }, []);

  const activeSlide = heroSlides[activeIndex];
  const previewSlides = Array.from({ length: 3 }, (_, offset) => {
    const index = (activeIndex + offset + 1) % heroSlides.length;
    return heroSlides[index];
  });

  return (
    <section className="section-shell pt-8">
      <div className="relative overflow-hidden rounded-[2.6rem] bg-[#17120f] text-white shadow-soft">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,169,110,0.24),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_24%)]" />
        <div className="relative grid min-h-[620px] gap-10 px-6 py-10 md:px-10 lg:grid-cols-[0.92fr,1.08fr] lg:px-14 lg:py-14">
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.34em] text-accent">
              <span className="h-px w-8 bg-accent/70" />
              <span>New Collection • Spring 2026</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.55 }}
                className="mt-8"
              >
                <h1 className="max-w-xl font-display text-5xl leading-[0.95] md:text-7xl">
                  {activeSlide.title}
                </h1>
                <p className="mt-5 max-w-md text-base leading-7 text-white/62 md:text-lg">
                  {activeSlide.subtitle}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button as={Link} to={activeSlide.href} variant="accent">
                    {activeSlide.cta}
                  </Button>
                  <Button as={Link} to="/search?sort=newest" variant="secondary">
                    Explore New In
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
              {[
                { value: "50K+", label: "Happy Customers" },
                { value: "1,200+", label: "Designs Curated" },
                { value: "4.9★", label: "Average Rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-4xl text-accent">{stat.value}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-white/35">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute right-4 top-2 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute bottom-4 left-4 h-44 w-44 rounded-full bg-white/5 blur-3xl" />
            <div className="grid w-full gap-4 xl:grid-cols-[1fr,240px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide.image}
                  initial={{ opacity: 0.3, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.3, scale: 0.98 }}
                  transition={{ duration: 0.65 }}
                  className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <div className="absolute right-4 top-4 rounded-full bg-accent px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white">
                    Signature Edit
                  </div>
                  <img
                    src={activeSlide.image}
                    alt={activeSlide.title}
                    className="h-[430px] w-full rounded-[1.7rem] object-cover"
                  />
                  <div className="absolute inset-x-8 bottom-8 rounded-[1.5rem] bg-black/40 p-5 backdrop-blur-md">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-accent/90">
                      Aurora Spotlight
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <div>
                        <h2 className="font-display text-3xl text-white">{activeSlide.title}</h2>
                        <p className="mt-2 text-sm text-white/65">
                          Premium gifting, sculpted silhouettes, and refined everyday sparkle.
                        </p>
                      </div>
                      <Link
                        to={activeSlide.href}
                        className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-accent hover:text-accent md:inline-flex"
                      >
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="grid gap-4">
                {previewSlides.map((slide) => (
                  <Link
                    key={slide.title}
                    to={slide.href}
                    className="group overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-4 transition hover:border-accent/40 hover:bg-white/[0.08]"
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="h-28 w-full rounded-[1.2rem] object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                    <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-accent/85">
                      Curated Drop
                    </p>
                    <h3 className="mt-2 font-display text-2xl text-white">{slide.title}</h3>
                    <p className="mt-2 text-sm text-white/55">Tap to explore the full edit.</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
