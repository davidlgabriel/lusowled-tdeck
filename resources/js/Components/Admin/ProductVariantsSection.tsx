import { formatMoney } from '@/lib/money';
import { router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

export type ProductVariantForm = {
    id: number;
    name: string;
    sku: string;
    option_cor: string;
    option_pack: string;
    price: number | '';
    stock_quantity: number;
    sort_order: number;
    is_active: boolean;
};

const emptyVariant = (): Omit<ProductVariantForm, 'id'> => ({
    name: '',
    sku: '',
    option_cor: '',
    option_pack: '',
    price: '',
    stock_quantity: 0,
    sort_order: 0,
    is_active: true,
});

function VariantFormFields({
    data,
    setData,
    errors,
    prefix,
}: {
    data: Omit<ProductVariantForm, 'id'>;
    setData: (key: string, value: string | number | boolean) => void;
    errors: Record<string, string>;
    prefix?: string;
}) {
    const field = (name: string) => (prefix ? `${prefix}.${name}` : name);

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
                <label className="text-sm font-medium">Nome da variante</label>
                <input
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Ex.: Castanho — Pack 5 m²"
                    className="input-field mt-1.5"
                />
                {errors[field('name')] && (
                    <p className="mt-1 text-sm text-red-600">{errors[field('name')]}</p>
                )}
            </div>
            <div>
                <label className="text-sm font-medium">SKU</label>
                <input
                    value={data.sku}
                    onChange={(e) => setData('sku', e.target.value)}
                    className="input-field mt-1.5"
                />
                {errors[field('sku')] && (
                    <p className="mt-1 text-sm text-red-600">{errors[field('sku')]}</p>
                )}
            </div>
            <div>
                <label className="text-sm font-medium">Preço (sem IVA)</label>
                <input
                    type="number"
                    step="0.01"
                    value={data.price}
                    onChange={(e) =>
                        setData('price', e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="Usa preço do produto se vazio"
                    className="input-field mt-1.5"
                />
                {errors[field('price')] && (
                    <p className="mt-1 text-sm text-red-600">{errors[field('price')]}</p>
                )}
            </div>
            <div>
                <label className="text-sm font-medium">Cor</label>
                <input
                    value={data.option_cor}
                    onChange={(e) => setData('option_cor', e.target.value)}
                    placeholder="Ex.: Castanho"
                    className="input-field mt-1.5"
                />
            </div>
            <div>
                <label className="text-sm font-medium">Pack / tamanho</label>
                <input
                    value={data.option_pack}
                    onChange={(e) => setData('option_pack', e.target.value)}
                    placeholder="Ex.: 5 m², Pack 10 un."
                    className="input-field mt-1.5"
                />
            </div>
            <div>
                <label className="text-sm font-medium">Stock</label>
                <input
                    type="number"
                    min={0}
                    value={data.stock_quantity}
                    onChange={(e) =>
                        setData('stock_quantity', Number(e.target.value))
                    }
                    className="input-field mt-1.5"
                />
                {errors[field('stock_quantity')] && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors[field('stock_quantity')]}
                    </p>
                )}
            </div>
            <div>
                <label className="text-sm font-medium">Ordem</label>
                <input
                    type="number"
                    min={0}
                    value={data.sort_order}
                    onChange={(e) => setData('sort_order', Number(e.target.value))}
                    className="input-field mt-1.5"
                />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                    type="checkbox"
                    checked={data.is_active}
                    onChange={(e) => setData('is_active', e.target.checked)}
                />
                Variante ativa
            </label>
        </div>
    );
}

function VariantRow({
    productId,
    variant,
}: {
    productId: number;
    variant: ProductVariantForm;
}) {
    const [editing, setEditing] = useState(false);
    const { data, setData, patch, processing, errors, reset } = useForm({
        name: variant.name,
        sku: variant.sku,
        option_cor: variant.option_cor,
        option_pack: variant.option_pack,
        price: variant.price,
        stock_quantity: variant.stock_quantity,
        sort_order: variant.sort_order,
        is_active: variant.is_active,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(route('admin.products.variants.update', [productId, variant.id]), {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    };

    const remove = () => {
        if (!confirm(`Eliminar variante «${variant.name}»?`)) return;
        router.delete(
            route('admin.products.variants.destroy', [productId, variant.id]),
            { preserveScroll: true },
        );
    };

    const optionsLabel = [
        variant.option_cor && `Cor: ${variant.option_cor}`,
        variant.option_pack && `Pack: ${variant.option_pack}`,
    ]
        .filter(Boolean)
        .join(' · ');

    if (editing) {
        return (
            <form
                onSubmit={submit}
                className="rounded-lg border border-brand-200 bg-brand-50/50 p-4"
            >
                <VariantFormFields
                    data={data}
                    setData={(key, value) => setData(key as keyof typeof data, value as never)}
                    errors={errors}
                />
                <div className="mt-4 flex flex-wrap gap-2">
                    <button type="submit" disabled={processing} className="btn-primary text-sm">
                        Guardar variante
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            reset();
                            setEditing(false);
                        }}
                        className="text-sm text-brand-600 underline"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-brand-200 p-4">
            <div>
                <p className="font-medium text-brand-900">{variant.name}</p>
                <p className="mt-1 text-sm text-brand-500">
                    SKU {variant.sku}
                    {optionsLabel ? ` · ${optionsLabel}` : ''}
                </p>
                <p className="mt-1 text-sm text-brand-600">
                    {variant.price !== ''
                        ? `${formatMoney(Number(variant.price))} sem IVA`
                        : 'Preço do produto'}
                    {' · '}
                    Stock: {variant.stock_quantity}
                    {!variant.is_active && ' · Inativa'}
                </p>
            </div>
            <div className="flex gap-3 text-sm">
                <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-brand-700 underline"
                >
                    Editar
                </button>
                <button
                    type="button"
                    onClick={remove}
                    className="text-red-600 underline"
                >
                    Eliminar
                </button>
            </div>
        </div>
    );
}

export default function ProductVariantsSection({
    productId,
    variants,
}: {
    productId: number;
    variants: ProductVariantForm[];
}) {
    const { data, setData, post, processing, errors, reset } = useForm(emptyVariant());

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.products.variants.store', productId), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <section className="card space-y-4">
            <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900">
                    Variantes (cores, packs, etc.)
                </h2>
                <p className="mt-2 text-sm text-brand-500">
                    Adicione combinações com preço e stock próprios. O stock do
                    produto base é ignorado quando existem variantes ativas.
                </p>
            </div>

            {variants.length > 0 ? (
                <div className="space-y-3">
                    {variants.map((variant) => (
                        <VariantRow
                            key={variant.id}
                            productId={productId}
                            variant={variant}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-brand-500">
                    Ainda não há variantes. O produto usa o preço e stock definidos
                    acima.
                </p>
            )}

            <form
                onSubmit={submit}
                className="space-y-4 border-t border-brand-200 pt-4"
            >
                <h3 className="text-sm font-semibold text-brand-800">
                    Nova variante
                </h3>
                <VariantFormFields
                    data={data}
                    setData={(key, value) => setData(key as keyof typeof data, value as never)}
                    errors={errors}
                />
                <button type="submit" disabled={processing} className="btn-primary text-sm">
                    Adicionar variante
                </button>
            </form>
        </section>
    );
}
