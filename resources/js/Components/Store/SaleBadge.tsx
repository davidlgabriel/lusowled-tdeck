import { PercentIcon } from '@/Components/Store/StoreIcons';

export default function SaleBadge({
    basePrice,
    salePrice,
}: {
    basePrice: number;
    salePrice: number | null;
}) {
    const discount =
        salePrice !== null && salePrice < basePrice
            ? Math.round((1 - salePrice / basePrice) * 100)
            : null;

    return (
        <span
            className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-brand-900 px-2.5 py-1.5 text-white shadow-sm"
            title={discount ? `-${discount}%` : 'Promoção'}
        >
            <PercentIcon className="h-3.5 w-3.5" />
            {discount !== null && discount > 0 && (
                <span className="text-[10px] font-bold leading-none">
                    -{discount}%
                </span>
            )}
        </span>
    );
}
