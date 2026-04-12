import { Link } from "react-router-dom";
import { testimonials } from "../../data/marketing";

export function Testimonials() {
  return (
    <section className="section-shell mt-16">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
          Testimonials
        </p>
        <h2 className="font-display text-4xl text-ink md:text-5xl">
          Real buyers, real feedback.
        </h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <article key={testimonial.name} className="card-surface rounded-[2rem] p-6">
            <div className="flex items-center gap-4">
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
            <p className="mt-5 text-sm leading-7 text-copy/80">{testimonial.quote}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
