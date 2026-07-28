import OrderStatusBadges from '@/Components/Account/OrderStatusBadges';
import AccountLayout from '@/Layouts/AccountLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

function formatMoney(amount: number, currency: string) {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency,
    }).format(amount);
}

function formatDate(iso?: string) {
    if (!iso) return null;
    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(iso));
}

export default function OrderShow({
    order,
}: PageProps<{
    order: {
        id: number;
        order_number: string;
        status: string;
        status_label: string;
        payment_status: string;
        payment_status_label: string;
        subtotal: number;
        discount_total: number;
        shipping_total: number;
        tax_total: number;
        total: number;
        currency: string;
        created_at?: string;
        paid_at?: string;
        shipped_at?: string;
        billing: { name: string; tax_id?: string; email: string; phone?: string; address: string };
        shipping: { name: string; phone?: string; address: string };
        items: {
            id: number;
            product_name: string;
            product_sku: string;
            variant_name?: string;
            unit_price: number;
            quantity: number;
            total: number;
            image_url?: string | null;
        }[];
        has_invoice: boolean;
        invoice_number?: string;
        payment_url?: string | null;
    };
}>) {
    const isPaid = order.payment_status === 'paid';

    return (
        <AccountLayout>
            <Head title={`Encomenda ${order.order_number}`} />

            <div className="mb-6">
                <Link
                    href={route('account.orders.index')}
                    className="text-sm text-brand-600 underline"
                >
                    ← Voltar às encomendas
                </Link>
            </div>

            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-semibold">
                        {order.order_number}
                    </h1>
                    <p className="mt-1 text-sm text-brand-600">
                        {formatDate(order.created_at)}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <OrderStatusBadges order={order} />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <section className="card">
                        <h2 className="font-display mb-4 text-lg font-semibold">
                            Artigos
                        </h2>
                        <div className="divide-y divide-brand-100">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4 py-4 first:pt-0 last:pb-0"
                                >
                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-brand-200 bg-brand-50">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xs text-brand-400">
                                                —
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex min-w-0 flex-1 justify-between gap-4">
                                        <div>
                                            <p className="font-medium">
                                                {item.product_name}
                                            </p>
                                            <p className="text-sm text-brand-600">
                                                SKU {item.product_sku}
                                                {item.variant_name &&
                                                    ` · ${item.variant_name}`}
                                            </p>
                                            <p className="text-sm text-brand-600">
                                                {item.quantity} ×{' '}
                                                {formatMoney(
                                                    item.unit_price,
                                                    order.currency,
                                                )}
                                            </p>
                                        </div>
                                        <p className="font-medium">
                                            {formatMoney(
                                                item.total,
                                                order.currency,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <section className="card">
                            <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-brand-500">
                                Faturação
                            </h3>
                            <p className="font-medium">{order.billing.name}</p>
                            {order.billing.tax_id && (
                                <p className="text-sm">NIF {order.billing.tax_id}</p>
                            )}
                            <p className="text-sm text-brand-700">
                                {order.billing.address}
                            </p>
                            <p className="text-sm text-brand-600">
                                {order.billing.email}
                            </p>
                        </section>
                        <section className="card">
                            <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-brand-500">
                                Envio
                            </h3>
                            <p className="font-medium">{order.shipping.name}</p>
                            <p className="text-sm text-brand-700">
                                {order.shipping.address}
                            </p>
                        </section>
                    </div>
                </div>

                <aside className="space-y-4">
                    <section className="card">
                        <h2 className="font-display mb-4 text-lg font-semibold">
                            Resumo
                        </h2>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-brand-600">
                                    Subtotal (sem IVA)
                                </dt>
                                <dd>
                                    {formatMoney(order.subtotal, order.currency)}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-brand-600">IVA</dt>
                                <dd>
                                    {formatMoney(order.tax_total, order.currency)}
                                </dd>
                            </div>
                            {order.discount_total > 0 && (
                                <div className="flex justify-between">
                                    <dt className="text-brand-600">Desconto</dt>
                                    <dd>
                                        −
                                        {formatMoney(
                                            order.discount_total,
                                            order.currency,
                                        )}
                                    </dd>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <dt className="text-brand-600">Envio</dt>
                                <dd>
                                    {formatMoney(
                                        order.shipping_total,
                                        order.currency,
                                    )}
                                </dd>
                            </div>
                            <div className="flex justify-between border-t border-brand-200 pt-2 text-base font-medium">
                                <dt>{isPaid ? 'Total pago' : 'Total'}</dt>
                                <dd>
                                    {formatMoney(order.total, order.currency)}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    {order.payment_url && (
                        <a
                            href={order.payment_url}
                            className="btn-primary w-full text-center"
                        >
                            Concluir pagamento
                        </a>
                    )}

                    {order.has_invoice && (
                        <a
                            href={route('account.orders.invoice', order.id)}
                            className="btn-secondary w-full"
                        >
                            Descarregar fatura
                        </a>
                    )}
                </aside>
            </div>
        </AccountLayout>
    );
}
