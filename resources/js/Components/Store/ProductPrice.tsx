import { formatMoney } from '@/lib/money';
import { StoreProduct } from '@/types';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function ProductPrice({
    product,
    currency = 'EUR',
    size = 'md',
}: {
    product: Pick<
        StoreProduct,
        'current_price' | 'base_price' | 'is_on_sale' | 'sale_price'
    >;
    currency?: string;
    size?: 'sm' | 'md' | 'lg';
}) {
    const { store } = usePage<PageProps>().props;
    const vatRate = store.vat_rate ?? 23;
    const sizeClass =
        size === 'lg'
            ? 'text-2xl'
            : size === 'sm'
              ? 'text-sm'
              : 'text-base';

    const grossPrice = product.current_price * (1 + vatRate / 100);

    return (
        <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${sizeClass}`}>
            <span className="font-medium text-brand-900">
                {formatMoney(product.current_price, currency)}
            </span>
            {product.is_on_sale && product.sale_price !== null && (
                <span className="text-brand-400 line-through">
                    {formatMoney(product.base_price, currency)}
                </span>
            )}
            <span className="w-full text-xs text-brand-500 sm:w-auto">
                sem IVA · {formatMoney(grossPrice, currency)} com IVA ({vatRate}%)
            </span>
        </div>
    );
}
