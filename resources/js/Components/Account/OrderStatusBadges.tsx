import OrderStatusBadge from '@/Components/OrderStatusBadge';

export interface OrderStatusFields {
    status: string;
    status_label: string;
    payment_status: string;
    payment_status_label: string;
}

export default function OrderStatusBadges({ order }: { order: OrderStatusFields }) {
    if (order.payment_status === 'pending') {
        return (
            <OrderStatusBadge status="pending" label="Aguarda pagamento" />
        );
    }

    if (order.payment_status === 'failed') {
        return (
            <OrderStatusBadge
                status="failed"
                label={order.payment_status_label}
            />
        );
    }

    if (
        order.payment_status === 'refunded' ||
        order.payment_status === 'partially_refunded'
    ) {
        return (
            <>
                <OrderStatusBadge
                    status={order.status}
                    label={order.status_label}
                />
                <OrderStatusBadge
                    status={order.payment_status}
                    label={order.payment_status_label}
                />
            </>
        );
    }

    return (
        <OrderStatusBadge status={order.status} label={order.status_label} />
    );
}
