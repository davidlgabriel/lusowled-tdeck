import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function PromotionsIndex({
    promotions,
}: {
    promotions: {
        id: number;
        name: string;
        code: string | null;
        type_label: string;
        value: number;
        applies_to_label: string;
        is_active: boolean;
        is_currently_active: boolean;
        usage_count: number;
        usage_limit: number | null;
    }[];
}) {
    const remove = (id: number) => {
        if (!confirm('Eliminar esta promoção?')) return;
        router.delete(route('admin.promotions.destroy', id));
    };

    return (
        <AdminLayout
            title="Promoções"
            actions={
                <Link
                    href={route('admin.promotions.create')}
                    className="btn-primary"
                >
                    Nova promoção
                </Link>
            }
        >
            <Head title="Admin — Promoções" />

            <div className="overflow-hidden rounded-lg border border-brand-200 bg-white shadow-card">
                <table className="min-w-full text-sm">
                    <thead className="bg-brand-50 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                        <tr>
                            <th className="px-5 py-3">Nome</th>
                            <th className="px-5 py-3">Código</th>
                            <th className="px-5 py-3">Desconto</th>
                            <th className="px-5 py-3">Aplica-se a</th>
                            <th className="px-5 py-3">Utilizações</th>
                            <th className="px-5 py-3">Estado</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-100">
                        {promotions.map((p) => (
                            <tr key={p.id}>
                                <td className="px-5 py-4 font-medium">{p.name}</td>
                                <td className="px-5 py-4 font-mono text-xs">
                                    {p.code ?? '—'}
                                </td>
                                <td className="px-5 py-4">
                                    {p.type_label}: {p.value}
                                </td>
                                <td className="px-5 py-4">{p.applies_to_label}</td>
                                <td className="px-5 py-4">
                                    {p.usage_count}
                                    {p.usage_limit && ` / ${p.usage_limit}`}
                                </td>
                                <td className="px-5 py-4">
                                    <span
                                        className={
                                            p.is_currently_active
                                                ? 'text-green-700'
                                                : 'text-brand-400'
                                        }
                                    >
                                        {p.is_currently_active
                                            ? 'Ativa'
                                            : p.is_active
                                              ? 'Inativa/expirada'
                                              : 'Desativada'}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-right space-x-3">
                                    <Link
                                        href={route('admin.promotions.edit', p.id)}
                                        className="font-medium underline"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => remove(p.id)}
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
