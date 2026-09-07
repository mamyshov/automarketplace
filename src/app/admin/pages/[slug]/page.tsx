import { getStaticPage } from "@/lib/data/static-pages";
import { PageEditForm } from "./PageEditForm";

export default async function AdminPageEditPage({ params }: { params: { slug: string } }) {
  const page = await getStaticPage(params.slug);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-neutral-900">Редактирование: {page?.title ?? params.slug}</h1>
      <PageEditForm slug={params.slug} initialTitle={page?.title ?? ""} initialContent={page?.content_md ?? ""} />
    </div>
  );
}
