import Link from "next/link";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-16 hidden border-t border-neutral-200 bg-white md:block">
      <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-neutral-600">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
          <div>
            <div className="mb-2 text-lg font-bold text-brand-600">{SITE_NAME}</div>
            <p>{SITE_DESCRIPTION}</p>
          </div>
          <div>
            <div className="mb-2 font-semibold text-neutral-900">Автомобили</div>
            <ul className="space-y-1">
              <li><Link href="/cars?market=bishkek" className="hover:text-brand-600">В наличии в Бишкеке</Link></li>
              <li><Link href="/cars?market=china" className="hover:text-brand-600">Из Китая под заказ</Link></li>
              <li><Link href="/cars" className="hover:text-brand-600">Все автомобили</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-2 font-semibold text-neutral-900">Китай</div>
            <ul className="space-y-1">
              <li><Link href="/china/calculator" className="hover:text-brand-600">Калькулятор стоимости</Link></li>
              <li><Link href="/china/how-to-buy" className="hover:text-brand-600">Как купить авто в Китае</Link></li>
              <li><Link href="/china/delivery" className="hover:text-brand-600">Доставка</Link></li>
              <li><Link href="/china/customs" className="hover:text-brand-600">Таможня</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-2 font-semibold text-neutral-900">Площадка</div>
            <ul className="space-y-1">
              <li><Link href="/about" className="hover:text-brand-600">О площадке / Контакты</Link></li>
              <li><Link href="/dashboard/listings/new" className="hover:text-brand-600">Разместить объявление</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-neutral-100 pt-6 text-xs text-neutral-400">
          © {new Date().getFullYear()} {SITE_NAME}
        </div>
      </div>
    </footer>
  );
}
