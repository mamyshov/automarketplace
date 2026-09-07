import Link from "next/link";
import { getDealerReviews } from "@/lib/data/reviews";
import { getCurrentUser } from "@/lib/data/profile";
import { formatDate } from "@/lib/format";
import { ReviewForm } from "./ReviewForm";
import { getDictionary, type Locale } from "@/lib/i18n";

export async function ReviewsSection({
  dealerId,
  dealerSlug,
  locale,
}: {
  dealerId: string;
  dealerSlug: string;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  // Auth pages stay Russian-only by design (see README i18n scope note) —
  // the login link below always points to the unprefixed /login regardless
  // of this page's locale.
  const [reviews, currentUser] = await Promise.all([getDealerReviews(dealerId), getCurrentUser()]);

  return (
    <div className="mt-10">
      <h2 className="mb-4 text-xl font-bold text-neutral-900">
        {dict.reviews.title} {reviews.length > 0 && `(${reviews.length})`}
      </h2>

      {reviews.length === 0 ? (
        <p className="mb-6 text-sm text-neutral-500">{dict.reviews.empty}</p>
      ) : (
        <div className="mb-6 flex flex-col gap-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900">{review.author}</span>
                <span className="text-sm text-neutral-400">{formatDate(review.created_at)}</span>
              </div>
              <div className="mt-1 text-warning" aria-label={`${review.rating}/5`}>
                {"★".repeat(review.rating)}
                <span className="text-neutral-300">{"★".repeat(5 - review.rating)}</span>
              </div>
              {review.text && <p className="mt-2 text-sm text-neutral-700">{review.text}</p>}
            </div>
          ))}
        </div>
      )}

      <h3 className="mb-2 text-sm font-semibold text-neutral-700">{dict.reviews.leaveReview}</h3>
      {currentUser ? (
        <ReviewForm
          dealerId={dealerId}
          dealerSlug={dealerSlug}
          defaultName={currentUser.profile.name ?? ""}
          locale={locale}
        />
      ) : (
        <p className="text-sm text-neutral-500">
          {dict.reviews.loginRequired} —{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            {dict.reviews.loginCta}
          </Link>
        </p>
      )}
    </div>
  );
}
