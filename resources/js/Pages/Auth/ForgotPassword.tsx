import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthLayout>
            <Head title="Recuperar palavra-passe" />

            <h1 className="font-display mb-2 text-2xl font-semibold">
                Recuperar palavra-passe
            </h1>
            <p className="mb-6 text-sm text-brand-600">
                Indique o seu email e enviaremos um link de recuperação.
            </p>

            {status && (
                <div className="mb-4 text-sm text-green-700">{status}</div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        value={data.email}
                        className="input-field mt-1"
                        isFocused
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="btn-primary w-full"
                >
                    Enviar link
                </button>
            </form>
        </AuthLayout>
    );
}
