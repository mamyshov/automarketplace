"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBannerStatus } from "@/lib/actions/admin";
import type { BannerStatus } from "@/types/database";

export function BannerActions({ id, status }: { id: string; status: BannerStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(next: BannerStatus) {
    startTransition(async () => {
      await updateBannerStatus(id, next);
      router.refresh();
    });
  }

  if (status === "active") {
    return (
      <button
        disabled={isPending}
        onClick={() => run("expired")}
        className="min-h-touch rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 disabled:opacity-60"
      >
        Снять с показа
      </button>
    );
  }

  if (status !== "pending") return null;

  return (
    <div className="flex gap-2">
      <button
        disabled={isPending}
        onClick={() => run("active")}
        className="min-h-touch rounded-lg bg-success px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        Подтвердить оплату
      </button>
      <button
        disabled={isPending}
        onClick={() => run("rejected")}
        className="min-h-touch rounded-lg bg-danger px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        Отклонить
      </button>
    </div>
  );
}
