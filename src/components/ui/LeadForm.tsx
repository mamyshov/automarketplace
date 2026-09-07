"use client";

import { useState } from "react";
import { submitLead } from "@/lib/actions/leads";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics";
import { t } from "@/lib/i18n";
import type { LeadSource, CalculatorBreakdown, ContactChannel } from "@/types/database";

interface LeadFormProps {
  source: LeadSource;
  listingId?: string;
  brand?: string;
  model?: string;
  year?: number;
  budget?: number;
  calculatorBreakdown?: CalculatorBreakdown | null;
  ctaLabel?: string;
  className?: string;
}

export function LeadForm({
  source,
  listingId,
  brand,
  model,
  year,
  budget,
  calculatorBreakdown,
  ctaLabel,
  className = "",
}: LeadFormProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [channel, setChannel] = useState<ContactChannel>("whatsapp");
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setErrorMessage(null);

    const result = await submitLead({
      source,
      listing_id: listingId ?? null,
      brand: brand ?? null,
      model: model ?? null,
      year: year ?? null,
      budget: budget ?? null,
      name,
      contact,
      contact_channel: channel,
      calculator_breakdown: calculatorBreakdown ?? null,
    });

    if (result.ok) {
      setState("success");
      trackEvent(ANALYTICS_EVENTS.LEAD_SUBMIT, { source, listingId, brand, model, budget });
    } else {
      setState("error");
      setErrorMessage(result.error ?? t.lead.error);
    }
  }

  if (state === "success") {
    return (
      <div className={`rounded-lg border border-success/30 bg-success/5 p-4 text-sm text-success ${className}`}>
        {t.lead.success}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${className}`}>
      <div>
        <label htmlFor="lead-name" className="mb-1 block text-sm font-medium text-neutral-700">
          {t.lead.name}
        </label>
        <input
          id="lead-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-h-touch w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="Иван Иванов"
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="lead-contact" className="mb-1 block text-sm font-medium text-neutral-700">
            {t.lead.contact}
          </label>
          <input
            id="lead-contact"
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="min-h-touch w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="+996 700 000 000"
          />
        </div>
        <div>
          <label htmlFor="lead-channel" className="mb-1 block text-sm font-medium text-neutral-700">
            Способ
          </label>
          <select
            id="lead-channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value as ContactChannel)}
            className="min-h-touch rounded-lg border border-neutral-300 px-2 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="telegram">Telegram</option>
            <option value="phone">Телефон</option>
          </select>
        </div>
      </div>

      {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="min-h-touch rounded-lg bg-accent-500 px-4 py-2.5 font-semibold text-white transition hover:bg-accent-600 disabled:opacity-60"
      >
        {state === "submitting" ? "Отправляем…" : ctaLabel ?? t.lead.submit}
      </button>
    </form>
  );
}
