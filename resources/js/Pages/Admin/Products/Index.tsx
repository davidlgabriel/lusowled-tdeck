import AdminLayout from '@/Layouts/AdminLayout';
import { formatMoney } from '@/lib/money';
import { Head, Link } from '@inertiajs/react';

export default function ProductsIndex({
    products,
}: {
    products: {
        data: {
            id: number;
            name: string;
            sku: string;
            base_price: number;
            sale_price: number | null;
            status_label: string;
            stock_quantity: number;
            is_featured: boolean;
            categories: string[];
            active_variants_count: number;
        }[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}) {
    return (
        <AdminLayout
            title="Produtos"
            actions={
                <Link href={route('admin.products.create')} className="btn-primary">
                    Novo produto
                </Link>
            }
        >
            <Head title="Admin — Produtos" />

            <div className="overflow-hidden rounded-lg border border-brand-200 bg-white shadow-card">
                <table className="min-w-full text-sm">
                    <thead className="bg-brand-50 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                        <tr>
                            <th className="px-5 py-3">Produto</th>
                            <th className="px-5 py-3">SKU</th>
                            <th className="px-5 py-3">Preço</th>
                            <th className="px-5 py-3">Stock</th>
                            <th className="px-5 py-3">Estado</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-100">
                        {products.data.map((p) => (
                            <tr key={p.id} className="hover:bg-brand-50/50">
                                <td className="px-5 py-4">
                                    <p className="font-medium text-brand-900">
                                        {p.name}
                                    </p>
                                    <p className="text-xs text-brand-500">
                                        {p.categories.join(', ') || '—'}
                                    </p>
                                    {p.is_featured && (
                                        <span className="mt-1 inline-block text-xs font-medium text-brand-accent">
                                            Destaque
                                        </span>
                                    )}
                                    {p.active_variants_count > 0 && (
                                        <span className="mt-1 inline-block text-xs text-brand-500">
                                            {p.active_variants_count} variantes
                                        </span>
                                    )}
                                </td>
                                <td className="px-5 py-4 text-brand-600">
                                    {p.sku}
                                </td>
                                <td className="px-5 py-4">
                                    {formatMoney(p.base_price)}
                                    {p.sale_price && (
                                        <span className="ml-1 text-brand-accent">
                                            → {formatMoney(p.sale_price)}
                                        </span>
                                    )}
                                </td>
                                <td className="px-5 py-4">{p.stock_quantity}</td>
                                <td className="px-5 py-4">{p.status_label}</td>
                                <td className="px-5 py-4 text-right">
                                    <Link
                                        href={route('admin.products.show', p.id)}
                                        className="font-medium text-brand-900 underline"
                                    >
                                        Detalhes
                                    </Link>
                                    <span className="mx-2 text-brand-300">·</span>
                                    <Link
                                        href={route('admin.products.edit', p.id)}
                                        className="font-medium text-brand-600 underline"
                                    >
                                        Editar
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
