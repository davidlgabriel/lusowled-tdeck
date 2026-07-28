import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout>
            <Head title="Confirmar palavra-passe" />

            <h1 className="font-display mb-4 text-2xl font-semibold">
                Confirmar palavra-passe
            </h1>

            <p className="mb-6 text-sm text-brand-600">
                Por segurança, confirme a sua palavra-passe antes de continuar.
            </p>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="password" value="Palavra-passe" />
                    <TextInput
                        id="password"
                        type="password"
                        value={data.password}
                        className="input-field mt-1"
                        isFocused
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <button type="submit" disabled={processing} className="btn-primary">
                    Confirmar
                </button>
            </form>
        </AuthLayout>
    );
}
