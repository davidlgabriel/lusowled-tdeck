import StoreLayout from '@/Layouts/StoreLayout';
import { formatMoney } from '@/lib/money';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

type PaymentState = 'paid' | 'pending' | 'failed';

export default function CheckoutSuccess({
    order,
    paymentState = 'paid',
    paymentUrl = null,
}: PageProps<{
    order: {
        order_number: string;
        total: number;
        currency: string;
        email: string;
    };
    paymentState?: PaymentState;
    paymentUrl?: string | null;
}>) {
    const { auth } = usePage<PageProps>().props;

    const isPaid = paymentState === 'paid';
    const isPending = paymentState === 'pending';
    const isFailed = paymentState === 'failed';

    return (
        <StoreLayout>
            <Head
                title={
                    isPaid
                        ? 'Encomenda confirmada'
                        : isPending
                          ? 'Pagamento pendente'
                          : 'Pagamento não concluído'
                }
            />

            <div className="store-container max-w-xl pb-20 pt-8 text-center">
                <div
                    className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl ${
                        isPaid
                            ? 'bg-green-100 text-green-800'
                            : isPending
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                    }`}
                >
                    {isPaid ? '✓' : isPending ? '…' : '✕'}
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-brand-900 md:text-4xl">
                    {isPaid
                        ? 'Obrigado pela sua encomenda'
                        : isPending
                          ? 'Encomenda registada — aguardamos pagamento'
                          : 'Pagamento não concluído'}
                </h1>

                <p className="mt-4 text-brand-600">
                    {isPaid && (
                        <>
                            A encomenda{' '}
                            <strong className="text-brand-900">
                                {order.order_number}
                            </strong>{' '}
                            foi confirmada. Enviámos a confirmação para{' '}
                            <strong className="text-brand-900">
                                {order.email}
                            </strong>
                            .
                        </>
                    )}
                    {isPending && (
                        <>
                            A encomenda{' '}
                            <strong className="text-brand-900">
                                {order.order_number}
                            </strong>{' '}
                            foi criada. Se pagou por Multibanco ou MB WAY, a
                            confirmação pode demorar alguns minutos. Enviaremos
                            email para{' '}
                            <strong className="text-brand-900">
                                {order.email}
                            </strong>{' '}
                            quando o pagamento for recebido.
                        </>
                    )}
                    {isFailed && (
                        <>
                            Não foi possível concluir o pagamento da encomenda{' '}
                            <strong className="text-brand-900">
                                {order.order_number}
                            </strong>
                            . Pode tentar novamente.
                        </>
                    )}
                </p>

                <p className="mt-4 text-xl font-semibold text-brand-900">
                    {formatMoney(order.total, order.currency)}
                </p>

                <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    {paymentUrl && (isPending || isFailed) && (
                        <a href={paymentUrl} className="btn-primary">
                            {isFailed ? 'Tentar pagar novamente' : 'Voltar ao pagamento'}
                        </a>
                    )}
                    <Link href={route('products.index')} className="btn-secondary">
                        Continuar a comprar
                    </Link>
                    {auth.user && (
                        <Link
                            href={route('account.orders.index')}
                            className="btn-secondary"
                        >
                            Ver encomendas
                        </Link>
                    )}
                </div>
            </div>
        </StoreLayout>
    );
}
