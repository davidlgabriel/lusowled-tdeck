import { formatMoney } from '@/lib/money';

export default function OrderTotals({
    subtotal,
    shipping,
    total,
    currency,
    vatRate,
    taxTotal,
}: {
    subtotal: number;
    shipping: number;
    total: number;
    currency: string;
    vatRate: number;
    taxTotal: number;
}) {
    return (
        <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
                <dt className="text-brand-500">Subtotal (sem IVA)</dt>
                <dd className="font-medium">
                    {formatMoney(subtotal, currency)}
                </dd>
            </div>

            <div className="flex justify-between">
                <dt className="text-brand-500">IVA ({vatRate}%)</dt>
                <dd>{formatMoney(taxTotal, currency)}</dd>
            </div>

            <div className="flex justify-between">
                <dt className="text-brand-500">Envio</dt>
                <dd>{formatMoney(shipping, currency)}</dd>
            </div>

            <div className="flex justify-between border-t border-brand-200 pt-3 text-base font-semibold text-brand-900">
                <dt>Total a pagar</dt>
                <dd>{formatMoney(total, currency)}</dd>
            </div>

            <p className="text-xs text-brand-500">
                O IVA é calculado automaticamente com base na taxa configurada na
                loja.
            </p>
        </dl>
    );
}
