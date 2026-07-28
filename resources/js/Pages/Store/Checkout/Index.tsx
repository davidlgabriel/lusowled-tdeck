import Breadcrumbs from '@/Components/Store/Breadcrumbs';
import AddressLocationFields from '@/Components/Store/AddressLocationFields';
import OrderTotals from '@/Components/Store/OrderTotals';
import StoreLayout from '@/Layouts/StoreLayout';
import { formatMoney } from '@/lib/money';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';

type Defaults = {
    billing_name: string;
    billing_tax_id: string;
    billing_email: string;
    billing_phone: string;
    billing_address_line_1: string;
    billing_address_line_2: string;
    billing_city: string;
    billing_state: string;
    billing_postal_code: string;
    billing_country: string;
    shipping_name: string;
    shipping_phone: string;
    shipping_address_line_1: string;
    shipping_address_line_2: string;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    shipping_country: string;
    same_as_billing: boolean;
};

function CheckoutAddressFields({
    prefix,
    data,
    setData,
    errors,
    includeNamePhone = false,
}: {
    prefix: 'billing' | 'shipping';
    data: Record<string, string | boolean>;
    setData: (key: string, value: string | boolean) => void;
    errors: Record<string, string>;
    includeNamePhone?: boolean;
}) {
    const field = (suffix: string) => `${prefix}_${suffix}`;

    return (
        <div className="space-y-4">
            {includeNamePhone && (
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-brand-800">
                            Nome *
                        </label>
                        <input
                            value={String(data[field('name')] ?? '')}
                            onChange={(e) =>
                                setData(field('name'), e.target.value)
                            }
                            className="input-field mt-1"
                            required
                        />
                        {errors[field('name')] && (
                            <p className="mt-1 text-sm text-red-700">
                                {errors[field('name')]}
                            </p>
                        )}
                    </div>
                    <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-brand-800">
                            Telefone
                        </label>
                        <input
                            value={String(data[field('phone')] ?? '')}
                            onChange={(e) =>
                                setData(field('phone'), e.target.value)
                            }
                            className="input-field mt-1"
                        />
                        {errors[field('phone')] && (
                            <p className="mt-1 text-sm text-red-700">
                                {errors[field('phone')]}
                            </p>
                        )}
                    </div>
                </div>
            )}

            <AddressLocationFields
                values={{
                    address_line_1: String(data[field('address_line_1')] ?? ''),
                    address_line_2: String(data[field('address_line_2')] ?? ''),
                    city: String(data[field('city')] ?? ''),
                    state: String(data[field('state')] ?? ''),
                    postal_code: String(data[field('postal_code')] ?? ''),
                    country: String(data[field('country')] ?? 'PT'),
                }}
                onChange={(fieldName, value) =>
                    setData(field(fieldName), value)
                }
                errors={errors}
                errorKey={(fieldName) => field(fieldName)}
            />
        </div>
    );
}

export default function CheckoutIndex({
    cart,
    defaults,
    stripeKey,
}: PageProps<{
    cart: {
        items: { product_name: string; quantity: number; line_total: number }[];
        subtotal: number;
        tax_total: number;
        shipping: number;
        total: number;
        currency: string;
        vat_rate: number;
    };
    defaults: Defaults;
    stripeKey: string | null;
}>) {
    const { data, setData, post, processing, errors } = useForm({
        ...defaults,
        promotion_code: '',
    });

    useEffect(() => {
        if (!data.same_as_billing) {
            return;
        }

        setData('shipping_name', data.billing_name);
        setData('shipping_phone', data.billing_phone);
        setData('shipping_address_line_1', data.billing_address_line_1);
        setData('shipping_address_line_2', data.billing_address_line_2);
        setData('shipping_city', data.billing_city);
        setData('shipping_state', data.billing_state);
        setData('shipping_postal_code', data.billing_postal_code);
        setData('shipping_country', data.billing_country);
    }, [
        data.same_as_billing,
        data.billing_name,
        data.billing_phone,
        data.billing_address_line_1,
        data.billing_address_line_2,
        data.billing_city,
        data.billing_state,
        data.billing_postal_code,
        data.billing_country,
    ]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('checkout.store'));
    };

    return (
        <StoreLayout>
            <Head title="Checkout" />

            <div className="store-container pb-16">
                <Breadcrumbs
                    items={[
                        { label: 'Início', href: route('home') },
                        { label: 'Carrinho', href: route('cart.index') },
                        { label: 'Checkout' },
                    ]}
                />

                <h1 className="store-heading">Checkout</h1>

                {!stripeKey && (
                    <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        Configure as chaves Stripe em Definições para ativar o
                        pagamento.
                    </div>
                )}

                <form
                    onSubmit={submit}
                    className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]"
                >
                    <div className="space-y-6">
                        <section className="rounded-lg border border-brand-200 bg-white p-6 shadow-card">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900">
                                Faturação
                            </h2>
                        <div className="mb-4 mt-5 grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="text-sm font-medium">
                                    Nome / Empresa
                                </label>
                                <input
                                    value={data.billing_name}
                                    onChange={(e) =>
                                        setData('billing_name', e.target.value)
                                    }
                                    className="input-field mt-1"
                                    required
                                />
                                {errors.billing_name && (
                                    <p className="mt-1 text-sm text-red-700">
                                        {errors.billing_name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium">
                                    NIF
                                </label>
                                <input
                                    value={data.billing_tax_id}
                                    onChange={(e) =>
                                        setData('billing_tax_id', e.target.value)
                                    }
                                    className="input-field mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={data.billing_email}
                                    onChange={(e) =>
                                        setData('billing_email', e.target.value)
                                    }
                                    className="input-field mt-1"
                                    required
                                />
                                {errors.billing_email && (
                                    <p className="mt-1 text-sm text-red-700">
                                        {errors.billing_email}
                                    </p>
                                )}
                            </div>
                        </div>
                        <CheckoutAddressFields
                            prefix="billing"
                            data={data}
                            setData={setData}
                            errors={errors}
                        />
                    </section>

                    <section className="rounded-lg border border-brand-200 bg-white p-6 shadow-card">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900">
                                Envio
                            </h2>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.same_as_billing}
                                    onChange={(e) =>
                                        setData(
                                            'same_as_billing',
                                            e.target.checked,
                                        )
                                    }
                                />
                                Igual à faturação
                            </label>
                        </div>
                        {!data.same_as_billing && (
                            <div className="mt-5">
                            <CheckoutAddressFields
                                prefix="shipping"
                                data={data}
                                setData={setData}
                                errors={errors}
                                includeNamePhone
                            />
                            </div>
                        )}
                    </section>

                    <section className="rounded-lg border border-brand-200 bg-white p-6 shadow-card">
                        <label className="text-sm font-medium">
                            Código promocional
                        </label>
                        <input
                            value={data.promotion_code}
                            onChange={(e) =>
                                setData('promotion_code', e.target.value)
                            }
                            className="input-field mt-1 max-w-xs uppercase"
                            placeholder="EX: BEMVINDO10"
                        />
                        {errors.promotion_code && (
                            <p className="mt-1 text-sm text-red-700">
                                {errors.promotion_code}
                            </p>
                        )}
                    </section>
                </div>

                <aside className="h-fit rounded-lg border border-brand-200 bg-brand-50 p-6 lg:sticky lg:top-28">
                    <h2 className="text-lg font-semibold text-brand-900">
                        Resumo do pedido
                    </h2>
                    <ul className="mb-4 mt-5 space-y-2 border-b border-brand-200 pb-4 text-sm">
                        {cart.items.map((item, i) => (
                            <li key={i} className="flex justify-between gap-2">
                                <span className="text-brand-600">
                                    {item.quantity}× {item.product_name}
                                </span>
                                <span>
                                    {formatMoney(
                                        item.line_total,
                                        cart.currency,
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <OrderTotals
                        subtotal={cart.subtotal}
                        shipping={cart.shipping}
                        total={cart.total}
                        currency={cart.currency}
                        vatRate={cart.vat_rate}
                        taxTotal={cart.tax_total}
                    />
                    <button
                        type="submit"
                        disabled={processing || !stripeKey}
                        className="btn-primary mt-6 w-full"
                    >
                        Continuar para pagamento
                    </button>
                </aside>
            </form>
            </div>
        </StoreLayout>
    );
}
