import ru from "./dictionaries/ru.json";
import en from "./dictionaries/en.json";
import { env } from "@/lib/env";

export const dictionaries = { ru, en } as const;
export type Locale = keyof typeof dictionaries;
export type Dictionary = typeof ru;

export const DEFAULT_LOCALE = (env.defaultLocale as Locale) in dictionaries
  ? (env.defaultLocale as Locale)
  : "ru";

export function getDictionary(locale: string): Dictionary {
  return (dictionaries as Record<string, Dictionary>)[locale] ?? dictionaries.ru;
}

// Convenience default — the active dictionary for the MVP's single wired
// locale. Components can `import { t } from "@/lib/i18n"` directly; once a
// `/en` route segment is added, switch this to a per-request lookup instead.
export const t = getDictionary(DEFAULT_LOCALE);

/**
 * `ru` (unprefixed, e.g. /cars) is the default per spec §7; `/en/...` mirrors
 * the customer-facing journey (home, catalog, listing detail, china hub +
 * calculator + static pages, budget, companies) with getDictionary("en").
 * Seller/admin/auth stay ru-only — those are operated by KG-based staff, not
 * the audience this covers. Adding a third locale (`/kz`, `/uz`) later is a
 * new dictionary file + new mirror route folder, no component rewrites,
 * since UI strings already live in dictionaries/*.json.
 */
