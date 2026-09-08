// Next.js renders this as the Suspense fallback for {children} in the root
// layout while a dynamic route's data is loading — Header/Footer/BottomNav
// stay mounted and interactive, only the content area shows this. Instant
// on already-cached (static) pages, so it's only ever visible on the
// dynamic ones (search results, a listing, the dashboard) where it matters.
export default function Loading() {
  return (
    <div className="fixed inset-x-0 top-16 z-40 h-0.5 overflow-hidden bg-transparent" aria-hidden>
      <div
        className="absolute h-full w-1/3 rounded-full bg-brand-600"
        style={{ animation: "loading-bar-sweep 1s ease-in-out infinite" }}
      />
    </div>
  );
}
