import { getActiveBanner } from "@/lib/data/banners";
import type { BannerPlacement } from "@/types/database";

// Renders nothing when there's no active banner for this slot — callers
// don't need to know whether one exists, no layout gap either way.
export async function AdBanner({ placement, className = "" }: { placement: BannerPlacement; className?: string }) {
  const banner = await getActiveBanner(placement);
  if (!banner || !banner.image_url) return null;

  return (
    <a
      href={banner.link_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`block overflow-hidden rounded-xl border border-neutral-200 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- advertiser-supplied image, arbitrary aspect ratio */}
      <img src={banner.image_url} alt={banner.title} className="w-full object-cover" />
    </a>
  );
}
