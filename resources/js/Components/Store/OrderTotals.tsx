import { formatMoney } from '@/lib/money';

export type ShippingMode = 'free' | 'quoted_later';

export default function OrderTotals({
    subtotal,
    shipping,
    total,
    currency,
    vatRate,
    taxTotal,
    shippingMode = 'quoted_later',
    shippingLabel,
    shippingMessage = null,
    amountUntilFreeShipping = null,
    shippingFreeThreshold = null,
}: {
    subtotal: number;
    shipping: number;
    total: number;
    currency: string;
    vatRate: number;
    taxTotal: number;
    shippingMode?: ShippingMode;
    shippingLabel?: string;
    shippingMessage?: string | null;
    amountUntilFreeShipping?: number | null;
    shippingFreeThreshold?: number | null;
}) {
    const envioLabel =
        shippingLabel ??
        (shippingMode === 'free' ? 'Grátis' : 'A calcular');

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

            <div className="flex justify-between gap-4">
                <dt className="text-brand-500">Envio</dt>
                <dd
                    className={
                        shippingMode === 'free'
                            ? 'font-medium text-green-700'
                            : 'text-right text-brand-700'
                    }
                >
                    {envioLabel}
                </dd>
            </div>

            {shippingMode === 'quoted_later' && shippingMessage && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
                    {shippingMessage}
                </p>
            )}

            {shippingMode === 'quoted_later' &&
                amountUntilFreeShipping !== null &&
                amountUntilFreeShipping > 0 &&
                shippingFreeThreshold !== null && (
                    <p className="text-xs text-brand-500">
                        Portes grátis em encomendas a partir de{' '}
                        {formatMoney(shippingFreeThreshold, currency)} (sem IVA).
                        Faltam{' '}
                        {formatMoney(amountUntilFreeShipping, currency)}.
                    </p>
                )}

            <div className="flex justify-between border-t border-brand-200 pt-3 text-base font-semibold text-brand-900">
                <dt>
                    {shippingMode === 'quoted_later'
                        ? 'Total a pagar agora'
                        : 'Total a pagar'}
                </dt>
                <dd>{formatMoney(total, currency)}</dd>
            </div>

            {shippingMode === 'quoted_later' && (
                <p className="text-xs text-brand-500">
                    O total não inclui transporte. Receberá o valor por email antes
                    do envio.
                </p>
            )}

            <p className="text-xs text-brand-500">
                O IVA é calculado automaticamente com base na taxa configurada na
                loja.
            </p>
        </dl>
    );
}
