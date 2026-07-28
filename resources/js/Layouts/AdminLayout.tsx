import FlashMessage from '@/Components/FlashMessage';
import StoreLogo from '@/Components/Store/StoreLogo';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

const nav = [
    { href: 'admin.dashboard', label: 'Dashboard' },
    { href: 'admin.products.index', label: 'Produtos' },
    { href: 'admin.categories.index', label: 'Categorias' },
    { href: 'admin.pages.index', label: 'Páginas' },
    { href: 'admin.navigation.index', label: 'Navegação' },
    { href: 'admin.payment-methods.index', label: 'Pagamentos' },
    { href: 'admin.appearance.index', label: 'Aparência' },
    { href: 'admin.promotions.index', label: 'Promoções' },
    { href: 'admin.orders.index', label: 'Encomendas' },
    { href: 'admin.stock.index', label: 'Stock' },
    { href: 'admin.settings.index', label: 'Configurações' },
    { href: 'admin.two-factor.show', label: 'Segurança' },
];

export default function AdminLayout({
    children,
    title,
    actions,
}: PropsWithChildren<{
    title?: string;
    actions?: React.ReactNode;
}>) {
    const { store, auth } = usePage<PageProps>().props;

    return (
        <div className="flex min-h-screen bg-brand-50">
            <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-brand-200 bg-white">
                <div className="border-b border-brand-200 px-5 py-5">
                    <StoreLogo store={store} />
                    <p className="mt-2 text-xs font-medium uppercase tracking-widest text-brand-500">
                        Administração
                    </p>
                </div>

                <nav className="flex-1 space-y-0.5 p-3" aria-label="Admin">
                    {nav.map((item) => (
                        <Link
                            key={item.href}
                            href={route(item.href)}
                            className={`block rounded-md px-3 py-2.5 text-sm font-medium transition ${
                                route().current(item.href) ||
                                route().current(item.href.replace('.index', '.*'))
                                    ? 'bg-brand-900 text-white'
                                    : 'text-brand-700 hover:bg-brand-100 hover:text-brand-900'
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="border-t border-brand-200 p-4 text-sm">
                    <p className="truncate font-medium text-brand-900">
                        {auth.user?.name}
                    </p>
                    <div className="mt-2 flex flex-col gap-1.5">
                        <Link
                            href={route('home')}
                            className="text-brand-600 hover:text-brand-900 hover:underline"
                        >
                            Ver loja
                        </Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-left text-brand-600 hover:text-brand-900 hover:underline"
                        >
                            Sair
                        </Link>
                    </div>
                </div>
            </aside>

            <div className="flex min-h-screen flex-1 flex-col pl-60">
                {(title || actions) && (
                    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-200 bg-white/95 px-8 py-5 backdrop-blur">
                        {title && (
                            <h1 className="text-xl font-semibold tracking-tight text-brand-900 md:text-2xl">
                                {title}
                            </h1>
                        )}
                        {actions && <div className="flex gap-3">{actions}</div>}
                    </header>
                )}

                <main className="flex-1 px-8 py-8">
                    <FlashMessage />
                    {children}
                </main>
            </div>
        </div>
    );
}
