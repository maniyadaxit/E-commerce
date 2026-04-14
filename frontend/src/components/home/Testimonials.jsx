import { Link } from "react-router-dom";
import { testimonials } from "../../data/marketing";

export function Testimonials() {
  return (
    <section className="mt-20 bg-[#efe4d8] py-20">
      <div className="section-shell">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
            Real Reviews
          </p>
          <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">
            Words from our customers.
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="relative rounded-[2rem] border border-[#decfbf] bg-white px-6 pb-6 pt-10 shadow-soft transition hover:-translate-y-1 hover:shadow-[0_20px_54px_rgba(27,27,27,0.08)]"
            >
              <div className="absolute right-6 top-5 font-display text-7xl leading-none text-[#eadbca]">
                "
              </div>
              <p className="text-sm tracking-[0.25em] text-accent">★★★★★</p>
              <div className="mt-4 flex items-center gap-4">
                <img
                  src={testimonial.photo}
                  alt={testimonial.name}
                  className="h-14 w-14 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="font-semibold text-ink">{testimonial.name}</p>
                  <Link className="text-sm text-accent" to={testimonial.productHref}>
                    Linked product
                  </Link>
                </div>
              </div>
              <p className="mt-5 text-base leading-8 text-copy/82">{testimonial.quote}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
