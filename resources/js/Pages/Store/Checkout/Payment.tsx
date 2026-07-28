import Breadcrumbs from '@/Components/Store/Breadcrumbs';
import StoreLayout from '@/Layouts/StoreLayout';
import { formatMoney } from '@/lib/money';
import { PageProps } from '@/types';
import { loadStripe } from '@stripe/stripe-js';
import {
    CheckoutElementsProvider,
    PaymentElement,
    useCheckoutElements,
} from '@stripe/react-stripe-js/checkout';
import { Head, Link } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';

function PaymentForm({
    order,
    paymentMethodOrder,
}: {
    order: {
        id: number;
        order_number: string;
        total: number;
        currency: string;
        guest_token: string | null;
    };
    paymentMethodOrder: string[];
}) {
    const checkoutState = useCheckoutElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const submit = async (e: FormEvent) => {
        e.preventDefault();

        if (checkoutState.type !== 'success') {
            return;
        }

        setProcessing(true);
        setError(null);

        const confirmResult = await checkoutState.checkout.confirm();

        if (confirmResult.type === 'error') {
            setError(confirmResult.error.message ?? 'Erro no pagamento.');
            setProcessing(false);
        }
    };

    if (checkoutState.type === 'loading') {
        return (
            <p className="text-sm text-brand-600">A carregar pagamento...</p>
        );
    }

    if (checkoutState.type === 'error') {
        return (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {checkoutState.error.message}
            </p>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <PaymentElement
                options={{
                    layout: 'tabs',
                    paymentMethodOrder,
                }}
            />
            {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    {error}
                </p>
            )}
            <button
                type="submit"
                disabled={processing}
                className="btn-primary w-full"
            >
                {processing
                    ? 'A processar...'
                    : `Pagar ${formatMoney(order.total, order.currency)}`}
            </button>
        </form>
    );
}

export default function CheckoutPayment({
    order,
    clientSecret,
    stripeKey,
    paymentMethodOrder = ['card', 'mb_way', 'multibanco'],
}: PageProps<{
    order: {
        id: number;
        order_number: string;
        total: number;
        currency: string;
        guest_token: string | null;
    };
    clientSecret: string;
    stripeKey: string | null;
    paymentMethodOrder?: string[];
}>) {
    const stripePromise = useMemo(
        () => (stripeKey ? loadStripe(stripeKey) : null),
        [stripeKey],
    );

    return (
        <StoreLayout>
            <Head title="Pagamento" />

            <div className="store-container max-w-xl pb-16">
                <Breadcrumbs
                    items={[
                        { label: 'Início', href: route('home') },
                        { label: 'Checkout', href: route('checkout.index') },
                        { label: 'Pagamento' },
                    ]}
                />

                <h1 className="store-heading">Pagamento</h1>
                <p className="store-subheading">
                    Encomenda {order.order_number}
                </p>

                <div className="mt-8 rounded-lg border border-brand-200 bg-white p-6 shadow-card">
                    {stripePromise && clientSecret ? (
                        <CheckoutElementsProvider
                            stripe={stripePromise}
                            options={{
                                clientSecret,
                                elementsOptions: {
                                    appearance: {
                                        theme: 'stripe',
                                        variables: {
                                            colorPrimary: '#171717',
                                            borderRadius: '6px',
                                            fontFamily:
                                                'Inter, system-ui, sans-serif',
                                        },
                                    },
                                },
                            }}
                        >
                            <PaymentForm
                                order={order}
                                paymentMethodOrder={paymentMethodOrder}
                            />
                        </CheckoutElementsProvider>
                    ) : (
                        <p className="text-sm text-brand-600">
                            Pagamento indisponível. Configure o Stripe.
                        </p>
                    )}
                </div>

                <Link
                    href={route('checkout.index')}
                    className="mt-6 inline-block text-sm text-brand-600 underline"
                >
                    ← Voltar ao checkout
                </Link>
            </div>
        </StoreLayout>
    );
}
