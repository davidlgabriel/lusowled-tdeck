import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function TwoFactorChallenge() {
    const [useRecovery, setUseRecovery] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        recovery_code: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('two-factor.login.store'), {
            onFinish: () => {
                reset('code', 'recovery_code');
            },
        });
    };

    return (
        <AuthLayout>
            <Head title="Verificação em dois passos" />

            <h1 className="font-display mb-2 text-2xl font-semibold">
                Verificação em dois passos
            </h1>
            <p className="mb-6 text-sm text-brand-600">
                Introduza o código de 6 dígitos da aplicação autenticadora no
                seu telemóvel (Google Authenticator, Authy, etc.).
            </p>

            <form onSubmit={submit} className="space-y-4">
                {!useRecovery ? (
                    <div>
                        <InputLabel htmlFor="code" value="Código de autenticação" />
                        <TextInput
                            id="code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            value={data.code}
                            className="input-field mt-1 tracking-widest"
                            isFocused
                            maxLength={6}
                            onChange={(e) =>
                                setData(
                                    'code',
                                    e.target.value.replace(/\D/g, '').slice(0, 6),
                                )
                            }
                        />
                        <InputError message={errors.code} className="mt-1" />
                    </div>
                ) : (
                    <div>
                        <InputLabel
                            htmlFor="recovery_code"
                            value="Código de recuperação"
                        />
                        <TextInput
                            id="recovery_code"
                            type="text"
                            value={data.recovery_code}
                            className="input-field mt-1 font-mono uppercase"
                            isFocused
                            onChange={(e) =>
                                setData(
                                    'recovery_code',
                                    e.target.value.toUpperCase(),
                                )
                            }
                        />
                        <InputError message={errors.code} className="mt-1" />
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => {
                        setUseRecovery(!useRecovery);
                        reset('code', 'recovery_code');
                    }}
                    className="text-sm text-brand-600 underline hover:text-brand-900"
                >
                    {useRecovery
                        ? 'Usar código da aplicação autenticadora'
                        : 'Usar código de recuperação'}
                </button>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-primary"
                    >
                        Verificar
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
}
