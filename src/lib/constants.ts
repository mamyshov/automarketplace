import { env } from "@/lib/env";
import type { ListingStatus, Market, LeadSource } from "@/types/database";

export const SITE_NAME = env.siteName;
export const SITE_DESCRIPTION = env.siteDescription;

export const MARKET_LABELS: Record<Market, string> = {
  bishkek: "В наличии в Бишкеке",
  china: "Из Китая под заказ",
};

export const STATUS_LABELS: Record<ListingStatus, string> = {
  available: "В наличии",
  in_transit: "В пути",
  in_china: "В Китае",
  on_order: "Под заказ",
  sold: "Продано",
};

// Tailwind classes keyed off design-tokens.json `status.*` colors.
export const STATUS_BADGE_CLASSES: Record<ListingStatus, string> = {
  available: "bg-status-available/10 text-status-available border-status-available/30",
  in_transit: "bg-status-inTransit/10 text-status-inTransit border-status-inTransit/30",
  in_china: "bg-status-inChina/10 text-status-inChina border-status-inChina/30",
  on_order: "bg-status-onOrder/10 text-status-onOrder border-status-onOrder/30",
  sold: "bg-status-sold/10 text-status-sold border-status-sold/30",
};

export const BODY_TYPES = [
  { value: "sedan", label: "Седан" },
  { value: "suv", label: "Внедорожник" },
  { value: "crossover", label: "Кроссовер" },
  { value: "hatchback", label: "Хэтчбек" },
  { value: "minivan", label: "Минивэн" },
  { value: "pickup", label: "Пикап" },
  { value: "electric", label: "Электромобиль" },
  { value: "hybrid", label: "Гибрид" },
];

export const TRANSMISSIONS = [
  { value: "automatic", label: "Автомат" },
  { value: "manual", label: "Механика" },
  { value: "cvt", label: "Вариатор" },
  { value: "robot", label: "Робот" },
];

export const FUEL_TYPES = [
  { value: "petrol", label: "Бензин" },
  { value: "diesel", label: "Дизель" },
  { value: "hybrid", label: "Гибрид" },
  { value: "electric", label: "Электро" },
  { value: "gas", label: "Газ" },
];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  calculator: "Калькулятор",
  budget: "Подбор по бюджету",
  listing: "Объявление",
};

export const FREE_LISTING_LIMIT = 5;
export const MAX_PHOTOS_PER_LISTING = 20;

export const BOTTOM_NAV_ITEMS = [
  { href: "/", label: "Главная", icon: "home" },
  { href: "/cars", label: "Каталог", icon: "car" },
  { href: "/china/calculator", label: "Китай", icon: "calculator" },
  { href: "/favorites", label: "Избранное", icon: "heart" },
  { href: "/dashboard", label: "Кабинет", icon: "user" },
] as const;
