import { formatDisplayDate } from "../../utils/dateHelpers";
import { RatingStars } from "../ui/RatingStars";

export function ReviewCard({ review }) {
  return (
    <article className="rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-ink">{review.userName}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-ink/40">
            {formatDisplayDate(review.createdAt)}
          </p>
        </div>
        <RatingStars value={review.rating} />
      </div>
      {review.title ? (
        <h4 className="mt-4 font-display text-2xl text-ink">{review.title}</h4>
      ) : null}
      <p className="mt-3 text-sm leading-7 text-copy/80">{review.body}</p>
      {review.imageUrl ? (
        <img
          src={review.imageUrl}
          alt={review.title || "Review upload"}
          className="mt-4 aspect-[4/3] w-full rounded-[1.5rem] object-cover"
          loading="lazy"
        />
      ) : null}
    </article>
  );
}
