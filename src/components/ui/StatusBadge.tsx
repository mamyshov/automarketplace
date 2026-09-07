import { STATUS_BADGE_CLASSES } from "@/lib/constants";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { ListingStatus } from "@/types/database";

export function StatusBadge({
  status,
  className = "",
  locale = "ru",
}: {
  status: ListingStatus;
  className?: string;
  locale?: Locale;
}) {
  const dict = getDictionary(locale);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASSES[status]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {dict.status[status]}
    </span>
  );
}
