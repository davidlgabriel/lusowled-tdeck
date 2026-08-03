import Breadcrumbs from '@/Components/Store/Breadcrumbs';
import SalesDisabledNotice from '@/Components/Store/SalesDisabledNotice';
import ProductCard from '@/Components/Store/ProductCard';
import ProductImage from '@/Components/Store/ProductImage';
import ProductPrice from '@/Components/Store/ProductPrice';
import ProductVariantSelector from '@/Components/Store/ProductVariantSelector';
import SectionHeading from '@/Components/Store/SectionHeading';
import StoreLayout from '@/Layouts/StoreLayout';
import { formatMoney } from '@/lib/money';
import { PageProps, StoreProduct } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

function defaultVariantId(
    variants: NonNullable<StoreProduct['variants']>,
): number | null {
    const first = variants.find((v) => v.is_in_stock) ?? variants[0];
    return first?.id ?? null;
}

export default function ProductShow({
    product,
    relatedProducts,
}: PageProps<{
    product: StoreProduct;
    relatedProducts: StoreProduct[];
}>) {
    const { store } = usePage<PageProps>().props;
    const variants = product.variants ?? [];
    const hasVariantOptions = variants.length > 0;

    const images =
        product.images && product.images.length > 0
            ? product.images
            : [
                  {
                      id: 0,
                      url: product.image_url,
                      alt: product.name,
                      is_primary: true,
                  },
              ];

    const [activeImage, setActiveImage] = useState(0);
    const [variantId, setVariantId] = useState<number | null>(() =>
        hasVariantOptions ? defaultVariantId(variants) : null,
    );

    const selectedVariant = useMemo(
        () => variants.find((v) => v.id === variantId) ?? null,
        [variants, variantId],
    );

    const displayPrice = selectedVariant
        ? {
              current_price: selectedVariant.current_price,
              base_price:
                  selectedVariant.price !== null &&
                  selectedVariant.price !== undefined
                      ? selectedVariant.price
                      : product.base_price,
              sale_price: product.sale_price,
              is_on_sale: false,
              price_from: null,
              price_to: null,
              has_variable_pricing: false,
          }
        : product;

    const inStock = selectedVariant
        ? selectedVariant.is_in_stock
        : product.is_in_stock;

    const maxQty = selectedVariant
        ? selectedVariant.stock_quantity
        : product.stock_quantity;

    const { data, setData, post, processing, errors } = useForm({
        product_id: product.id,
        product_variant_id: variantId as number | null,
        quantity: 1,
    });

    useEffect(() => {
        setData('product_variant_id', variantId);
    }, [variantId, setData]);

    useEffect(() => {
        if (hasVariantOptions && variantId === null) {
            setVariantId(defaultVariantId(variants));
        }
    }, [hasVariantOptions, variantId, variants]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (hasVariantOptions && !variantId) {
            return;
        }
        post(route('cart.store'), { preserveScroll: true });
    };

    const canAddToCart =
        inStock && (!hasVariantOptions || variantId !== null);

    return (
        <StoreLayout>
            <Head title={product.name} />

            <div className="store-container pb-16">
                <Breadcrumbs
                    items={[
                        { label: 'Início', href: route('home') },
                        {
                            label: 'Produtos',
                            href: route('products.index'),
                        },
                        { label: product.name },
                    ]}
                />

                <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
                    <div className="lg:sticky lg:top-28 lg:self-start">
                        <div className="aspect-square overflow-hidden rounded-xl bg-brand-100">
                            <ProductImage
                                product={{
                                    name:
                                        images[activeImage]?.alt ?? product.name,
                                    image_url:
                                        images[activeImage]?.url ?? null,
                                }}
                                className="h-full w-full"
                            />
                        </div>
                        {images.length > 1 && (
                            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                                {images.map((img, index) => (
                                    <button
                                        key={img.id}
                                        type="button"
                                        onClick={() => setActiveImage(index)}
                                        className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                                            activeImage === index
                                                ? 'border-brand-900'
                                                : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <ProductImage
                                            product={{
                                                name: img.alt,
                                                image_url: img.url,
                                            }}
                                            className="h-full w-full"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        {product.categories?.[0] && (
                            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
                                {product.categories.map((c) => c.name).join(' · ')}
                            </p>
                        )}
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-900 md:text-4xl">
                            {product.name}
                        </h1>
                        <p className="mt-2 text-sm text-brand-500">
                            SKU{' '}
                            {selectedVariant?.sku ?? product.sku}
                        </p>

                        <div className="mt-6 border-b border-brand-200 pb-6">
                            <ProductPrice product={displayPrice} size="lg" />
                            <p
                                className={`mt-3 text-sm font-medium ${
                                    inStock
                                        ? 'text-green-700'
                                        : 'text-red-700'
                                }`}
                            >
                                {inStock
                                    ? maxQty <= 5
                                        ? `Últimas ${maxQty} unidades`
                                        : 'Em stock — pronto a enviar'
                                    : 'Indisponível'}
                            </p>
                        </div>

                        <form onSubmit={submit} className="mt-6 space-y-5">
                            {hasVariantOptions && (
                                <div className="rounded-lg border border-brand-200 bg-brand-50/50 p-4">
                                    <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-900">
                                        Escolha a opção
                                    </h2>
                                    <div className="mt-3">
                                        <ProductVariantSelector
                                            variants={variants}
                                            selectedId={variantId}
                                            onSelect={setVariantId}
                                            showPrices={store.sales_enabled}
                                        />
                                    </div>
                                    {selectedVariant && (
                                        <dl className="mt-4 grid gap-1 text-sm text-brand-600">
                                            <div className="flex gap-2">
                                                <dt className="text-brand-500">
                                                    Variante:
                                                </dt>
                                                <dd className="font-medium text-brand-900">
                                                    {selectedVariant.name}
                                                </dd>
                                            </div>
                                            {store.sales_enabled &&
                                                selectedVariant.current_price !==
                                                    null && (
                                                    <div className="flex gap-2">
                                                        <dt className="text-brand-500">
                                                            Preço:
                                                        </dt>
                                                        <dd>
                                                            {formatMoney(
                                                                selectedVariant.current_price,
                                                            )}{' '}
                                                            sem IVA
                                                        </dd>
                                                    </div>
                                                )}
                                        </dl>
                                    )}
                                </div>
                            )}

                            {errors.product_variant_id && (
                                <p className="text-sm text-red-700">
                                    {errors.product_variant_id}
                                </p>
                            )}

                            {store.sales_enabled ? (
                                <>
                                    <div className="flex flex-wrap items-end gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-brand-800">
                                                Quantidade
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={Math.max(maxQty, 1)}
                                                value={data.quantity}
                                                onChange={(e) =>
                                                    setData(
                                                        'quantity',
                                                        Number(e.target.value),
                                                    )
                                                }
                                                className="input-field mt-1.5 w-24"
                                                disabled={!canAddToCart}
                                            />
                                            {errors.quantity && (
                                                <p className="mt-1 text-sm text-red-700">
                                                    {errors.quantity}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={
                                            processing || !canAddToCart
                                        }
                                        className="btn-primary w-full sm:w-auto sm:min-w-[280px]"
                                    >
                                        {!hasVariantOptions || variantId
                                            ? inStock
                                                ? 'Adicionar ao carrinho'
                                                : 'Indisponível'
                                            : 'Selecione uma opção'}
                                    </button>
                                </>
                            ) : (
                                <SalesDisabledNotice className="mt-6" />
                            )}
                        </form>

                        {product.description && (
                            <div className="mt-10 border-t border-brand-200 pt-10">
                                <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900">
                                    Descrição
                                </h2>
                                <div
                                    className="prose prose-sm mt-4 max-w-none text-brand-600 prose-headings:text-brand-900"
                                    dangerouslySetInnerHTML={{
                                        __html: product.description,
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <section className="mt-20 border-t border-brand-200 pt-16">
                        <SectionHeading title="Também pode gostar" />
                        <div className="product-grid">
                            {relatedProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </StoreLayout>
    );
}
