import { marked } from "marked";
import { getStaticPage } from "@/lib/data/static-pages";
import { notFound } from "next/navigation";

/**
 * Renders a CMS-lite content page (spec §5.3/§5.8: "markdown-страницы,
 * редактируемые из админки, чтобы не трогать код при правках текста").
 * Content is admin-authored only (write access gated by RLS to role=admin),
 * so rendering the parsed markdown as-is is an accepted trust boundary here.
 */
export async function StaticPageContent({ slug }: { slug: string }) {
  const page = await getStaticPage(slug);
  if (!page) notFound();

  const html = marked.parse(page.content_md, { async: false }) as string;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 sm:text-3xl">{page.title}</h1>
      <div
        className="prose-content max-w-none [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
