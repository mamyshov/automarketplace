"use client";

import { useState } from "react";
import { upsertStaticPage } from "@/lib/actions/admin";

export function PageEditForm({ slug, initialTitle, initialContent }: { slug: string; initialTitle: string; initialContent: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await upsertStaticPage(slug, "ru", title, content);
    setSaving(false);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Заголовок</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-h-touch w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Содержимое (Markdown)</label>
        <textarea
          rows={18}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      {saved && <p className="text-sm text-success">Сохранено</p>}
      <button
        type="submit"
        disabled={saving}
        className="min-h-touch w-fit rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {saving ? "Сохраняем…" : "Сохранить"}
      </button>
    </form>
  );
}
