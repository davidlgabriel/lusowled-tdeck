import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <AuthLayout>
            <Head title="Entrar" />

            <h1 className="font-display mb-6 text-2xl font-semibold">Entrar</h1>

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
                        autoComplete="username"
                        isFocused
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Palavra-passe" />
                    <TextInput
                        id="password"
                        type="password"
                        value={data.password}
                        className="input-field mt-1"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <label className="flex items-center gap-2 text-sm text-brand-700">
                    <Checkbox
                        checked={data.remember}
                        onChange={(e) =>
                            setData('remember', e.target.checked || false)
                        }
                    />
                    Manter sessão iniciada
                </label>

                <div className="flex items-center justify-between pt-2">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-brand-600 underline"
                        >
                            Esqueceu a palavra-passe?
                        </Link>
                    )}
                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-primary"
                    >
                        Entrar
                    </button>
                </div>
            </form>

            <p className="mt-6 text-center text-sm text-brand-600">
                Não tem conta?{' '}
                <Link
                    href={route('register')}
                    className="font-medium text-brand-900 underline"
                >
                    Criar conta
                </Link>
            </p>
        </AuthLayout>
    );
}
