import OrderStatusBadge from '@/Components/OrderStatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatMoney } from '@/lib/money';
import { Head, Link, router } from '@inertiajs/react';

export default function OrdersIndex({
    orders,
    filters,
    statuses,
}: {
    orders: {
        data: {
            id: number;
            order_number: string;
            customer: string;
            email: string;
            status: string;
            status_label: string;
            payment_status_label: string;
            total: number;
            currency: string;
        }[];
    };
    filters: { q: string; status: string };
    statuses: { value: string; label: string }[];
}) {
    return (
        <AdminLayout title="Encomendas">
            <Head title="Admin — Encomendas" />

            <div className="mb-6 flex gap-3">
                <input
                    type="search"
                    placeholder="Pesquisar..."
                    defaultValue={filters.q}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            router.get(route('admin.orders.index'), {
                                q: (e.target as HTMLInputElement).value,
                                status: filters.status,
                            });
                        }
                    }}
                    className="input-field max-w-xs"
                />
                <select
                    defaultValue={filters.status}
                    onChange={(e) =>
                        router.get(route('admin.orders.index'), {
                            q: filters.q,
                            status: e.target.value,
                        })
                    }
                    className="input-field max-w-xs"
                >
                    <option value="">Todos os estados</option>
                    {statuses.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-hidden rounded-sm border border-[#e2e2de] bg-white shadow-sm">
                <table className="min-w-full text-sm">
                    <thead className="bg-[#fafaf8] text-left text-xs uppercase tracking-wider text-[#6b6b66]">
                        <tr>
                            <th className="px-5 py-3">Encomenda</th>
                            <th className="px-5 py-3">Cliente</th>
                            <th className="px-5 py-3">Estado</th>
                            <th className="px-5 py-3">Pagamento</th>
                            <th className="px-5 py-3">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0ec]">
                        {orders.data.map((o) => (
                            <tr key={o.id} className="hover:bg-[#fafaf8]">
                                <td className="px-5 py-4">
                                    <Link
                                        href={route('admin.orders.show', o.id)}
                                        className="font-medium underline"
                                    >
                                        {o.order_number}
                                    </Link>
                                </td>
                                <td className="px-5 py-4">
                                    <p>{o.customer}</p>
                                    <p className="text-xs text-[#6b6b66]">
                                        {o.email}
                                    </p>
                                </td>
                                <td className="px-5 py-4">
                                    <OrderStatusBadge
                                        status={o.status}
                                        label={o.status_label}
                                    />
                                </td>
                                <td className="px-5 py-4">
                                    {o.payment_status_label}
                                </td>
                                <td className="px-5 py-4 font-medium">
                                    {formatMoney(o.total, o.currency)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
