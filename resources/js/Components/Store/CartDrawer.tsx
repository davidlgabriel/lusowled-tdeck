import OrderTotals from '@/Components/Store/OrderTotals';
import ProductImage from '@/Components/Store/ProductImage';
import { MinusIcon, PlusIcon, TrashIcon } from '@/Components/Store/StoreIcons';
import { useCartDrawer } from '@/Contexts/CartDrawerContext';
import { formatMoney } from '@/lib/money';
import { PageProps } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export default function CartDrawer() {
    const { open, closeDrawer } = useCartDrawer();
    const { cart } = usePage<PageProps>().props;
    const summary = cart.drawer;

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeDrawer();
        };

        document.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, closeDrawer]);

    const syncCart = () => ({
        preserveScroll: true,
        only: ['cart', 'flash'] as string[],
    });

    const updateQty = (itemId: number, quantity: number) => {
        router.patch(route('cart.update', itemId), { quantity }, syncCart());
    };

    const remove = (itemId: number) => {
        router.delete(route('cart.destroy', itemId), syncCart());
    };

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[70]">
            <button
                type="button"
                className="absolute inset-0 bg-brand-950/40 backdrop-blur-[2px]"
                onClick={closeDrawer}
                aria-label="Fechar carrinho"
            />

            <aside
                className="absolute bottom-0 right-0 top-0 flex w-full max-w-md flex-col bg-white shadow-2xl animate-slideInRight sm:rounded-l-2xl"
                role="dialog"
                aria-modal="true"
                aria-label="Carrinho de compras"
            >
                <div className="flex items-center justify-between border-b border-brand-200 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-brand-900">
                            Carrinho
                        </h2>
                        <p className="text-sm text-brand-500">
                            {cart.item_count}{' '}
                            {cart.item_count === 1 ? 'artigo' : 'artigos'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={closeDrawer}
                        className="icon-btn"
                        aria-label="Fechar"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {!summary || summary.items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                            <p className="text-brand-600">
                                O seu carrinho está vazio.
                            </p>
                            <button
                                type="button"
                                onClick={closeDrawer}
                                className="btn-secondary mt-6"
                            >
                                Continuar a comprar
                            </button>
                        </div>
                    ) : (
                        <ul className="divide-y divide-brand-100">
                            {summary.items.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex gap-3 py-4 first:pt-0"
                                >
                                    <Link
                                        href={route(
                                            'products.show',
                                            item.product_slug,
                                        )}
                                        onClick={closeDrawer}
                                        className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-100"
                                    >
                                        <ProductImage
                                            product={{
                                                name: item.product_name,
                                                image_url: item.image_url,
                                            }}
                                            className="h-full w-full"
                                        />
                                    </Link>

                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={route(
                                                'products.show',
                                                item.product_slug,
                                            )}
                                            onClick={closeDrawer}
                                            className="line-clamp-2 text-sm font-medium text-brand-900 hover:underline"
                                        >
                                            {item.product_name}
                                        </Link>
                                        {item.variant_name && (
                                            <p className="mt-0.5 text-xs text-brand-500">
                                                {item.variant_name}
                                            </p>
                                        )}
                                        <p className="mt-1 text-sm font-medium text-brand-900">
                                            {formatMoney(
                                                item.line_total,
                                                summary.currency,
                                            )}
                                            <span className="ml-1 text-xs font-normal text-brand-500">
                                                sem IVA
                                            </span>
                                        </p>

                                        <div className="mt-3 flex items-center gap-2">
                                            <div className="inline-flex items-center rounded-md border border-brand-300 bg-white">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQty(
                                                            item.id,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center text-brand-700 transition hover:bg-brand-50"
                                                    aria-label="Diminuir quantidade"
                                                >
                                                    <MinusIcon className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-semibold">
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
                                                    className="flex h-8 w-8 items-center justify-center text-brand-700 transition hover:bg-brand-50 disabled:opacity-40"
                                                    aria-label="Aumentar quantidade"
                                                >
                                                    <PlusIcon className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => remove(item.id)}
                                                className="flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition hover:bg-red-50"
                                                aria-label="Remover do carrinho"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {summary && summary.items.length > 0 && (
                    <div className="border-t border-brand-200 bg-brand-50 px-5 py-5">
                        <OrderTotals
                            subtotal={summary.subtotal}
                            shipping={summary.shipping}
                            total={summary.total}
                            currency={summary.currency}
                            vatRate={summary.vat_rate}
                            taxTotal={summary.tax_total}
                        />
                        <Link
                            href={route('checkout.index')}
                            onClick={closeDrawer}
                            className="btn-primary mt-5 w-full"
                        >
                            Finalizar compra
                        </Link>
                        <Link
                            href={route('cart.index')}
                            onClick={closeDrawer}
                            className="mt-3 block text-center text-sm text-brand-600 underline"
                        >
                            Ver carrinho completo
                        </Link>
                    </div>
                )}
            </aside>
        </div>
    );
}
