// Currency is always shown in both USD and KGS (spec §7) — the rate itself
// comes from app_settings.usd_kgs_rate (admin-editable), never hardcoded.

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatKgs(amount: number): string {
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(amount)} сом`;
}

export function formatDualPrice(usdAmount: number, usdToKgsRate: number): string {
  const kgs = Math.round(usdAmount * usdToKgsRate);
  return `${formatUsd(usdAmount)} · ${formatKgs(kgs)}`;
}

export function formatMileage(km: number | null): string {
  if (km === null) return "—";
  return `${new Intl.NumberFormat("ru-RU").format(km)} км`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso)
  );
}
