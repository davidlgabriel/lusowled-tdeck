import { CartIcon } from '@/Components/Store/StoreLogo';
import { useCartDrawer } from '@/Contexts/CartDrawerContext';
import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type CartToastPayload = {
    type: 'added' | 'updated' | 'removed';
    product_name: string;
    quantity?: number;
};

export default function CartToast() {
    const { flash } = usePage<PageProps>().props;
    const { openDrawer } = useCartDrawer();
    const [visible, setVisible] = useState(false);
    const [toast, setToast] = useState<CartToastPayload | null>(null);

    useEffect(() => {
        const payload = flash.cart_toast as CartToastPayload | undefined;

        if (!payload?.product_name) {
            return;
        }

        setToast(payload);
        setVisible(true);

        const timer = window.setTimeout(() => setVisible(false), 4500);

        return () => window.clearTimeout(timer);
    }, [flash.cart_toast]);

    if (!toast || !visible) {
        return null;
    }

    const message =
        toast.type === 'added'
            ? 'Adicionado ao carrinho'
            : toast.type === 'updated'
              ? 'Quantidade atualizada'
              : 'Removido do carrinho';

    const detail =
        toast.type === 'removed'
            ? toast.product_name
            : `${toast.quantity ?? 1}× ${toast.product_name}`;

    return (
        <div
            className="pointer-events-none fixed bottom-6 right-6 z-[60] flex max-w-sm animate-slideUp"
            role="status"
            aria-live="polite"
        >
            <div className="pointer-events-auto flex w-full items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_12px_40px_rgba(61,26,10,0.14)]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-900 text-white shadow-[0_4px_12px_rgba(61,26,10,0.2)]">
                    <CartIcon />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-brand-900">
                        {message}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-brand-600">
                        {detail}
                    </p>
                    {toast.type !== 'removed' && (
                        <button
                            type="button"
                            onClick={() => {
                                setVisible(false);
                                openDrawer();
                            }}
                            className="mt-2 text-xs font-medium text-brand-900 underline underline-offset-2 transition hover:text-brand-700"
                        >
                            Ver carrinho
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="shrink-0 rounded-full p-1 text-brand-400 transition hover:bg-brand-50 hover:text-brand-900"
                    aria-label="Fechar"
                >
                    <svg
                        className="h-4 w-4"
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
        </div>
    );
}
