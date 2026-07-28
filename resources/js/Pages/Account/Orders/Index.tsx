import OrderCard from '@/Components/Account/OrderCard';
import AccountLayout from '@/Layouts/AccountLayout';
import { OrderSummary, PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function OrdersIndex({
    orders,
}: PageProps<{
    orders: {
        data: OrderSummary[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}>) {
    return (
        <AccountLayout title="Encomendas">
            <Head title="Encomendas" />

            {orders.data.length === 0 ? (
                <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50 p-8 text-center text-brand-600">
                    Ainda não tem encomendas.{' '}
                    <Link href={route('products.index')} className="underline">
                        Ver produtos
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.data.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            href={route('account.orders.show', order.id)}
                        />
                    ))}
                </div>
            )}

            {orders.links.length > 3 && (
                <div className="mt-6 flex flex-wrap gap-2">
                    {orders.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            className={`rounded-md px-3 py-1.5 text-sm ${
                                link.active
                                    ? 'bg-brand-900 text-white'
                                    : 'border border-brand-200 bg-white text-brand-700 hover:border-brand-400'
                            } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AccountLayout>
    );
}
