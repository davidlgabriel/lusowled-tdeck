import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const { data, setData, put, processing, errors, recentlySuccessful, reset } =
        useForm({
            current_password: '',
            password: '',
            password_confirmation: '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={submit} className={`card max-w-xl space-y-5 ${className}`}>
            <div>
                <h2 className="font-display text-lg font-semibold text-brand-900">
                    Alterar palavra-passe
                </h2>
                <p className="mt-1 text-sm text-brand-600">
                    Use uma palavra-passe forte com pelo menos 8 caracteres.
                </p>
            </div>

            <div>
                <InputLabel
                    htmlFor="current_password"
                    value="Palavra-passe atual"
                />
                <TextInput
                    id="current_password"
                    type="password"
                    value={data.current_password}
                    className="input-field mt-1"
                    autoComplete="current-password"
                    onChange={(e) => setData('current_password', e.target.value)}
                />
                <InputError
                    message={errors.current_password}
                    className="mt-1"
                />
            </div>

            <div>
                <InputLabel htmlFor="password" value="Nova palavra-passe" />
                <TextInput
                    id="password"
                    type="password"
                    value={data.password}
                    className="input-field mt-1"
                    autoComplete="new-password"
                    onChange={(e) => setData('password', e.target.value)}
                />
                <InputError message={errors.password} className="mt-1" />
            </div>

            <div>
                <InputLabel
                    htmlFor="password_confirmation"
                    value="Confirmar nova palavra-passe"
                />
                <TextInput
                    id="password_confirmation"
                    type="password"
                    value={data.password_confirmation}
                    className="input-field mt-1"
                    autoComplete="new-password"
                    onChange={(e) =>
                        setData('password_confirmation', e.target.value)
                    }
                />
                <InputError
                    message={errors.password_confirmation}
                    className="mt-1"
                />
            </div>

            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    disabled={processing}
                    className="btn-primary"
                >
                    Atualizar palavra-passe
                </button>
                {recentlySuccessful && (
                    <span className="text-sm text-green-700">
                        Palavra-passe atualizada.
                    </span>
                )}
            </div>
        </form>
    );
}
