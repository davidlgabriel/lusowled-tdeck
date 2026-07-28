import StoreLogo from '@/Components/Store/StoreLogo';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function AuthLayout({ children }: PropsWithChildren) {
    const { store } = usePage<PageProps>().props;

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
                <div className="mb-10 text-center">
                    <StoreLogo store={store} className="justify-center" />
                    <p className="mt-3 text-sm text-brand-600">
                        Equipamento WPC composite — T-DECK by True Solutions
                    </p>
                </div>

                <div className="card">{children}</div>

                <p className="mt-8 text-center text-sm text-brand-500">
                    <Link href="/" className="underline hover:text-brand-800">
                        Voltar à loja
                    </Link>
                </p>
            </div>
        </div>
    );
}
