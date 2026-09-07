// Single place that reads process.env — nothing else in the app should
// reference process.env.NEXT_PUBLIC_* / SUPABASE_* directly. Moving to
// self-hosted Supabase on borneo.kg (spec §2, Phase 2) is then just editing
// the deployed .env, no code changes.

function required(name: string, value: string | undefined): string {
  if (!value) {
    // Don't throw at import time in the browser bundle for optional server-only
    // vars; callers that truly need the value will fail loudly when they use it.
    return "";
  }
  return value;
}

export const env = {
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",

  siteName: process.env.NEXT_PUBLIC_SITE_NAME || "CarBridge",
  siteDescription:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Автомобили из Китая и в наличии в Бишкеке",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "ru",
  supportedLocales: (process.env.NEXT_PUBLIC_SUPPORTED_LOCALES || "ru,en")
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean),

  defaultUsdKgsRate: Number(process.env.NEXT_PUBLIC_DEFAULT_USD_KGS_RATE || "89.5"),

  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID ?? "",
};
