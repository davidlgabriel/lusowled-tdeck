import {
    CartPlusIcon,
    MinusIcon,
    PlusIcon,
    TrashIcon,
} from '@/Components/Store/StoreIcons';
import { PageProps, StoreProduct } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function ProductCardActions({
    product,
}: {
    product: StoreProduct;
}) {
    const { cart, store } = usePage<PageProps>().props;
    const [processing, setProcessing] = useState(false);

    const cartLine = cart.lines?.find(
        (line) =>
            line.product_id === product.id && line.product_variant_id === null,
    );

    const [quantity, setQuantity] = useState(cartLine?.quantity ?? 1);

    useEffect(() => {
        if (cartLine) {
            setQuantity(cartLine.quantity);
        }
    }, [cartLine?.quantity]);

    const maxQty = product.stock_quantity;
    const inCart = !!cartLine;

    const syncCart = (options?: { onFinish?: () => void }) => ({
        preserveScroll: true,
        only: ['cart', 'flash'] as string[],
        onFinish: () => {
            setProcessing(false);
            options?.onFinish?.();
        },
    });

    const addToCart = () => {
        if (!product.is_in_stock || processing) return;

        if (product.has_variants) {
            router.visit(route('products.show', product.slug));
            return;
        }

        setProcessing(true);
        router.post(
            route('cart.store'),
            {
                product_id: product.id,
                quantity,
            },
            syncCart(),
        );
    };

    const updateCart = (nextQty: number) => {
        if (!cartLine || processing) return;

        setProcessing(true);
        setQuantity(nextQty);
        router.patch(
            route('cart.update', cartLine.cart_item_id),
            { quantity: nextQty },
            syncCart({
                onFinish: () => {
                    if (nextQty < 1) {
                        setQuantity(1);
                    }
                },
            }),
        );
    };

    const removeFromCart = () => {
        if (!cartLine || processing) return;

        setProcessing(true);
        router.delete(
            route('cart.destroy', cartLine.cart_item_id),
            syncCart({
                onFinish: () => setQuantity(1),
            }),
        );
    };

    const decrement = () => {
        if (inCart) {
            if (cartLine.quantity <= 1) {
                removeFromCart();
            } else {
                updateCart(cartLine.quantity - 1);
            }
            return;
        }

        setQuantity((q) => Math.max(1, q - 1));
    };

    const increment = () => {
        if (inCart) {
            updateCart(Math.min(maxQty, cartLine.quantity + 1));
            return;
        }

        setQuantity((q) => Math.min(maxQty, q + 1));
    };

    if (!product.is_in_stock) {
        return null;
    }

    if (!store.sales_enabled) {
        return (
            <Link
                href={route('products.show', product.slug)}
                className="mt-2 flex w-full items-center justify-center rounded-full border border-brand-200 bg-white py-2 text-xs font-medium text-brand-900 transition hover:border-brand-900 hover:bg-brand-50"
            >
                Ver produto
            </Link>
        );
    }

    if (product.has_variants) {
        return (
            <button
                type="button"
                onClick={addToCart}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-brand-200 bg-white py-2 text-xs font-medium text-brand-900 transition hover:border-brand-900 hover:bg-brand-50"
            >
                <CartPlusIcon className="h-4 w-4" />
                Escolher opções
            </button>
        );
    }

    return (
        <div className="mt-2 flex items-center gap-1.5">
            <div className="flex flex-1 items-center justify-between rounded-full bg-brand-50 px-1 py-0.5 shadow-[inset_0_1px_2px_rgba(61,26,10,0.05)]">
                <button
                    type="button"
                    onClick={decrement}
                    disabled={processing}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-brand-600 transition hover:bg-white hover:text-brand-900 disabled:opacity-40"
                    aria-label="Diminuir quantidade"
                >
                    <MinusIcon className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[1.25rem] text-center text-xs font-semibold tabular-nums text-brand-900">
                    {quantity}
                </span>
                <button
                    type="button"
                    onClick={increment}
                    disabled={processing || quantity >= maxQty}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-brand-600 transition hover:bg-white hover:text-brand-900 disabled:opacity-40"
                    aria-label="Aumentar quantidade"
                >
                    <PlusIcon className="h-3.5 w-3.5" />
                </button>
            </div>

            {inCart ? (
                <button
                    type="button"
                    onClick={removeFromCart}
                    disabled={processing}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-red-500 shadow-[0_2px_8px_rgba(61,26,10,0.08)] transition hover:shadow-[0_4px_12px_rgba(220,38,38,0.15)] disabled:opacity-40"
                    aria-label="Remover do carrinho"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            ) : (
                <button
                    type="button"
                    onClick={addToCart}
                    disabled={processing}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-900 text-white shadow-[0_4px_12px_rgba(61,26,10,0.2)] transition hover:bg-brand-800 hover:shadow-[0_6px_16px_rgba(61,26,10,0.28)] disabled:opacity-40"
                    aria-label="Adicionar ao carrinho"
                >
                    <CartPlusIcon className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
