"use server";

import { headers } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { leadFormSchema, type LeadFormInput } from "@/lib/validation";
import { checkRateLimit, clientIpFrom } from "@/lib/rate-limit";
import { notifyNewLead } from "@/lib/telegram";
import { LEAD_SOURCE_LABELS } from "@/lib/constants";

export interface SubmitLeadResult {
  ok: boolean;
  error?: string;
}

export async function submitLead(input: LeadFormInput): Promise<SubmitLeadResult> {
  const parsed = leadFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  const ip = clientIpFrom(headers());
  if (!checkRateLimit(`lead:${ip}`, 5, 10 * 60 * 1000)) {
    return { ok: false, error: "Слишком много заявок. Попробуйте позже." };
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      source: parsed.data.source,
      listing_id: parsed.data.listing_id ?? null,
      brand: parsed.data.brand ?? null,
      model: parsed.data.model ?? null,
      year: parsed.data.year ?? null,
      budget: parsed.data.budget ?? null,
      name: parsed.data.name,
      contact: parsed.data.contact,
      contact_channel: parsed.data.contact_channel,
      calculator_breakdown: parsed.data.calculator_breakdown ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("submitLead insert failed", error);
    return { ok: false, error: "Не удалось сохранить заявку" };
  }

  const parts = [
    `🚗 Новая заявка (${LEAD_SOURCE_LABELS[parsed.data.source]})`,
    `Имя: ${parsed.data.name}`,
    `Контакт: ${parsed.data.contact} (${parsed.data.contact_channel})`,
  ];
  if (parsed.data.brand) parts.push(`Марка/модель: ${parsed.data.brand} ${parsed.data.model ?? ""}`);
  if (parsed.data.budget) parts.push(`Бюджет: $${parsed.data.budget}`);
  if (parsed.data.calculator_breakdown) {
    const total = (parsed.data.calculator_breakdown as { total?: number }).total;
    if (total) parts.push(`Расчёт калькулятора: $${total}`);
  }

  await notifyNewLead(parts.join("\n"));

  return { ok: true };
}
