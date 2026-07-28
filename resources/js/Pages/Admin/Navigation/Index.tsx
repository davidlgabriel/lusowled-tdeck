import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function NavigationIndex({
    items,
}: {
    items: {
        id: number;
        label: string;
        type_label: string;
        target: string | null;
        sort_order: number;
        is_active: boolean;
    }[];
}) {
    const remove = (id: number) => {
        if (!confirm('Eliminar este item?')) return;
        router.delete(route('admin.navigation.destroy', id));
    };

    return (
        <AdminLayout
            title="Navegação"
            actions={
                <Link
                    href={route('admin.navigation.create')}
                    className="btn-primary"
                >
                    Novo item
                </Link>
            }
        >
            <Head title="Admin — Navegação" />

            <p className="mb-6 text-sm text-brand-500">
                Define os links que aparecem na navbar da loja.
            </p>

            <div className="overflow-hidden rounded-lg border border-brand-200 bg-white shadow-card">
                <table className="min-w-full text-sm">
                    <thead className="bg-brand-50 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                        <tr>
                            <th className="px-5 py-3">Label</th>
                            <th className="px-5 py-3">Tipo</th>
                            <th className="px-5 py-3">Destino</th>
                            <th className="px-5 py-3">Ordem</th>
                            <th className="px-5 py-3">Ativo</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-100">
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td className="px-5 py-4 font-medium">
                                    {item.label}
                                </td>
                                <td className="px-5 py-4">{item.type_label}</td>
                                <td className="px-5 py-4 text-brand-500">
                                    {item.target ?? '—'}
                                </td>
                                <td className="px-5 py-4">{item.sort_order}</td>
                                <td className="px-5 py-4">
                                    {item.is_active ? 'Sim' : 'Não'}
                                </td>
                                <td className="px-5 py-4 space-x-3 text-right">
                                    <Link
                                        href={route(
                                            'admin.navigation.edit',
                                            item.id,
                                        )}
                                        className="font-medium underline"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => remove(item.id)}
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
