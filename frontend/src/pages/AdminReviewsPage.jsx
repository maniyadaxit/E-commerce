import { useEffect, useState } from "react";
import { getAdminReviews, moderateReview } from "../api/adminApi";
import { Button } from "../components/ui/Button";

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);

  const refresh = async () => setReviews(await getAdminReviews());

  useEffect(() => {
    refresh().catch(() => setReviews([]));
  }, []);

  return (
    <section className="section-shell py-10">
      <h1 className="font-display text-5xl text-ink">Review Moderation</h1>
      <div className="mt-8 space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-[2rem] bg-white p-6 shadow-soft">
            <p className="font-semibold text-ink">{review.userName}</p>
            <p className="mt-2 text-sm text-copy/75">{review.body}</p>
            <div className="mt-4 flex gap-3">
              <Button onClick={() => moderateReview(review.id, { approved: true }).then(refresh)}>
                Approve
              </Button>
              <Button
                variant="secondary"
                onClick={() => moderateReview(review.id, { approved: false }).then(refresh)}
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
