import OrderStatusBadge from '@/Components/OrderStatusBadge';
import { OrderSummary } from '@/types';
import { Link } from '@inertiajs/react';

function formatMoney(amount: number, currency: string) {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency,
    }).format(amount);
}

function formatDate(iso?: string) {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(iso));
}

function OrderPreviewImages({
    images,
    overflow,
    itemsCount,
}: {
    images: string[];
    overflow: number;
    itemsCount: number;
}) {
    if (images.length === 0) {
        return (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 text-xs text-brand-500">
                {itemsCount} art.
            </div>
        );
    }

    if (images.length === 1) {
        return (
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-brand-200 bg-brand-50">
                <img
                    src={images[0]}
                    alt=""
                    className="h-full w-full object-cover"
                />
            </div>
        );
    }

    return (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-brand-200 bg-brand-50">
            <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-px bg-brand-200">
                {images.slice(0, 3).map((image, index) => (
                    <img
                        key={image}
                        src={image}
                        alt=""
                        className={`h-full w-full object-cover ${
                            index === 0 && images.length === 2
                                ? 'col-span-2'
                                : ''
                        }`}
                    />
                ))}
            </div>
            {overflow > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-brand-900/45 text-sm font-semibold text-white">
                    +{overflow}
                </div>
            )}
        </div>
    );
}

export default function OrderCard({
    order,
    href,
}: {
    order: OrderSummary;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="group block rounded-xl border border-brand-200 bg-white p-4 shadow-card transition hover:border-brand-400 hover:shadow-md"
        >
            <div className="flex items-center gap-4">
                <OrderPreviewImages
                    images={order.preview_images ?? []}
                    overflow={order.preview_overflow ?? 0}
                    itemsCount={order.items_count}
                />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                            <p className="font-medium text-brand-900 group-hover:underline">
                                {order.order_number}
                            </p>
                            <p className="mt-1 text-sm text-brand-600">
                                {formatDate(order.created_at)} ·{' '}
                                {order.items_count}{' '}
                                {order.items_count === 1 ? 'artigo' : 'artigos'}
                            </p>
                        </div>
                        <p className="text-lg font-semibold text-brand-900">
                            {formatMoney(order.total, order.currency)}
                        </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <OrderStatusBadge
                            status={order.status}
                            label={order.status_label}
                        />
                        <OrderStatusBadge
                            status={order.payment_status}
                            label={order.payment_status_label}
                        />
                        {order.has_invoice && (
                            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                                Fatura disponível
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
