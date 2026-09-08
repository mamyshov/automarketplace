import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/profile";
import { signOut } from "@/lib/actions/auth";

const NAV = [
  { href: "/dashboard/listings", label: "Мои объявления" },
  { href: "/dashboard/leads", label: "Заявки" },
  { href: "/dashboard/stats", label: "Статистика" },
  { href: "/dashboard/company", label: "Профиль компании" },
  { href: "/dashboard/billing", label: "Тариф и оплата" },
  { href: "/dashboard/settings", label: "Настройки" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
        <aside>
          <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4">
            <div className="font-semibold text-neutral-900">{currentUser.profile.name || currentUser.email}</div>
            <div className="text-xs text-neutral-500">{currentUser.email}</div>
            {currentUser.profile.role === "admin" && (
              <Link href="/admin" className="mt-2 inline-block text-xs font-medium text-brand-600 hover:underline">
                Перейти в админку →
              </Link>
            )}
          </div>
          <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                {item.label}
              </Link>
            ))}
            <form action={signOut}>
              <button
                type="submit"
                className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium text-danger hover:bg-danger/5"
              >
                Выйти
              </button>
            </form>
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
