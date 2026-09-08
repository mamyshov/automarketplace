import type { Metadata } from "next";
import { getDealerBySlug } from "@/lib/data/dealers";
import { DealerPageContent } from "./DealerPageContent";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const dealer = await getDealerBySlug(params.slug);
  return { title: dealer?.name ?? "Компания не найдена" };
}

export default function DealerPage({ params }: { params: { slug: string } }) {
  return <DealerPageContent slug={params.slug} locale="ru" />;
}
