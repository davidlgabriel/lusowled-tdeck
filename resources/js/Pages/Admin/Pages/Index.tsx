import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function PagesIndex({
    pages,
}: {
    pages: {
        id: number;
        title: string;
        slug: string;
        footer_section_label: string | null;
        show_in_footer: boolean;
        is_published: boolean;
        sort_order: number;
    }[];
}) {
    const remove = (id: number, title: string) => {
        if (!confirm(`Eliminar página "${title}"?`)) return;
        router.delete(route('admin.pages.destroy', id));
    };

    return (
        <AdminLayout
            title="Páginas CMS"
            actions={
                <Link href={route('admin.pages.create')} className="btn-primary">
                    Nova página
                </Link>
            }
        >
            <Head title="Admin — Páginas" />

            <p className="mb-6 text-sm text-brand-500">
                Crie páginas com o editor visual ou em texto simples para o
                footer, FAQs, termos legais, etc.
            </p>

            <div className="overflow-hidden rounded-lg border border-brand-200 bg-white shadow-card">
                <table className="min-w-full text-sm">
                    <thead className="bg-brand-50 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                        <tr>
                            <th className="px-5 py-3">Título</th>
                            <th className="px-5 py-3">Slug</th>
                            <th className="px-5 py-3">Footer</th>
                            <th className="px-5 py-3">Estado</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-100">
                        {pages.map((page) => (
                            <tr key={page.id}>
                                <td className="px-5 py-4 font-medium">
                                    {page.title}
                                </td>
                                <td className="px-5 py-4 text-brand-500">
                                    /paginas/{page.slug}
                                </td>
                                <td className="px-5 py-4">
                                    {page.show_in_footer
                                        ? page.footer_section_label
                                        : '—'}
                                </td>
                                <td className="px-5 py-4">
                                    {page.is_published ? 'Publicada' : 'Rascunho'}
                                </td>
                                <td className="px-5 py-4 space-x-3 text-right">
                                    <Link
                                        href={route('admin.pages.edit', page.id)}
                                        className="font-medium underline"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => remove(page.id, page.title)}
                                        className="text-red-600 underline"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
