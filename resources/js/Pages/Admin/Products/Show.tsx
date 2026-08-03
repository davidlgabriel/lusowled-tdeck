import ProductDraftBanner from '@/Components/Admin/ProductDraftBanner';
import ProductVariantsSection, {
    ProductVariantForm,
} from '@/Components/Admin/ProductVariantsSection';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatMoney } from '@/lib/money';
import { Head, Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

type ProductShow = {
    id: number;
    name: string;
    slug: string;
    sku: string;
    description: string;
    base_price: number;
    sale_price: number | null;
    status: string;
    stock_quantity: number;
    is_featured: boolean;
    category_ids: number[];
    images: { id: number; url: string | null; is_primary: boolean }[];
    variants: ProductVariantForm[];
};

export default function AdminProductShow({
    storeUrl,
}: {
    product: ProductShow;
    storeUrl: string;
}) {
    const pageProduct = usePage<PageProps<{ product: ProductShow }>>().props.product;
    const activeVariants = pageProduct.variants.filter((v) => v.is_active);

    return (
        <AdminLayout
            title={pageProduct.name}
            actions={
                <div className="flex flex-wrap gap-3">
                    <a
                        href={storeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                    >
                        Ver na loja
                    </a>
                    <Link
                        href={route('admin.products.edit', pageProduct.id)}
                        className="btn-primary"
                    >
                        Editar produto
                    </Link>
                </div>
            }
        >
            <Head title={`Admin — ${pageProduct.name}`} />

            <div className="mb-6">
                <ProductDraftBanner status={pageProduct.status} productId={pageProduct.id} />
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                    <section className="card space-y-3">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900">
                            Resumo
                        </h2>
                        <p className="text-sm text-brand-600">
                            SKU <strong>{pageProduct.sku}</strong> · Slug{' '}
                            <strong>{pageProduct.slug}</strong>
                        </p>
                        {pageProduct.description && (
                            <div
                                className="prose prose-sm max-w-none text-brand-700"
                                dangerouslySetInnerHTML={{
                                    __html: pageProduct.description,
                                }}
                            />
                        )}
                    </section>

                    <ProductVariantsSection
                        productId={pageProduct.id}
                        productSku={pageProduct.sku}
                        variants={pageProduct.variants}
                    />
                </div>

                <aside className="space-y-6">
                    <section className="card space-y-3 text-sm">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900">
                            Preço e stock
                        </h2>
                        <p>
                            Preço base:{' '}
                            <strong>{formatMoney(pageProduct.base_price)}</strong>{' '}
                            sem IVA
                        </p>
                        {pageProduct.sale_price !== null && (
                            <p>
                                Promoção:{' '}
                                <strong>
                                    {formatMoney(pageProduct.sale_price)}
                                </strong>
                            </p>
                        )}
                        <p>
                            Stock produto: <strong>{pageProduct.stock_quantity}</strong>
                            {activeVariants.length > 0 && (
                                <span className="block text-xs text-brand-500">
                                    Ignorado na loja — use stock das variantes.
                                </span>
                            )}
                        </p>
                        <p>
                            Estado:{' '}
                            <strong>
                                {pageProduct.status === 'active' ? 'Ativo' : 'Rascunho'}
                            </strong>
                        </p>
                    </section>

                    {pageProduct.images.length > 0 && (
                        <section className="card">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900">
                                Imagens
                            </h2>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {pageProduct.images.map((img) => (
                                    <div
                                        key={img.id}
                                        className="relative h-20 w-20 overflow-hidden rounded-lg border border-brand-200"
                                    >
                                        {img.url && (
                                            <img
                                                src={img.url}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        )}
                                        {img.is_primary && (
                                            <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[9px] text-white">
                                                Principal
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="mt-2 text-xs text-brand-500">
                                Para adicionar ou alterar imagens, use{' '}
                                <Link
                                    href={route('admin.products.edit', pageProduct.id)}
                                    className="underline"
                                >
                                    Editar produto
                                </Link>
                                .
                            </p>
                        </section>
                    )}

                    <section className="card">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900">
                            Variantes na loja
                        </h2>
                        {activeVariants.length === 0 ? (
                            <p className="mt-2 text-sm text-brand-500">
                                Sem variantes — o cliente vê um preço e stock
                                únicos.
                            </p>
                        ) : (
                            <ul className="mt-3 space-y-2 text-sm">
                                {activeVariants.map((v) => (
                                    <li
                                        key={v.id}
                                        className="rounded-md border border-brand-200 px-3 py-2"
                                    >
                                        <p className="font-medium text-brand-900">
                                            {v.name}
                                        </p>
                                        <p className="text-xs text-brand-500">
                                            SKU {v.sku}
                                            {v.price !== ''
                                                ? ` · ${formatMoney(Number(v.price))}`
                                                : ` · ${formatMoney(pageProduct.base_price)} (preço do produto)`}
                                            {' · Stock '}
                                            {v.stock_quantity}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </aside>
            </div>
        </AdminLayout>
    );
}
