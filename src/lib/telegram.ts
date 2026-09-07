import "server-only";
import { env } from "@/lib/env";

/**
 * Best-effort lead notification. MVP notification channel is a Telegram bot
 * message (spec §5.3/§5.8) — no CRM integration yet. No-ops silently when
 * TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID aren't configured, so local dev and
 * early deploys don't need this set up to work.
 */
export async function notifyNewLead(text: string): Promise<void> {
  if (!env.telegramBotToken || !env.telegramChatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.telegramChatId,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch (err) {
    // Never let a notification failure break lead submission for the visitor.
    console.error("telegram notify failed", err);
  }
}
