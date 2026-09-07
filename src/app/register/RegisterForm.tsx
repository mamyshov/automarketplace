"use client";

import { useState } from "react";
import Link from "next/link";
import { signUpWithPassword } from "@/lib/actions/auth";

const inputCls =
  "min-h-touch w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signUpWithPassword(email, password, name);
    setLoading(false);
    if (result.ok) {
      setDone(true);
    } else {
      setError(result.error ?? "Не удалось зарегистрироваться");
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-sm text-success">
        Проверьте почту — мы отправили письмо для подтверждения аккаунта.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Имя</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Пароль</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="min-h-touch rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Регистрируем…" : "Зарегистрироваться"}
      </button>
      <p className="text-center text-sm text-neutral-500">
        Уже есть аккаунт? <Link href="/login" className="font-medium text-brand-600 hover:underline">Войти</Link>
      </p>
    </form>
  );
}
