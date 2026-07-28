import CartDrawer from '@/Components/Store/CartDrawer';
import CartToast from '@/Components/Store/CartToast';
import FlashMessage from '@/Components/FlashMessage';
import SalesDisabledNotice from '@/Components/Store/SalesDisabledNotice';
import StoreFooter from '@/Components/Store/StoreFooter';
import StoreSearch from '@/Components/Store/StoreSearch';
import StoreLogo, {
    CartIcon,
    MenuIcon,
    SearchIcon,
    UserIcon,
} from '@/Components/Store/StoreLogo';
import { CartDrawerProvider, useCartDrawer } from '@/Contexts/CartDrawerContext';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';

function StoreLayoutContent({ children }: PropsWithChildren) {
    const { auth, store, cart, cms } = usePage<PageProps>().props;
    const { openDrawer } = useCartDrawer();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const accountHref = auth.user
        ? route('account.dashboard')
        : route('login');

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <header className="sticky top-0 z-50 border-b border-brand-200 bg-white/95 backdrop-blur-md">
                <div className="store-container">
                    <div className="flex h-16 items-center justify-between gap-4 lg:h-[72px]">
                        <button
                            type="button"
                            className="icon-btn lg:hidden"
                            onClick={() => setMobileOpen((o) => !o)}
                            aria-label="Menu"
                            aria-expanded={mobileOpen}
                        >
                            <MenuIcon />
                        </button>

                        <div className="flex flex-1 items-center justify-center lg:justify-start">
                            <StoreLogo store={store} />
                        </div>

                        <nav
                            className="hidden items-center gap-8 lg:flex"
                            aria-label="Principal"
                        >
                            {cms.navigation.map((item) => (
                                <a
                                    key={`${item.label}-${item.href}`}
                                    href={item.href}
                                    target={
                                        item.open_in_new_tab
                                            ? '_blank'
                                            : undefined
                                    }
                                    rel={
                                        item.open_in_new_tab
                                            ? 'noopener noreferrer'
                                            : undefined
                                    }
                                    className="nav-link"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>

                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                type="button"
                                onClick={() => setSearchOpen(true)}
                                className="icon-btn"
                                aria-label="Pesquisar produtos"
                            >
                                <SearchIcon />
                            </button>

                            {auth.user?.is_admin && (
                                <Link
                                    href={route('admin.dashboard')}
                                    className="btn-ghost hidden text-xs sm:inline-flex"
                                >
                                    Admin
                                </Link>
                            )}

                            <Link
                                href={accountHref}
                                className="icon-btn"
                                aria-label="Conta"
                            >
                                <UserIcon />
                            </Link>

                            <button
                                type="button"
                                onClick={openDrawer}
                                className="icon-btn"
                                aria-label="Carrinho"
                            >
                                <CartIcon />
                                {cart.item_count > 0 && (
                                    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-900 px-1 text-[10px] font-semibold text-white">
                                        {cart.item_count}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {mobileOpen && (
                    <nav
                        className="border-t border-brand-200 bg-white lg:hidden"
                        aria-label="Menu móvel"
                    >
                        <div className="store-container space-y-1 py-4">
                            {cms.navigation.map((item) => (
                                <a
                                    key={`${item.label}-${item.href}`}
                                    href={item.href}
                                    target={
                                        item.open_in_new_tab
                                            ? '_blank'
                                            : undefined
                                    }
                                    rel={
                                        item.open_in_new_tab
                                            ? 'noopener noreferrer'
                                            : undefined
                                    }
                                    className="block rounded-md px-3 py-2.5 text-sm font-medium text-brand-900 hover:bg-brand-50"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {item.label}
                                </a>
                            ))}
                            <Link
                                href={accountHref}
                                className="block rounded-md px-3 py-2.5 text-sm text-brand-700 hover:bg-brand-50"
                                onClick={() => setMobileOpen(false)}
                            >
                                {auth.user ? 'A minha conta' : 'Entrar'}
                            </Link>
                        </div>
                    </nav>
                )}
            </header>

            {!store.sales_enabled && (
                <div className="border-b border-amber-200 bg-amber-50">
                    <div className="store-container py-3">
                        <SalesDisabledNotice compact />
                    </div>
                </div>
            )}

            <FlashMessage />
            <CartToast />
            <CartDrawer />

            <main className="flex-1 pt-6 md:pt-8">{children}</main>

            <StoreFooter store={store} cms={cms} />

            <StoreSearch
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
            />
        </div>
    );
}

export default function StoreLayout({ children }: PropsWithChildren) {
    return (
        <CartDrawerProvider>
            <StoreLayoutContent>{children}</StoreLayoutContent>
        </CartDrawerProvider>
    );
}
