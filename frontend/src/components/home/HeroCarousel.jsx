import { AnimatePresence, motion } from "framer-motion";
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

  return (
    <section className="section-shell pt-8">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-ink text-white shadow-soft">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.title}
            initial={{ opacity: 0.25, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.25 }}
            transition={{ duration: 0.7 }}
            className="grid min-h-[560px] items-end bg-cover bg-center p-8 md:p-12"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(27,27,27,.72), rgba(27,27,27,.2)), url(${activeSlide.image})`,
            }}
          >
            <div className="max-w-xl space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">
                Premium Jewelry Edit
              </p>
              <h1 className="font-display text-5xl leading-none md:text-7xl">
                {activeSlide.title}
              </h1>
              <p className="max-w-lg text-base text-white/80 md:text-lg">
                {activeSlide.subtitle}
              </p>
              <Button as={Link} to={activeSlide.href} variant="accent">
                {activeSlide.cta}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
