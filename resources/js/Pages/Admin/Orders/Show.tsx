import OrderStatusBadge from '@/Components/OrderStatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatMoney } from '@/lib/money';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function OrderShow({
    order,
    statuses,
}: {
    statuses: { value: string; label: string }[];
    order: {
        id: number;
        order_number: string;
        status: string;
        status_label: string;
        payment_status_label: string;
        stripe_payment_intent_id: string | null;
        stripe_checkout_session_id: string | null;
        stripe_charge_id: string | null;
        stripe_dashboard_url: string | null;
        payment_url: string | null;
        subtotal: number;
        discount_total: number;
        shipping_total: number;
        tax_total: number;
        total: number;
        currency: string;
        billing: { name: string; tax_id?: string; email: string; phone?: string };
        items: {
            product_name: string;
            product_sku: string;
            variant_name?: string;
            quantity: number;
            unit_price: number;
            total: number;
        }[];
    };
}) {
    const [copied, setCopied] = useState(false);

    const copyPaymentUrl = async () => {
        if (!order.payment_url) return;

        try {
            await navigator.clipboard.writeText(order.payment_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback silencioso
        }
    };

    return (
        <AdminLayout title={`Encomenda ${order.order_number}`}>
            <Head title={`Encomenda ${order.order_number}`} />

            <Link
                href={route('admin.orders.index')}
                className="text-sm text-brand-600 underline"
            >
                ← Voltar às encomendas
            </Link>

            <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-semibold">
                        {order.order_number}
                    </h1>
                    <div className="mt-2 flex gap-2">
                        <OrderStatusBadge
                            status={order.status}
                            label={order.status_label}
                        />
                        <span className="rounded-sm border border-brand-200 px-2 py-0.5 text-xs">
                            {order.payment_status_label}
                        </span>
                    </div>
                </div>
                <select
                    value={order.status}
                    onChange={(e) =>
                        router.patch(route('admin.orders.status', order.id), {
                            status: e.target.value,
                        })
                    }
                    className="input-field"
                >
                    {statuses.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    {order.items.map((item, i) => (
                        <div
                            key={i}
                            className="flex justify-between rounded-lg border border-brand-200 bg-white p-4"
                        >
                            <div>
                                <p className="font-medium">{item.product_name}</p>
                                <p className="text-sm text-brand-500">
                                    {item.product_sku}
                                    {item.variant_name && ` · ${item.variant_name}`}
                                </p>
                            </div>
                            <p className="font-medium">
                                {item.quantity} ×{' '}
                                {formatMoney(item.unit_price, order.currency)}
                            </p>
                        </div>
                    ))}
                </div>

                <aside className="space-y-4">
                    <div className="rounded-lg border border-brand-200 bg-white p-5">
                        <h2 className="font-medium">Resumo</h2>
                    <dl className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt>Subtotal (sem IVA)</dt>
                            <dd>{formatMoney(order.subtotal, order.currency)}</dd>
                        </div>
                            <div className="flex justify-between">
                                <dt>IVA</dt>
                                <dd>
                                    {formatMoney(order.tax_total, order.currency)}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Desconto</dt>
                                <dd>
                                    −{formatMoney(order.discount_total, order.currency)}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Envio</dt>
                                <dd>
                                    {formatMoney(order.shipping_total, order.currency)}
                                </dd>
                            </div>
                            <div className="flex justify-between border-t border-brand-200 pt-2 font-medium">
                                <dt>Total</dt>
                                <dd>{formatMoney(order.total, order.currency)}</dd>
                            </div>
                        </dl>
                    </div>

                    {(order.payment_url || order.stripe_dashboard_url) && (
                        <div className="rounded-lg border border-brand-200 bg-white p-5">
                            <h2 className="font-medium">Pagamento</h2>

                            {order.payment_url && (
                                <div className="mt-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
                                        Link para o cliente
                                    </p>
                                    <p className="mt-1 text-sm text-brand-600">
                                        Envie este link para o cliente concluir o
                                        pagamento.
                                    </p>
                                    <div className="mt-3 flex flex-col gap-2">
                                        <a
                                            href={order.payment_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="break-all text-sm font-medium text-brand-900 underline"
                                        >
                                            {order.payment_url}
                                        </a>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={copyPaymentUrl}
                                                className="rounded-md border border-brand-300 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
                                            >
                                                {copied
                                                    ? 'Copiado!'
                                                    : 'Copiar link'}
                                            </button>
                                            <a
                                                href={order.payment_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="rounded-md bg-brand-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-800"
                                            >
                                                Abrir pagamento
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {order.stripe_dashboard_url && (
                                <div
                                    className={
                                        order.payment_url
                                            ? 'mt-5 border-t border-brand-200 pt-5'
                                            : 'mt-4'
                                    }
                                >
                                    <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
                                        Stripe
                                    </p>
                                    <a
                                        href={order.stripe_dashboard_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-900 underline"
                                    >
                                        Ver pagamento no Stripe
                                        <span aria-hidden>↗</span>
                                    </a>
                                    {(order.stripe_checkout_session_id ||
                                        order.stripe_payment_intent_id) && (
                                        <p className="mt-2 break-all text-xs text-brand-500">
                                            {order.stripe_checkout_session_id ??
                                                order.stripe_payment_intent_id}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </aside>
            </div>
        </AdminLayout>
    );
}
