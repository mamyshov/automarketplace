"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * RU/EN toggle. The site's chrome (this header, footer, bottom nav) and the
 * seller/admin/auth areas stay Russian-only by design (spec §7: only one
 * locale needs to be wired at launch; those areas are operated by KG-based
 * staff, not the audience an /en mirror serves) — this switcher only jumps
 * between the ru/en mirrors of the customer-facing pages that have one.
 */
export function LocaleSwitcher() {
  const pathname = usePathname();
  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  const ruPath = isEn ? pathname.replace(/^\/en/, "") || "/" : pathname;
  const enPath = isEn ? pathname : `/en${pathname === "/" ? "" : pathname}`;

  return (
    <div className="flex items-center overflow-hidden rounded-full border border-neutral-300 text-xs font-semibold">
      <Link
        href={ruPath}
        className={`px-2 py-1 ${!isEn ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"}`}
      >
        RU
      </Link>
      <Link
        href={enPath}
        className={`px-2 py-1 ${isEn ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"}`}
      >
        EN
      </Link>
    </div>
  );
}
