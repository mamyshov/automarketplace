import type { Metadata } from "next";
import Link from "next/link";
import { getOwnDealer } from "@/lib/data/dealers";
import { DealerProfileForm } from "./DealerProfileForm";
import { LogoUploader } from "./LogoUploader";

export const metadata: Metadata = { title: "Профиль компании" };

export default async function CompanyProfilePage() {
  const dealer = await getOwnDealer();

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-neutral-900">Профиль компании</h1>

      {dealer && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <LogoUploader dealerId={dealer.id} logoUrl={dealer.logo_url} />
          <Link href={`/companies/${dealer.slug}`} className="text-sm font-medium text-brand-600 hover:underline">
            Открыть страницу компании →
          </Link>
        </div>
      )}

      <DealerProfileForm existing={dealer} />

      {dealer && (
        <p className="mt-4 max-w-lg text-sm text-neutral-500">
          Чтобы объявление публиковалось от имени компании, выберите её в форме объявления
          («От имени компании») при создании или редактировании.
        </p>
      )}
    </div>
  );
}
