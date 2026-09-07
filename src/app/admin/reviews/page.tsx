import type { Metadata } from "next";
import Link from "next/link";
import { getAllReviews } from "@/lib/data/reviews";
import { formatDate } from "@/lib/format";
import { DeleteReviewButton } from "./DeleteReviewButton";

export const metadata: Metadata = { title: "Отзывы" };

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-neutral-900">Отзывы о компаниях</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Модерация: удаление спама/накрутки. Рейтинг компании пересчитывается автоматически по
        оставшимся отзывам.
      </p>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          Пока нет отзывов.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {reviews.map((review) => (
            <div key={review.id} className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-neutral-900">{review.author}</span>
                  <span className="text-warning">{"★".repeat(review.rating)}</span>
                  {review.dealers && (
                    <Link href={`/companies/${review.dealers.slug}`} className="text-brand-600 hover:underline">
                      {review.dealers.name}
                    </Link>
                  )}
                  <span className="text-neutral-400">{formatDate(review.created_at)}</span>
                </div>
                {review.text && <p className="mt-1 text-sm text-neutral-600">{review.text}</p>}
              </div>
              <DeleteReviewButton id={review.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
