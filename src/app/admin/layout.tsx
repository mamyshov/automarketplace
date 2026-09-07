import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/profile";

const NAV = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/moderation", label: "Модерация" },
  { href: "/admin/brands", label: "Марки и модели" },
  { href: "/admin/rates", label: "Ставки калькулятора" },
  { href: "/admin/leads", label: "Заявки" },
  { href: "/admin/subscriptions", label: "Тарифы" },
  { href: "/admin/reviews", label: "Отзывы" },
  { href: "/admin/pages", label: "Контент" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (currentUser.profile.role !== "admin") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-4 rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white">Админ-панель CarBridge</div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
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
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
