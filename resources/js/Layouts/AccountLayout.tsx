import FlashMessage from '@/Components/FlashMessage';
import StoreLogo from '@/Components/Store/StoreLogo';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';

const navItems = [
    { href: 'account.dashboard', label: 'Resumo' },
    { href: 'account.orders.index', label: 'Encomendas' },
    { href: 'account.addresses.index', label: 'Moradas' },
    { href: 'account.profile', label: 'Perfil' },
];

export default function AccountLayout({
    children,
    title,
}: PropsWithChildren<{ title?: string }>) {
    const { auth, store } = usePage<PageProps>().props;
    const user = auth.user!;

    return (
        <div className="min-h-screen bg-white">
            <header className="border-b border-brand-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                    <StoreLogo store={store} />
                    <div className="flex items-center gap-4 text-sm">
                        <span className="hidden text-brand-600 sm:inline">
                            {user.name}
                        </span>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-brand-600 underline hover:text-brand-900"
                        >
                            Sair
                        </Link>
                    </div>
                </div>
            </header>

            <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[240px_1fr]">
                <aside className="lg:sticky lg:top-8 lg:self-start">
                    <nav
                        className="space-y-1 rounded-xl border border-brand-200 bg-brand-50 p-2"
                        aria-label="Área de cliente"
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={route(item.href)}
                                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                    route().current(item.href)
                                        ? 'bg-brand-900 text-white shadow-sm'
                                        : 'text-brand-700 hover:bg-white hover:text-brand-900'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="mt-6 border-t border-brand-200 pt-6">
                        <Link
                            href={route('products.index')}
                            className="text-sm font-medium text-brand-600 underline hover:text-brand-900"
                        >
                            ← Continuar a comprar
                        </Link>
                    </div>
                </aside>

                <main>
                    {title && (
                        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-brand-900 md:text-3xl">
                            {title}
                        </h1>
                    )}
                    <FlashMessage />
                    {children}
                </main>
            </div>
        </div>
    );
}
