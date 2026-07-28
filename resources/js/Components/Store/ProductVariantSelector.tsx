import { formatMoney } from '@/lib/money';
import { StoreProduct } from '@/types';
import { useEffect, useMemo, useState } from 'react';

type Variant = NonNullable<StoreProduct['variants']>[number];

const OPTION_LABELS: Record<string, string> = {
    cor: 'Cor',
    pack: 'Pack',
};

function optionLabel(key: string): string {
    return OPTION_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

export default function ProductVariantSelector({
    variants,
    selectedId,
    onSelect,
    showPrices,
    currency = 'EUR',
}: {
    variants: Variant[];
    selectedId: number | null;
    onSelect: (id: number | null) => void;
    showPrices: boolean;
    currency?: string;
}) {
    const optionKeys = useMemo(() => {
        const keys = new Set<string>();
        variants.forEach((variant) => {
            Object.keys(variant.options ?? {}).forEach((key) => keys.add(key));
        });
        return Array.from(keys);
    }, [variants]);

    const selectedVariant = variants.find((v) => v.id === selectedId) ?? null;

    const [selections, setSelections] = useState<Record<string, string>>(
        () => selectedVariant?.options ?? variants[0]?.options ?? {},
    );

    useEffect(() => {
        if (selectedVariant?.options) {
            setSelections(selectedVariant.options);
        }
    }, [selectedId, selectedVariant?.options]);

    const findVariantForOptions = (options: Record<string, string>) => {
        if (optionKeys.some((key) => !options[key])) {
            return null;
        }

        return (
            variants.find((variant) => {
                const variantOptions = variant.options ?? {};
                return optionKeys.every((key) => variantOptions[key] === options[key]);
            }) ?? null
        );
    };

    const selectOption = (key: string, value: string) => {
        const nextOptions = { ...selections, [key]: value };
        setSelections(nextOptions);
        const match = findVariantForOptions(nextOptions);
        onSelect(match?.id ?? null);
    };

    if (optionKeys.length > 0) {
        return (
            <div className="space-y-4">
                {optionKeys.map((key) => {
                    const values = Array.from(
                        new Set(
                            variants
                                .map((v) => v.options?.[key])
                                .filter((v): v is string => !!v),
                        ),
                    );

                    return (
                        <div key={key}>
                            <p className="text-sm font-medium text-brand-800">
                                {optionLabel(key)}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {values.map((value) => {
                                    const isSelected = selections[key] === value;
                                    const candidateOptions = {
                                        ...selections,
                                        [key]: value,
                                    };
                                    const candidate = findVariantForOptions(candidateOptions);
                                    const partialMatch = variants.some(
                                        (variant) => variant.options?.[key] === value,
                                    );
                                    const inStock = candidate?.is_in_stock ?? false;

                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            disabled={!partialMatch}
                                            onClick={() => selectOption(key, value)}
                                            className={`rounded-lg border px-3 py-2 text-sm transition ${
                                                isSelected
                                                    ? 'border-brand-900 bg-brand-900 text-white'
                                                    : inStock
                                                      ? 'border-brand-300 bg-white text-brand-800 hover:border-brand-500'
                                                      : 'border-brand-200 bg-brand-50 text-brand-400 line-through'
                                            }`}
                                        >
                                            {value}
                                            {!inStock && candidate ? ' (esgotado)' : ''}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {selectedVariant && (
                    <p className="text-sm text-brand-500">
                        Selecionado: {selectedVariant.name}
                        {showPrices &&
                            selectedVariant.current_price !== null &&
                            ` · ${formatMoney(selectedVariant.current_price, currency)} sem IVA`}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div>
            <label className="text-sm font-medium text-brand-800">Variante</label>
            <select
                value={selectedId ?? ''}
                onChange={(e) =>
                    onSelect(e.target.value ? Number(e.target.value) : null)
                }
                className="input-field mt-1.5"
                required
            >
                {variants.map((variant) => (
                    <option
                        key={variant.id}
                        value={variant.id}
                        disabled={!variant.is_in_stock}
                    >
                        {variant.name}
                        {showPrices &&
                        variant.current_price !== null
                            ? ` — ${formatMoney(variant.current_price, currency)}`
                            : ''}
                        {!variant.is_in_stock ? ' (esgotado)' : ''}
                    </option>
                ))}
            </select>
        </div>
    );
}
