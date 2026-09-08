// Hand-written types mirroring supabase/migrations/0001_init.sql.
// Kept in sync manually — regenerate with `supabase gen types typescript`
// once a real project is provisioned, and this file becomes redundant.

export type Role = "buyer" | "seller" | "dealer" | "admin";
export type Market = "bishkek" | "china";
export type ListingStatus = "available" | "in_transit" | "in_china" | "on_order" | "sold";
export type ModerationStatus = "pending" | "approved" | "rejected";
export type LeadSource = "calculator" | "budget" | "listing";
export type LeadStatus = "new" | "contacted" | "closed";
export type ContactChannel = "whatsapp" | "telegram" | "phone";
export type Plan = "free" | "pro" | "top" | "dealer";
export type SubscriptionStatus = "pending" | "active" | "expired" | "rejected";

export interface UserRow {
  id: string;
  role: Role;
  name: string | null;
  phone: string | null;
  whatsapp: string | null;
  telegram: string | null;
  created_at: string;
}

export interface DealerRow {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  region: string | null;
  verified: boolean;
  rating: number;
  phone: string | null;
  whatsapp: string | null;
  telegram: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandRow {
  id: string;
  name: string;
  slug: string;
}

export interface ModelRow {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
}

export interface ListingRow {
  id: string;
  dealer_id: string | null;
  user_id: string;
  market: Market;
  brand: string;
  model: string;
  year: number;
  mileage: number | null;
  body_type: string | null;
  transmission: string | null;
  fuel: string | null;
  engine_volume: number | null;
  color: string | null;
  vin: string | null;
  price_origin: number | null;
  price_final: number;
  status: ListingStatus;
  moderation_status: ModerationStatus;
  is_verified: boolean;
  verified_at: string | null;
  verified_note: string | null;
  verified_by_name: string | null;
  is_top: boolean;
  description: string | null;
  location: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface ListingPhotoRow {
  id: string;
  listing_id: string;
  url: string;
  position: number;
  is_verification: boolean;
  created_at: string;
}

export interface ListingVideoRow {
  id: string;
  listing_id: string;
  url: string;
  is_verification: boolean;
  created_at: string;
}

export interface CalculatorRateRow {
  id: string;
  body_type: string;
  engine_volume_from: number;
  engine_volume_to: number;
  year_from: number;
  year_to: number;
  logistics_fee: number;
  broker_fee: number;
  customs_duty: number;
  customs_formula: string | null;
  currency: string;
  is_active: boolean;
  updated_at: string;
}

export interface LeadRow {
  id: string;
  source: LeadSource;
  listing_id: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  budget: number | null;
  name: string;
  contact: string;
  contact_channel: ContactChannel;
  calculator_breakdown: CalculatorBreakdown | null;
  status: LeadStatus;
  notified_at: string | null;
  created_at: string;
}

export interface SubscriptionRow {
  id: string;
  user_id: string | null;
  dealer_id: string | null;
  /** Only meaningful for plan = 'top' — which listing this one-off
   * promotion request is for. Null for 'pro'/'dealer' (account-wide). */
  listing_id: string | null;
  plan: Plan;
  status: SubscriptionStatus;
  payment_note: string | null;
  started_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface CountryRow {
  id: string;
  code: string;
  name: string;
  currency: string;
  is_active: boolean;
}

export interface ReviewRow {
  id: string;
  dealer_id: string;
  author: string;
  rating: number;
  text: string | null;
  created_at: string;
}

export interface StaticPageRow {
  id: string;
  slug: string;
  locale: string;
  title: string;
  content_md: string;
  updated_at: string;
}

export interface AppSettingRow {
  key: string;
  value: unknown;
  updated_at: string;
}

export interface ListingWithMedia extends ListingRow {
  listing_photos: ListingPhotoRow[];
  listing_videos: ListingVideoRow[];
  dealers: Pick<DealerRow, "id" | "name" | "slug" | "verified"> | null;
}

// Result shape of src/lib/calculator.ts#computeEstimate — also what gets
// stored verbatim into leads.calculator_breakdown as a point-in-time snapshot.
export interface CalculatorBreakdown {
  priceChina: number;
  logisticsFee: number;
  brokerFee: number;
  customsDuty: number;
  total: number;
  currency: string;
  rateId: string | null;
  matchedBracket: string | null;
}
