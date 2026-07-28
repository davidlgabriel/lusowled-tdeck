import Breadcrumbs from '@/Components/Store/Breadcrumbs';
import OrderTotals from '@/Components/Store/OrderTotals';
import ProductImage from '@/Components/Store/ProductImage';
import SalesDisabledNotice from '@/Components/Store/SalesDisabledNotice';
import StoreLayout from '@/Layouts/StoreLayout';
import { formatMoney } from '@/lib/money';
import { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function CartIndex({
    cart,
}: PageProps<{
    cart: {
        item_count: number;
        items: {
            id: number;
            product_id: number;
            product_name: string;
            product_slug: string;
            variant_name?: string;
            quantity: number;
            unit_price: number;
            line_total: number;
            image_url: string | null;
            max_quantity: number;
        }[];
        subtotal: number;
        tax_total: number;
        shipping: number;
        total: number;
        currency: string;
        vat_rate: number;
    };
}>) {
    const { store } = usePage<PageProps>().props;

    const updateQty = (itemId: number, quantity: number) => {
        router.patch(route('cart.update', itemId), { quantity });
    };

    const remove = (itemId: number) => {
        router.delete(route('cart.destroy', itemId));
    };

    return (
        <StoreLayout>
            <Head title="Carrinho" />

            <div className="store-container pb-16">
                <Breadcrumbs
                    items={[
                        { label: 'Início', href: route('home') },
                        { label: 'Carrinho' },
                    ]}
                />

                <h1 className="store-heading">Carrinho de compras</h1>

                {cart.items.length === 0 ? (
                    <div className="mt-10 rounded-lg border border-brand-200 bg-brand-50 py-20 text-center">
                        <p className="text-lg text-brand-600">
                            O seu carrinho está vazio.
                        </p>
                        <Link
                            href={route('products.index')}
                            className="btn-primary mt-6 inline-flex"
                        >
                            Continuar a comprar
                        </Link>
                    </div>
                ) : (
                    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
                        <div className="divide-y divide-brand-200 rounded-lg border border-brand-200 bg-white">
                            {cart.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4 p-4 sm:gap-6 sm:p-6"
                                >
                                    <Link
                                        href={route(
                                            'products.show',
                                            item.product_slug,
                                        )}
                                        className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-brand-100 sm:h-28 sm:w-24"
                                    >
                                        <ProductImage
                                            product={{
                                                name: item.product_name,
                                                image_url: item.image_url,
                                            }}
                                            className="h-full w-full"
                                        />
                                    </Link>
                                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                        <div className="min-w-0">
                                            <Link
                                                href={route(
                                                    'products.show',
                                                    item.product_slug,
                                                )}
                                                className="font-medium text-brand-900 hover:underline"
                                            >
                                                {item.product_name}
                                            </Link>
                                            {item.variant_name && (
                                                <p className="mt-1 text-sm text-brand-500">
                                                    {item.variant_name}
                                                </p>
                                            )}
                                            <p className="mt-1 text-sm text-brand-500 sm:hidden">
                                                {formatMoney(
                                                    item.line_total,
                                                    cart.currency,
                                                )}
                                                <span className="block text-xs">
                                                    sem IVA
                                                </span>
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between gap-6 sm:justify-end">
                                            <div className="inline-flex items-center rounded-md border border-brand-300">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQty(
                                                            item.id,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                    className="flex h-10 w-10 items-center justify-center text-brand-700 transition hover:bg-brand-50"
                                                    aria-label="Diminuir quantidade"
                                                >
                                                    −
                                                </button>
                                                <span className="w-10 text-center text-sm font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQty(
                                                            item.id,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                    disabled={
                                                        item.quantity >=
                                                        item.max_quantity
                                                    }
                                                    className="flex h-10 w-10 items-center justify-center text-brand-700 transition hover:bg-brand-50 disabled:opacity-40"
                                                    aria-label="Aumentar quantidade"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <p className="hidden min-w-[80px] text-right sm:block">
                                                <span className="block font-medium">
                                                    {formatMoney(
                                                        item.line_total,
                                                        cart.currency,
                                                    )}
                                                </span>
                                                <span className="text-xs text-brand-500">
                                                    sem IVA
                                                </span>
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => remove(item.id)}
                                                className="text-sm text-brand-500 underline transition hover:text-brand-900"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <aside className="h-fit rounded-lg border border-brand-200 bg-brand-50 p-6 lg:sticky lg:top-28">
                            <h2 className="text-lg font-semibold text-brand-900">
                                Resumo do pedido
                            </h2>
                            <OrderTotals
                                subtotal={cart.subtotal}
                                shipping={cart.shipping}
                                total={cart.total}
                                currency={cart.currency}
                                vatRate={cart.vat_rate}
                                taxTotal={cart.tax_total}
                            />
                            {store.sales_enabled ? (
                                <Link
                                    href={route('checkout.index')}
                                    className="btn-primary mt-6 w-full"
                                >
                                    Finalizar compra
                                </Link>
                            ) : (
                                <SalesDisabledNotice className="mt-6" compact />
                            )}
                            <Link
                                href={route('products.index')}
                                className="mt-3 block text-center text-sm text-brand-600 underline"
                            >
                                Continuar a comprar
                            </Link>
                        </aside>
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
