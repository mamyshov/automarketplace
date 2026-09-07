"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadStatus } from "@/lib/actions/admin";
import type { LeadStatus } from "@/types/database";

const LABELS: Record<LeadStatus, string> = { new: "Новая", contacted: "На связи", closed: "Закрыта" };

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(async () => {
          await updateLeadStatus(leadId, e.target.value as LeadStatus);
          router.refresh();
        })
      }
      className="rounded-lg border border-neutral-300 px-2 py-1 text-sm disabled:opacity-60"
    >
      {Object.entries(LABELS).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  );
}
