import StoreLogo from '@/Components/Store/StoreLogo';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome({
    canLogin,
    canRegister,
}: PageProps<{ canLogin: boolean; canRegister: boolean }>) {
    const { store, auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Início" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-brand-50 px-6">
                <StoreLogo store={store} className="mb-4" />
                <p className="mb-10 max-w-md text-center text-brand-600">
                    Equipamento e consumíveis de soldadura para profissionais.
                    A loja abre na Fase 4.
                </p>
                <div className="flex gap-4">
                    {auth.user ? (
                        <Link href={route('account.dashboard')} className="btn-primary">
                            A minha conta
                        </Link>
                    ) : (
                        <>
                            {canLogin && (
                                <Link href={route('login')} className="btn-secondary">
                                    Entrar
                                </Link>
                            )}
                            {canRegister && (
                                <Link href={route('register')} className="btn-primary">
                                    Criar conta
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
