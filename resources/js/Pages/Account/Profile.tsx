import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import AccountLayout from '@/Layouts/AccountLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Profile({
    mustVerifyEmail,
    status,
    user,
}: PageProps<{
    mustVerifyEmail: boolean;
    status?: string;
    user: {
        name: string;
        email: string;
        phone?: string | null;
        tax_id?: string | null;
    };
}>) {
    const { auth } = usePage<PageProps>().props;

    const { data, setData, patch, processing, errors, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            phone: user.phone ?? '',
            tax_id: user.tax_id ?? '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('account.profile.update'));
    };

    return (
        <AccountLayout title="Dados pessoais">
            <Head title="Dados pessoais" />

            {status === 'verification-link-sent' && (
                <div className="mb-6 rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    Foi enviado um novo link de verificação para o seu email.
                </div>
            )}

            <form onSubmit={submit} className="card max-w-xl space-y-5">
                <div>
                    <InputLabel htmlFor="name" value="Nome" />
                    <TextInput
                        id="name"
                        value={data.name}
                        className="input-field mt-1"
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        value={data.email}
                        className="input-field mt-1"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1" />
                    {mustVerifyEmail && !auth.user?.email_verified_at && (
                        <p className="mt-2 text-sm text-brand-600">
                            Email por verificar.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="underline"
                            >
                                Reenviar link
                            </Link>
                        </p>
                    )}
                </div>

                <div>
                    <InputLabel htmlFor="phone" value="Telefone" />
                    <TextInput
                        id="phone"
                        value={data.phone}
                        className="input-field mt-1"
                        onChange={(e) => setData('phone', e.target.value)}
                    />
                    <InputError message={errors.phone} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="tax_id" value="NIF" />
                    <TextInput
                        id="tax_id"
                        value={data.tax_id}
                        className="input-field mt-1"
                        onChange={(e) => setData('tax_id', e.target.value)}
                    />
                    <InputError message={errors.tax_id} className="mt-1" />
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-primary"
                    >
                        Guardar
                    </button>
                    {recentlySuccessful && (
                        <span className="text-sm text-green-700">
                            Guardado.
                        </span>
                    )}
                </div>
            </form>
        </AccountLayout>
    );
}
