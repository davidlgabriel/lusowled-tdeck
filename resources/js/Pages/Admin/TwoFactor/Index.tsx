import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

export default function TwoFactorIndex({
    enabled,
    qrCode,
    secret,
    recoveryCodes,
}: {
    enabled: boolean;
    qrCode?: string;
    secret?: string;
    recoveryCodes?: string[];
}) {
    const [showDisable, setShowDisable] = useState(false);

    const enableForm = useForm({ code: '' });
    const disableForm = useForm({ password: '', code: '' });

    const submitEnable = (e: FormEvent) => {
        e.preventDefault();
        enableForm.post(route('admin.two-factor.enable'), {
            preserveScroll: true,
        });
    };

    const submitDisable = (e: FormEvent) => {
        e.preventDefault();
        disableForm.delete(route('admin.two-factor.disable'), {
            preserveScroll: true,
            onSuccess: () => setShowDisable(false),
        });
    };

    return (
        <AdminLayout title="Segurança — Autenticação de dois fatores">
            <Head title="Admin — Segurança" />

            {enabled ? (
                <div className="max-w-2xl space-y-6">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-5">
                        <p className="font-medium text-green-900">
                            Autenticação de dois fatores ativa
                        </p>
                        <p className="mt-1 text-sm text-green-800">
                            A sua conta de administrador está protegida com um
                            código da aplicação autenticadora no telemóvel.
                        </p>
                    </div>

                    {recoveryCodes && recoveryCodes.length > 0 && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
                            <p className="font-medium text-amber-900">
                                Guarde estes códigos de recuperação
                            </p>
                            <p className="mt-1 text-sm text-amber-800">
                                Cada código só pode ser usado uma vez, caso
                                perca acesso à aplicação autenticadora.
                            </p>
                            <ul className="mt-4 grid grid-cols-2 gap-2 font-mono text-sm text-brand-900">
                                {recoveryCodes.map((code) => (
                                    <li
                                        key={code}
                                        className="rounded bg-white px-3 py-2"
                                    >
                                        {code}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {!showDisable ? (
                        <button
                            type="button"
                            onClick={() => setShowDisable(true)}
                            className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                        >
                            Desativar autenticação de dois fatores
                        </button>
                    ) : (
                        <form
                            onSubmit={submitDisable}
                            className="card max-w-md space-y-4"
                        >
                            <p className="text-sm text-brand-600">
                                Confirme a palavra-passe e o código atual da
                                aplicação autenticadora para desativar.
                            </p>

                            <div>
                                <InputLabel
                                    htmlFor="password"
                                    value="Palavra-passe"
                                />
                                <TextInput
                                    id="password"
                                    type="password"
                                    value={disableForm.data.password}
                                    className="input-field mt-1"
                                    onChange={(e) =>
                                        disableForm.setData(
                                            'password',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={disableForm.errors.password}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="disable_code"
                                    value="Código de autenticação"
                                />
                                <TextInput
                                    id="disable_code"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={disableForm.data.code}
                                    className="input-field mt-1 tracking-widest"
                                    onChange={(e) =>
                                        disableForm.setData(
                                            'code',
                                            e.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 6),
                                        )
                                    }
                                />
                                <InputError
                                    message={disableForm.errors.code}
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={disableForm.processing}
                                    className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
                                >
                                    Confirmar desativação
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDisable(false)}
                                    className="rounded-md border border-brand-300 px-4 py-2 text-sm font-medium text-brand-700"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            ) : (
                <div className="grid max-w-4xl gap-8 lg:grid-cols-2">
                    <div className="space-y-4">
                        <p className="text-sm text-brand-600">
                            Proteja o acesso à área de administração com um
                            código temporário gerado pela aplicação
                            autenticadora no seu telemóvel.
                        </p>

                        <ol className="list-decimal space-y-2 pl-5 text-sm text-brand-700">
                            <li>
                                Instale uma aplicação como Google Authenticator
                                ou Authy no telemóvel.
                            </li>
                            <li>Leia o código QR ao lado (ou introduza a chave manualmente).</li>
                            <li>
                                Introduza o código de 6 dígitos gerado pela
                                aplicação para confirmar.
                            </li>
                        </ol>

                        {secret && (
                            <div className="rounded-md border border-brand-200 bg-brand-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
                                    Chave manual
                                </p>
                                <p className="mt-1 break-all font-mono text-sm text-brand-900">
                                    {secret}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {qrCode && (
                            <div
                                className="mx-auto w-fit rounded-lg border border-brand-200 bg-white p-4"
                                dangerouslySetInnerHTML={{ __html: qrCode }}
                            />
                        )}

                        <form onSubmit={submitEnable} className="space-y-4">
                            <div>
                                <InputLabel
                                    htmlFor="code"
                                    value="Código de confirmação"
                                />
                                <TextInput
                                    id="code"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={enableForm.data.code}
                                    className="input-field mt-1 tracking-widest"
                                    onChange={(e) =>
                                        enableForm.setData(
                                            'code',
                                            e.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 6),
                                        )
                                    }
                                />
                                <InputError
                                    message={enableForm.errors.code}
                                    className="mt-1"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={enableForm.processing}
                                className="btn-primary"
                            >
                                Ativar autenticação de dois fatores
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
