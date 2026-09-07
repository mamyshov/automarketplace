import { STATUS_BADGE_CLASSES, STATUS_LABELS } from "@/lib/constants";
import type { ListingStatus } from "@/types/database";

export function StatusBadge({ status, className = "" }: { status: ListingStatus; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASSES[status]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  );
}
