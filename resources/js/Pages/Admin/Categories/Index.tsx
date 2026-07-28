import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function CategoriesIndex({
    categories,
}: {
    categories: {
        id: number;
        name: string;
        slug: string;
        parent: string | null;
        is_active: boolean;
        sort_order: number;
        products_count: number;
    }[];
}) {
    const remove = (id: number, name: string) => {
        if (!confirm(`Eliminar categoria "${name}"?`)) return;
        router.delete(route('admin.categories.destroy', id));
    };

    return (
        <AdminLayout
            title="Categorias"
            actions={
                <Link
                    href={route('admin.categories.create')}
                    className="btn-primary"
                >
                    Nova categoria
                </Link>
            }
        >
            <Head title="Admin — Categorias" />

            <div className="overflow-hidden rounded-lg border border-brand-200 bg-white shadow-card">
                <table className="min-w-full text-sm">
                    <thead className="bg-brand-50 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                        <tr>
                            <th className="px-5 py-3">Nome</th>
                            <th className="px-5 py-3">Slug</th>
                            <th className="px-5 py-3">Pai</th>
                            <th className="px-5 py-3">Produtos</th>
                            <th className="px-5 py-3">Ordem</th>
                            <th className="px-5 py-3">Ativa</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-100">
                        {categories.map((c) => (
                            <tr key={c.id}>
                                <td className="px-5 py-4 font-medium">
                                    {c.name}
                                </td>
                                <td className="px-5 py-4 text-brand-500">
                                    {c.slug}
                                </td>
                                <td className="px-5 py-4">{c.parent ?? '—'}</td>
                                <td className="px-5 py-4">{c.products_count}</td>
                                <td className="px-5 py-4">{c.sort_order}</td>
                                <td className="px-5 py-4">
                                    <span
                                        className={
                                            c.is_active
                                                ? 'text-green-700'
                                                : 'text-brand-400'
                                        }
                                    >
                                        {c.is_active ? 'Sim' : 'Não'}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-right space-x-3">
                                    <Link
                                        href={route('admin.categories.edit', c.id)}
                                        className="font-medium underline"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => remove(c.id, c.name)}
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
