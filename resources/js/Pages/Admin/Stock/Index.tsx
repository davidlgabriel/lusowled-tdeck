import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function StockIndex({
    products,
}: {
    products: {
        data: {
            id: number;
            name: string;
            sku: string;
            image_url: string | null;
            stock_quantity: number;
            low_stock_threshold: number;
            is_low_stock: boolean;
        }[];
    };
}) {
    const [editing, setEditing] = useState<number | null>(null);
    const [qty, setQty] = useState(0);
    const [threshold, setThreshold] = useState(0);

    const startEdit = (p: (typeof products.data)[0]) => {
        setEditing(p.id);
        setQty(p.stock_quantity);
        setThreshold(p.low_stock_threshold);
    };

    const save = (id: number) => {
        router.patch(
            route('admin.stock.update', id),
            {
                stock_quantity: qty,
                low_stock_threshold: threshold,
            },
            {
                preserveScroll: true,
                onSuccess: () => setEditing(null),
            },
        );
    };

    return (
        <AdminLayout title="Stock">
            <Head title="Admin — Stock" />

            <div className="overflow-hidden rounded-lg border border-brand-200 bg-white shadow-card">
                <table className="min-w-full text-sm">
                    <thead className="bg-brand-50 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                        <tr>
                            <th className="px-5 py-3">Produto</th>
                            <th className="px-5 py-3">SKU</th>
                            <th className="px-5 py-3">Stock</th>
                            <th className="px-5 py-3">Alerta</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-100">
                        {products.data.map((p) => (
                            <tr
                                key={p.id}
                                className={
                                    p.is_low_stock ? 'bg-red-50/50' : undefined
                                }
                            >
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-brand-200 bg-brand-50">
                                            {p.image_url ? (
                                                <img
                                                    src={p.image_url}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs text-brand-400">
                                                    —
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-medium">{p.name}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-brand-500">
                                    {p.sku}
                                </td>
                                <td className="px-5 py-4">
                                    {editing === p.id ? (
                                        <input
                                            type="number"
                                            value={qty}
                                            onChange={(e) =>
                                                setQty(Number(e.target.value))
                                            }
                                            className="input-field w-24"
                                        />
                                    ) : (
                                        <span
                                            className={
                                                p.is_low_stock
                                                    ? 'font-semibold text-red-700'
                                                    : ''
                                            }
                                        >
                                            {p.stock_quantity}
                                        </span>
                                    )}
                                </td>
                                <td className="px-5 py-4">
                                    {editing === p.id ? (
                                        <input
                                            type="number"
                                            value={threshold}
                                            onChange={(e) =>
                                                setThreshold(
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="input-field w-24"
                                        />
                                    ) : (
                                        p.low_stock_threshold
                                    )}
                                </td>
                                <td className="px-5 py-4 text-right">
                                    {editing === p.id ? (
                                        <button
                                            type="button"
                                            onClick={() => save(p.id)}
                                            className="font-medium underline"
                                        >
                                            Guardar
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => startEdit(p)}
                                            className="font-medium underline"
                                        >
                                            Editar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
