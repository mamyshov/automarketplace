// Route-scoped loading.tsx — Next.js prefers this over the root
// src/app/loading.tsx for /cars specifically. That generic one is just a
// thin top progress bar with an otherwise blank content area, which on a
// page that's inherently uncacheable (filters live in the URL, so this is
// the one route that always waits on Supabase) read as the page having
// broken rather than being mid-load. A skeleton shaped like the real
// catalog — sidebar + card grid — makes it obvious something is coming.
export default function CarsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6" aria-busy="true" aria-label="Загрузка каталога">
      <div className="mb-4 h-8 w-40 animate-pulse rounded bg-neutral-200" />

      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-neutral-100" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        <aside className="hidden md:block">
          <div className="h-96 animate-pulse rounded-xl bg-neutral-100" />
        </aside>

        <div>
          <div className="mb-3 h-4 w-32 animate-pulse rounded bg-neutral-100" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                <div className="aspect-[4/3] w-full animate-pulse bg-neutral-100" />
                <div className="flex flex-col gap-2 p-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
                  <div className="h-5 w-2/3 animate-pulse rounded bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
