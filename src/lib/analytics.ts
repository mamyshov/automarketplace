"use client";

import { createClient } from "@/lib/supabase/client";

// Lead-funnel event tracking (spec §9) — calculator opened/submitted,
// WhatsApp/Telegram click-through, etc. Fire-and-forget inserts into
// analytics_events; swap the implementation for a real analytics provider
// later without touching call sites.
export function trackEvent(eventName: string, payload: Record<string, unknown> = {}): void {
  try {
    const supabase = createClient();
    void supabase.from("analytics_events").insert({
      event_name: eventName,
      payload,
      session_id: getSessionId(),
    });
  } catch (err) {
    console.error("trackEvent failed", err);
  }
}

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const key = "cb_session_id";
    let id = window.sessionStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

export const ANALYTICS_EVENTS = {
  CALCULATOR_OPEN: "calculator_open",
  CALCULATOR_SUBMIT: "calculator_submit",
  LEAD_SUBMIT: "lead_submit",
  WHATSAPP_CLICK: "whatsapp_click",
  TELEGRAM_CLICK: "telegram_click",
  BUDGET_SEARCH: "budget_search",
} as const;
