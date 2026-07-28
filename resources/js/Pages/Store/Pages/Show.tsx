import Breadcrumbs from '@/Components/Store/Breadcrumbs';
import StoreLayout from '@/Layouts/StoreLayout';
import { Head } from '@inertiajs/react';

export default function ContentPageShow({
    page,
}: {
    page: {
        title: string;
        slug: string;
        content: string;
        content_format: string;
    };
}) {
    const isHtml = page.content_format === 'html';

    return (
        <StoreLayout>
            <Head title={page.title} />

            <div className="store-container max-w-3xl pb-16">
                <Breadcrumbs
                    items={[
                        { label: 'Início', href: route('home') },
                        { label: page.title },
                    ]}
                />

                <h1 className="store-heading">{page.title}</h1>

                {isHtml ? (
                    <article
                        className="prose prose-sm mt-8 max-w-none text-brand-700 prose-headings:font-semibold prose-headings:text-brand-900 prose-a:text-brand-900 prose-a:underline prose-img:rounded-xl prose-img:shadow-card prose-figure:my-8 [&_.legal-page_.lead]:text-lg [&_.legal-page_.lead]:text-brand-800 [&_.legal-figure_img]:aspect-[16/9] [&_.legal-figure_img]:w-full [&_.legal-figure_img]:object-cover [&_.legal-page_blockquote]:border-l-4 [&_.legal-page_blockquote]:border-brand-300 [&_.legal-page_blockquote]:bg-brand-50 [&_.legal-page_blockquote]:py-3 [&_.legal-page_blockquote]:pl-4"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                ) : (
                    <article className="mt-8 whitespace-pre-wrap text-sm leading-relaxed text-brand-700 md:text-base">
                        {page.content}
                    </article>
                )}
            </div>
        </StoreLayout>
    );
}
