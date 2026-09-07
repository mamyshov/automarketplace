import type { Metadata } from "next";
import { getBrandsWithModels } from "@/lib/data/brands";
import { BrandsManager } from "./BrandsManager";

export const metadata: Metadata = { title: "Марки и модели" };

export default async function AdminBrandsPage() {
  const brands = await getBrandsWithModels();

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-neutral-900">Справочник марок и моделей</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Используется для автоподсказок в форме объявления и в фильтрах каталога. Само объявление
        всё равно принимает произвольный текст марки/модели — справочник не обязателен для
        размещения, просто ускоряет ввод.
      </p>
      <BrandsManager brands={brands} />
    </div>
  );
}
