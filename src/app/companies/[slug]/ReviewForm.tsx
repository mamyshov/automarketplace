"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createReview } from "@/lib/actions/reviews";
import { getDictionary, type Locale } from "@/lib/i18n";

const inputCls =
  "min-h-touch w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export function ReviewForm({
  dealerId,
  dealerSlug,
  defaultName,
  locale = "ru",
}: {
  dealerId: string;
  dealerSlug: string;
  defaultName: string;
  locale?: Locale;
}) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [author, setAuthor] = useState(defaultName);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setError(null);

    const result = await createReview(dealerId, dealerSlug, author, rating, text);
    if (result.ok) {
      setState("success");
      setText("");
      router.refresh();
    } else {
      setState("error");
      setError(result.error ?? "Error");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-sm text-success">
        {dict.reviews.success}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">{dict.reviews.name}</label>
        <input required value={author} onChange={(e) => setAuthor(e.target.value)} className={inputCls} />
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium text-neutral-700">{dict.reviews.rating}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n}`}
              className={`min-h-touch min-w-touch text-2xl leading-none ${n <= rating ? "text-warning" : "text-neutral-300"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">{dict.reviews.text}</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className={inputCls} />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="min-h-touch w-fit rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {state === "submitting" ? dict.reviews.sending : dict.reviews.submit}
      </button>
    </form>
  );
}
