import { z } from "zod";

export const leadFormSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(100),
  contact: z.string().trim().min(5, "Укажите контакт").max(100),
  contact_channel: z.enum(["whatsapp", "telegram", "phone"]).default("whatsapp"),
  source: z.enum(["calculator", "budget", "listing"]),
  listing_id: z.string().uuid().optional().nullable(),
  brand: z.string().trim().max(100).optional().nullable(),
  model: z.string().trim().max(100).optional().nullable(),
  year: z.coerce.number().int().min(1970).max(2100).optional().nullable(),
  budget: z.coerce.number().min(0).max(1_000_000).optional().nullable(),
  calculator_breakdown: z.record(z.any()).optional().nullable(),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;

export const listingFormSchema = z.object({
  market: z.enum(["bishkek", "china"]),
  brand: z.string().trim().min(1, "Укажите марку").max(100),
  model: z.string().trim().min(1, "Укажите модель").max(100),
  year: z.coerce.number().int().min(1970).max(2100),
  mileage: z.coerce.number().int().min(0).max(2_000_000).optional().nullable(),
  body_type: z.string().trim().max(50).optional().nullable(),
  transmission: z.string().trim().max(50).optional().nullable(),
  fuel: z.string().trim().max(50).optional().nullable(),
  engine_volume: z.coerce.number().min(0).max(20).optional().nullable(),
  color: z.string().trim().max(50).optional().nullable(),
  vin: z.string().trim().max(50).optional().nullable(),
  price_origin: z.coerce.number().min(0).optional().nullable(),
  price_final: z.coerce.number().min(0, "Укажите цену"),
  status: z.enum(["available", "in_transit", "in_china", "on_order", "sold"]),
  description: z.string().trim().max(5000).optional().nullable(),
  location: z.string().trim().max(200).optional().nullable(),
  dealer_id: z.string().uuid().optional().nullable(),
});

export type ListingFormInput = z.infer<typeof listingFormSchema>;

export const dealerFormSchema = z.object({
  name: z.string().trim().min(2, "Укажите название компании").max(150),
  description: z.string().trim().max(3000).optional().nullable(),
  region: z.string().trim().max(100).optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  whatsapp: z.string().trim().max(50).optional().nullable(),
  telegram: z.string().trim().max(50).optional().nullable(),
});

export type DealerFormInput = z.infer<typeof dealerFormSchema>;

export const calculatorRateFormSchema = z.object({
  body_type: z.string().trim().min(1),
  engine_volume_from: z.coerce.number().min(0),
  engine_volume_to: z.coerce.number().min(0),
  year_from: z.coerce.number().int().min(1970),
  year_to: z.coerce.number().int().min(1970),
  logistics_fee: z.coerce.number().min(0),
  broker_fee: z.coerce.number().min(0),
  customs_duty: z.coerce.number().min(0),
  customs_formula: z.string().trim().max(500).optional().nullable(),
  currency: z.string().trim().default("USD"),
  is_active: z.coerce.boolean().default(true),
});

export type CalculatorRateFormInput = z.infer<typeof calculatorRateFormSchema>;
