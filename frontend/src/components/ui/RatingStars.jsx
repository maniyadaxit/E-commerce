import { Star } from "lucide-react";

export function RatingStars({ value = 0, reviews }) {
  const stars = Array.from({ length: 5 }, (_, index) => index + 1);
  return (
    <div className="flex items-center gap-2 text-sm text-copy">
      <div className="flex items-center gap-1">
        {stars.map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= Math.round(value) ? "fill-accent text-accent" : "text-ink/15"}
          />
        ))}
      </div>
      <span>{Number(value || 0).toFixed(1)} ★</span>
      {reviews ? <span className="text-copy/70">| {reviews} reviews</span> : null}
    </div>
  );
}
