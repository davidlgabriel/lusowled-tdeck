import AuthLayout from '@/Layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <AuthLayout>
            <Head title="Verificar email" />

            <h1 className="font-display mb-4 text-2xl font-semibold">
                Verificar email
            </h1>

            <p className="mb-4 text-sm text-brand-600">
                Obrigado pelo registo. Confirme o seu email através do link que
                enviámos. Se não recebeu, podemos reenviar.
            </p>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm text-green-700">
                    Foi enviado um novo link de verificação.
                </div>
            )}

            <form onSubmit={submit} className="flex items-center justify-between">
                <button type="submit" disabled={processing} className="btn-primary">
                    Reenviar email
                </button>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="text-sm text-brand-600 underline"
                >
                    Sair
                </Link>
            </form>
        </AuthLayout>
    );
}
