"use client";

// Favorites aren't in the spec's data model (§6 has no `favorites` table),
// so this is a lightweight per-device localStorage list rather than a
// server-persisted feature — enough to make the "Избранное" nav item work.
// A real per-account favorites table is a natural Stage 2 addition.

const KEY = "cb_favorites";

export function getFavoriteIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function isFavorite(id: string): boolean {
  return getFavoriteIds().includes(id);
}

export function toggleFavorite(id: string): string[] {
  const current = getFavoriteIds();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Ignore storage errors (private mode, quota) — favorites are best-effort.
  }
  return next;
}
