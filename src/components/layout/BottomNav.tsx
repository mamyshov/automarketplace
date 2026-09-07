"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_NAV_ITEMS } from "@/lib/constants";
import { HomeIcon, CarIcon, CalculatorIcon, HeartIcon, UserIcon } from "@/components/icons";

const ICONS = {
  home: HomeIcon,
  car: CarIcon,
  calculator: CalculatorIcon,
  heart: HeartIcon,
  user: UserIcon,
};

/**
 * Fixed bottom navigation for the 4-5 primary sections (spec §8: "нижняя
 * панель навигации, а не гамбургер-меню как единственный способ навигации").
 * Mobile-only — hidden from md breakpoint up, where the Header nav takes over.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-bottom-nav items-stretch border-t border-neutral-200 bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Основная навигация"
    >
      {BOTTOM_NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.icon];
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-w-touch flex-1 flex-col items-center justify-center gap-0.5 text-xs ${
              active ? "text-brand-600" : "text-neutral-500"
            }`}
          >
            <Icon width={22} height={22} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
