import Breadcrumbs from '@/Components/Store/Breadcrumbs';
import RecaptchaField from '@/Components/Store/RecaptchaField';
import StoreLayout from '@/Layouts/StoreLayout';
import { PageProps } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

type Defaults = {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
};

export default function ContactIndex({
    defaults,
    recaptchaSiteKey = null,
}: PageProps<{
    defaults: Defaults;
    recaptchaSiteKey?: string | null;
}>) {
    const { flash } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: defaults.name,
        email: defaults.email,
        phone: defaults.phone,
        subject: defaults.subject,
        message: defaults.message,
        website: '',
        recaptcha_token: '',
    });
    const pageErrors = errors as Record<string, string | undefined>;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('contact.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('subject', 'message', 'website');
            },
        });
    };

    return (
        <StoreLayout>
            <Head title="Contacte-nos" />

            <div className="store-container max-w-2xl pb-16">
                <Breadcrumbs
                    items={[
                        { label: 'Início', href: route('home') },
                        { label: 'Contacte-nos' },
                    ]}
                />

                <h1 className="store-heading">Contacte-nos</h1>
                <p className="store-subheading">
                    Tem dúvidas sobre produtos, encomendas ou projetos? Envie-nos
                    a sua mensagem e respondemos o mais breve possível.
                </p>

                {flash.success && (
                    <p className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                        {flash.success}
                    </p>
                )}

                {pageErrors.contact && (
                    <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        {pageErrors.contact}
                    </p>
                )}

                <form
                    onSubmit={submit}
                    className="mt-8 space-y-5 rounded-lg border border-brand-200 bg-white p-6 shadow-card"
                >
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-brand-800">
                                Nome *
                            </label>
                            <input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="input-field mt-1"
                                required
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-700">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-brand-800">
                                Email *
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                className="input-field mt-1"
                                required
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-700">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-brand-800">
                                Telefone
                            </label>
                            <input
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                className="input-field mt-1"
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-700">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-brand-800">
                                Assunto *
                            </label>
                            <input
                                value={data.subject}
                                onChange={(e) =>
                                    setData('subject', e.target.value)
                                }
                                className="input-field mt-1"
                                required
                            />
                            {errors.subject && (
                                <p className="mt-1 text-sm text-red-700">
                                    {errors.subject}
                                </p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-brand-800">
                                Mensagem *
                            </label>
                            <textarea
                                value={data.message}
                                onChange={(e) =>
                                    setData('message', e.target.value)
                                }
                                rows={6}
                                className="input-field mt-1"
                                required
                            />
                            {errors.message && (
                                <p className="mt-1 text-sm text-red-700">
                                    {errors.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <input
                        type="text"
                        name="website"
                        value={data.website}
                        onChange={(e) => setData('website', e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                        className="hidden"
                        aria-hidden
                    />

                    {recaptchaSiteKey && (
                        <RecaptchaField
                            siteKey={recaptchaSiteKey}
                            onChange={(token) =>
                                setData('recaptcha_token', token)
                            }
                            error={pageErrors.recaptcha}
                        />
                    )}

                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-primary w-full sm:w-auto"
                    >
                        {processing ? 'A enviar...' : 'Enviar mensagem'}
                    </button>
                </form>
            </div>
        </StoreLayout>
    );
}
