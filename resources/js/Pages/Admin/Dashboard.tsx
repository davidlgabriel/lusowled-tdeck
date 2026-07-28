import OrderStatusBadge from '@/Components/OrderStatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatMoney } from '@/lib/money';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function AdminDashboard({
    stats,
    recentOrders,
    lowStock,
}: PageProps<{
    stats: {
        orders_today: number;
        revenue_today: number;
        revenue_month: number;
        customers_count: number;
        products_active: number;
        low_stock_count: number;
    };
    recentOrders: {
        id: number;
        order_number: string;
        customer: string;
        status: string;
        status_label: string;
        total: number;
        currency: string;
    }[];
    lowStock: {
        id: number;
        name: string;
        sku: string;
        stock_quantity: number;
        low_stock_threshold: number;
    }[];
}>) {
    return (
        <AdminLayout title="Dashboard">
            <Head title="Admin — Dashboard" />

            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    {
                        label: 'Vendas hoje',
                        value: stats.orders_today,
                        sub: formatMoney(stats.revenue_today),
                    },
                    {
                        label: 'Receita do mês',
                        value: formatMoney(stats.revenue_month),
                    },
                    {
                        label: 'Produtos ativos',
                        value: stats.products_active,
                    },
                    {
                        label: 'Stock baixo',
                        value: stats.low_stock_count,
                        alert: stats.low_stock_count > 0,
                    },
                ].map((card) => (
                    <div
                        key={card.label}
                        className="rounded-lg border border-brand-200 bg-white p-5 shadow-card"
                    >
                        <p className="text-sm text-brand-500">{card.label}</p>
                        <p
                            className={`mt-2 text-3xl font-semibold ${
                                card.alert ? 'text-red-700' : 'text-brand-900'
                            }`}
                        >
                            {card.value}
                        </p>
                        {card.sub && (
                            <p className="mt-1 text-sm text-brand-500">
                                {card.sub}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <section className="rounded-lg border border-brand-200 bg-white shadow-card">
                    <div className="border-b border-brand-200 px-5 py-4">
                        <h2 className="font-medium text-brand-900">Encomendas recentes</h2>
                    </div>
                    <div className="divide-y divide-brand-100">
                        {recentOrders.map((order) => (
                            <Link
                                key={order.id}
                                href={route('admin.orders.show', order.id)}
                                className="flex items-center justify-between px-5 py-4 hover:bg-brand-50"
                            >
                                <div>
                                    <p className="font-medium">
                                        {order.order_number}
                                    </p>
                                    <p className="text-sm text-brand-500">
                                        {order.customer}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <OrderStatusBadge
                                        status={order.status}
                                        label={order.status_label}
                                    />
                                    <p className="mt-1 text-sm font-medium">
                                        {formatMoney(
                                            order.total,
                                            order.currency,
                                        )}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="rounded-lg border border-brand-200 bg-white shadow-card">
                    <div className="flex items-center justify-between border-b border-brand-200 px-5 py-4">
                        <h2 className="font-medium text-brand-900">Alertas de stock</h2>
                        <Link
                            href={route('admin.stock.index')}
                            className="text-sm text-brand-accent underline"
                        >
                            Ver todos
                        </Link>
                    </div>
                    <div className="divide-y divide-brand-100">
                        {lowStock.length === 0 ? (
                            <p className="px-5 py-4 text-sm text-brand-500">
                                Sem alertas de stock.
                            </p>
                        ) : (
                            lowStock.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex justify-between px-5 py-4"
                                >
                                    <div>
                                        <p className="font-medium">{p.name}</p>
                                        <p className="text-sm text-brand-500">
                                            {p.sku}
                                        </p>
                                    </div>
                                    <span className="font-medium text-red-700">
                                        {p.stock_quantity} un.
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
