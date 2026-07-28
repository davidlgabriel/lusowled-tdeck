import OrderCard from '@/Components/Account/OrderCard';
import AccountLayout from '@/Layouts/AccountLayout';
import { OrderSummary, PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({
    stats,
    recentOrders,
}: PageProps<{
    stats: { orders_count: number; addresses_count: number };
    recentOrders: OrderSummary[];
}>) {
    return (
        <AccountLayout title="A minha conta">
            <Head title="A minha conta" />

            <div className="mb-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-brand-200 bg-white p-5 shadow-card">
                    <p className="text-sm font-medium text-brand-600">
                        Encomendas
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-brand-900">
                        {stats.orders_count}
                    </p>
                </div>
                <div className="rounded-xl border border-brand-200 bg-white p-5 shadow-card">
                    <p className="text-sm font-medium text-brand-600">
                        Moradas guardadas
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-brand-900">
                        {stats.addresses_count}
                    </p>
                    <Link
                        href={route('account.addresses.index')}
                        className="mt-2 inline-block text-sm text-brand-600 underline"
                    >
                        Gerir moradas
                    </Link>
                </div>
            </div>

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-brand-900">
                        Encomendas recentes
                    </h2>
                    <Link
                        href={route('account.orders.index')}
                        className="text-sm font-medium text-brand-700 underline"
                    >
                        Ver todas
                    </Link>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50 p-8 text-center text-brand-600">
                        Ainda não tem encomendas.{' '}
                        <Link href={route('products.index')} className="underline">
                            Explorar produtos
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                href={route('account.orders.show', order.id)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </AccountLayout>
    );
}
