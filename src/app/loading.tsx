// Next.js renders this as the Suspense fallback for {children} in the root
// layout while a dynamic route's data is loading — Header/Footer/BottomNav
// stay mounted and interactive, only the content area shows this. Instant
// on already-cached (static) pages, so it's only ever visible on the
// dynamic ones (search results, a listing, the dashboard) where it matters.
//
// A thin top bar alone read as a blank/broken page on routes that wait
// longest (e.g. /cars, before it got its own skeleton loading.tsx) — this
// generic fallback also centers a spinner in the content area so a still
// page reads as "loading", not "empty". Any route worth a closer skeleton
// (shaped like its real layout) should add its own loading.tsx next to
// page.tsx, which Next.js prefers over this one.
export default function Loading() {
  return (
    <>
      <div className="fixed inset-x-0 top-16 z-40 h-0.5 overflow-hidden bg-transparent" aria-hidden>
        <div
          className="absolute h-full w-1/3 rounded-full bg-brand-600"
          style={{ animation: "loading-bar-sweep 1s ease-in-out infinite" }}
        />
      </div>
      <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="Загрузка">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-neutral-200 border-t-brand-600" />
      </div>
    </>
  );
}
