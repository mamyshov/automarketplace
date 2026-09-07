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
 * Only `ru` is wired into routing for the MVP (spec §7: "на старте активен
 * только один язык"). The dictionary/translation mechanism itself is fully
 * general — adding `/en` (and later `/kz`, `/uz`) is then just adding a
 * locale segment to the router, not rewriting components, since UI strings
 * already live in dictionaries/*.json rather than hardcoded in JSX.
 */
