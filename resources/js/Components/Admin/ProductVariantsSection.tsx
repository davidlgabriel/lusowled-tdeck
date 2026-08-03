import { formatMoney } from '@/lib/money';
import { router, useForm, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

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

type VariantFormData = Omit<ProductVariantForm, 'id'>;

const emptyVariant = (): VariantFormData => ({
    name: '',
    sku: '',
    option_cor: '',
    option_pack: '',
    price: '',
    stock_quantity: 0,
    sort_order: 0,
    is_active: true,
});

function slugSku(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 36);
}

export function suggestVariantSku(productSku: string, name: string): string {
    const suffix = slugSku(name);
    if (!suffix) {
        return productSku.slice(0, 50);
    }
    const base = productSku.trim().toUpperCase();
    const combined = `${base}-${suffix}`;
    return combined.slice(0, 50);
}

function RequiredLabel({
    children,
    optional,
}: {
    children: ReactNode;
    optional?: boolean;
}) {
    return (
        <label className="text-sm font-medium text-brand-900">
            {children}
            {optional ? (
                <span className="ml-1 font-normal text-brand-400">(opcional)</span>
            ) : (
                <span className="ml-0.5 text-red-600" aria-hidden="true">
                    *
                </span>
            )}
        </label>
    );
}

function VariantFormFields({
    data,
    setData,
    errors,
    productSku,
    skuIsManual,
    onSkuManualChange,
    prefix,
}: {
    data: VariantFormData;
    setData: (key: keyof VariantFormData, value: string | number | boolean) => void;
    errors: Record<string, string>;
    productSku: string;
    skuIsManual: boolean;
    onSkuManualChange: (manual: boolean) => void;
    prefix?: string;
}) {
    const field = (name: string) => (prefix ? `${prefix}.${name}` : name);

    const handleNameChange = (name: string) => {
        setData('name', name);
        if (!skuIsManual) {
            setData('sku', suggestVariantSku(productSku, name));
        }
    };

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <p className="text-xs text-brand-500 sm:col-span-2">
                Campos com <span className="text-red-600">*</span> são obrigatórios.
            </p>

            <div className="sm:col-span-2">
                <RequiredLabel>Nome da variante</RequiredLabel>
                <input
                    value={data.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex.: Castanho — Pack 5 m²"
                    className="input-field mt-1.5"
                    required
                />
                {errors[field('name')] && (
                    <p className="mt-1 text-sm text-red-600">{errors[field('name')]}</p>
                )}
            </div>

            <div className="sm:col-span-2">
                <RequiredLabel>SKU</RequiredLabel>
                <input
                    value={data.sku}
                    onChange={(e) => {
                        onSkuManualChange(true);
                        setData('sku', e.target.value.toUpperCase());
                    }}
                    placeholder="Gerado automaticamente ao escrever o nome"
                    className="input-field mt-1.5 font-mono text-sm"
                    required
                />
                {!skuIsManual && data.name && (
                    <p className="mt-1 text-xs text-brand-500">
                        SKU sugerido automaticamente. Pode editar se precisar de um
                        código diferente.
                    </p>
                )}
                {skuIsManual && (
                    <p className="mt-1 text-xs text-amber-800">
                        Alterou o SKU manualmente — confirme que é único em todo o
                        catálogo.
                        {data.name && (
                            <button
                                type="button"
                                className="ml-1 underline"
                                onClick={() => {
                                    onSkuManualChange(false);
                                    setData('sku', suggestVariantSku(productSku, data.name));
                                }}
                            >
                                Regerar a partir do nome
                            </button>
                        )}
                    </p>
                )}
                {errors[field('sku')] && (
                    <p className="mt-1 text-sm text-red-600">{errors[field('sku')]}</p>
                )}
            </div>

            <div>
                <RequiredLabel optional>Preço (sem IVA)</RequiredLabel>
                <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={data.price}
                    onChange={(e) =>
                        setData('price', e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="Preço do produto se vazio"
                    className="input-field mt-1.5"
                />
                {errors[field('price')] && (
                    <p className="mt-1 text-sm text-red-600">{errors[field('price')]}</p>
                )}
            </div>

            <div>
                <RequiredLabel>Stock</RequiredLabel>
                <input
                    type="number"
                    min={0}
                    value={data.stock_quantity}
                    onChange={(e) =>
                        setData('stock_quantity', Number(e.target.value))
                    }
                    className="input-field mt-1.5"
                    required
                />
                {errors[field('stock_quantity')] && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors[field('stock_quantity')]}
                    </p>
                )}
            </div>

            <div>
                <RequiredLabel optional>Cor</RequiredLabel>
                <input
                    value={data.option_cor}
                    onChange={(e) => setData('option_cor', e.target.value)}
                    placeholder="Ex.: Castanho"
                    className="input-field mt-1.5"
                />
            </div>

            <div>
                <RequiredLabel optional>Pack / tamanho</RequiredLabel>
                <input
                    value={data.option_pack}
                    onChange={(e) => setData('option_pack', e.target.value)}
                    placeholder="Ex.: 5 m², Pack 10 un."
                    className="input-field mt-1.5"
                />
            </div>

            <div>
                <RequiredLabel optional>Ordem na lista</RequiredLabel>
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
                Variante ativa (visível na loja)
            </label>
        </div>
    );
}

function VariantDrawer({
    open,
    title,
    onClose,
    children,
    footer,
}: {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
    footer: React.ReactNode;
}) {
    useEffect(() => {
        if (!open) {
            return;
        }
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-[80]">
            <button
                type="button"
                className="absolute inset-0 bg-brand-950/40 backdrop-blur-[2px]"
                onClick={onClose}
                aria-label="Fechar"
            />
            <aside
                className="absolute bottom-0 right-0 top-0 flex w-full max-w-lg flex-col bg-white shadow-2xl animate-slideInRight"
                role="dialog"
                aria-modal="true"
                aria-labelledby="variant-drawer-title"
            >
                <div className="flex items-start justify-between border-b border-brand-200 px-6 py-5">
                    <div>
                        <h2
                            id="variant-drawer-title"
                            className="text-lg font-semibold text-brand-900"
                        >
                            {title}
                        </h2>
                        <p className="mt-1 text-sm text-brand-500">
                            Preencha os campos obrigatórios e guarde.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="icon-btn shrink-0"
                        aria-label="Fechar painel"
                    >
                        ✕
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
                <div className="border-t border-brand-200 bg-brand-50/80 px-6 py-4">
                    {footer}
                </div>
            </aside>
        </div>,
        document.body,
    );
}

function VariantRow({
    productId,
    variant,
    onEdit,
}: {
    productId: number;
    variant: ProductVariantForm;
    onEdit: (variant: ProductVariantForm) => void;
}) {
    const remove = () => {
        if (!confirm(`Eliminar variante «${variant.name}»?`)) {
            return;
        }
        router.delete(
            route('admin.products.variants.destroy', [productId, variant.id]),
            { preserveScroll: true, only: ['product', 'flash'] },
        );
    };

    const optionsLabel = [
        variant.option_cor && `Cor: ${variant.option_cor}`,
        variant.option_pack && `Pack: ${variant.option_pack}`,
    ]
        .filter(Boolean)
        .join(' · ');

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
                    onClick={() => onEdit(variant)}
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
    productSku,
    variants,
}: {
    productId: number;
    productSku: string;
    variants: ProductVariantForm[];
}) {
    const pageErrors = (usePage().props.errors ?? {}) as Record<string, string>;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState<ProductVariantForm | null>(
        null,
    );
    const [skuIsManual, setSkuIsManual] = useState(false);

    const isEditing = editingVariant !== null;

    const { data, setData, post, patch, processing, errors, reset, clearErrors } =
        useForm(emptyVariant());

    const openCreateDrawer = () => {
        clearErrors();
        reset();
        setEditingVariant(null);
        setSkuIsManual(false);
        setDrawerOpen(true);
    };

    const openEditDrawer = (variant: ProductVariantForm) => {
        clearErrors();
        setEditingVariant(variant);
        setSkuIsManual(true);
        setData({
            name: variant.name,
            sku: variant.sku,
            option_cor: variant.option_cor,
            option_pack: variant.option_pack,
            price: variant.price,
            stock_quantity: variant.stock_quantity,
            sort_order: variant.sort_order,
            is_active: variant.is_active,
        });
        setDrawerOpen(true);
    };

    const closeDrawer = useCallback(() => {
        setDrawerOpen(false);
        setEditingVariant(null);
        setSkuIsManual(false);
        clearErrors();
        reset();
    }, [clearErrors, reset]);

    useEffect(() => {
        const variantFieldErrors = ['name', 'sku', 'stock_quantity', 'price'].some(
            (key) => pageErrors[key],
        );
        if (variantFieldErrors) {
            setDrawerOpen(true);
        }
    }, [pageErrors]);

    const setField = useCallback(
        (key: keyof VariantFormData, value: string | number | boolean) => {
            setData(key, value as never);
        },
        [setData],
    );

    const submitVariant = () => {
        const reloadProps = { preserveScroll: true, only: ['product', 'flash'] as string[] };

        if (isEditing && editingVariant) {
            patch(
                route('admin.products.variants.update', [productId, editingVariant.id]),
                {
                    ...reloadProps,
                    onSuccess: () => closeDrawer(),
                },
            );
            return;
        }

        post(route('admin.products.variants.store', productId), {
            ...reloadProps,
            onSuccess: () => closeDrawer(),
        });
    };

    const formErrors = { ...pageErrors, ...errors };

    return (
        <>
            <section className="card space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900">
                            Variantes (cores, packs, etc.)
                        </h2>
                        <p className="mt-2 max-w-xl text-sm text-brand-500">
                            Opcional: use variantes se o produto tiver cores, packs ou
                            preços diferentes. O stock do produto base deixa de contar
                            na loja.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateDrawer}
                        className="btn-primary shrink-0 text-sm"
                    >
                        + Adicionar variante
                    </button>
                </div>

                {variants.length > 0 ? (
                    <div className="space-y-3">
                        {variants.map((variant) => (
                            <VariantRow
                                key={variant.id}
                                productId={productId}
                                variant={variant}
                                onEdit={openEditDrawer}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="rounded-lg border border-dashed border-brand-200 bg-brand-50/50 px-4 py-6 text-center text-sm text-brand-500">
                        Ainda não há variantes. Clique em «Adicionar variante» para
                        criar a primeira opção (ex.: cor ou pack).
                    </p>
                )}
            </section>

            <VariantDrawer
                open={drawerOpen}
                title={isEditing ? 'Editar variante' : 'Nova variante'}
                onClose={closeDrawer}
                footer={
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={submitVariant}
                            disabled={processing}
                            className="btn-primary"
                        >
                            {processing
                                ? 'A guardar…'
                                : isEditing
                                  ? 'Guardar alterações'
                                  : 'Adicionar variante'}
                        </button>
                        <button
                            type="button"
                            onClick={closeDrawer}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                    </div>
                }
            >
                <div role="group" aria-labelledby="variant-drawer-title">
                    <VariantFormFields
                        data={data}
                        setData={setField}
                        errors={formErrors}
                        productSku={productSku}
                        skuIsManual={skuIsManual}
                        onSkuManualChange={setSkuIsManual}
                    />
                </div>
            </VariantDrawer>
        </>
    );
}
