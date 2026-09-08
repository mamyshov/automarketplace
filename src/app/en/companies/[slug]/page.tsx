import type { Metadata } from "next";
import { getDealerBySlug } from "@/lib/data/dealers";
import { DealerPageContent } from "@/app/companies/[slug]/DealerPageContent";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const dealer = await getDealerBySlug(params.slug);
  return { title: dealer?.name ?? "Company not found" };
}

export default function DealerPageEn({ params }: { params: { slug: string } }) {
  return <DealerPageContent slug={params.slug} locale="en" />;
}
