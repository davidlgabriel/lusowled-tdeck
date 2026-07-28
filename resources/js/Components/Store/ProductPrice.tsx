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
        | 'current_price'
        | 'base_price'
        | 'is_on_sale'
        | 'sale_price'
        | 'price_from'
        | 'price_to'
        | 'has_variable_pricing'
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

    if (!store.sales_enabled || product.current_price === null) {
        return null;
    }

    const displayPrice =
        product.has_variable_pricing &&
        product.price_from !== null &&
        product.price_from !== undefined
            ? product.price_from
            : product.current_price;

    const grossPrice = displayPrice * (1 + vatRate / 100);
    const showFromLabel =
        product.has_variable_pricing &&
        product.price_from !== null &&
        product.price_to !== null &&
        product.price_from !== product.price_to;

    return (
        <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${sizeClass}`}>
            {showFromLabel && (
                <span className="text-sm font-normal text-brand-500">desde</span>
            )}
            <span className="font-medium text-brand-900">
                {formatMoney(displayPrice, currency)}
            </span>
            {product.is_on_sale &&
                product.sale_price !== null &&
                product.base_price !== null && (
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
