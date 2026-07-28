import { CmsContent, StoreBranding } from '@/types';
import { Link } from '@inertiajs/react';

export default function StoreFooter({
    store,
    cms,
}: {
    store: StoreBranding;
    cms: CmsContent;
}) {
    return (
        <footer className="mt-auto border-t border-brand-200 bg-brand-50">
            <div className="store-container py-12 md:py-16">
                <div className="grid gap-10 md:grid-cols-2">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-900">
                            Apoio ao cliente
                        </p>
                        <ul className="mt-5 space-y-3">
                            <li>
                                <Link
                                    href={route('contact.index')}
                                    className="font-serif text-sm text-brand-700 transition hover:text-brand-900 hover:underline"
                                >
                                    Contacte-nos
                                </Link>
                            </li>
                            {cms.footer.customer_support.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="font-serif text-sm text-brand-700 transition hover:text-brand-900 hover:underline"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-10">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-900">
                                Informações legais
                            </p>
                            <ul className="mt-5 space-y-3">
                                {cms.footer.legal.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="font-serif text-sm text-brand-700 transition hover:text-brand-900 hover:underline"
                                        >
                                            {link.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {cms.payment_methods.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-900">
                                    Métodos de pagamento
                                </p>
                                <div className="mt-5 flex flex-wrap items-center gap-6">
                                    {cms.payment_methods.map((method) => (
                                        <img
                                            key={method.name}
                                            src={method.image_url}
                                            alt={method.name}
                                            className="h-8 w-auto max-w-[100px] object-contain opacity-80"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 border-t border-brand-200 pt-8">
                    <p className="text-lg font-semibold text-brand-900">
                        {store.name}
                    </p>
                    <p className="mt-2 max-w-xl text-sm text-brand-500">
                        {cms.appearance.footer_tagline}
                    </p>
                    <div className="mt-6 flex flex-col items-start justify-between gap-2 text-xs text-brand-500 sm:flex-row sm:items-center">
                        <p>
                            © {new Date().getFullYear()} {store.name}. Todos os
                            direitos reservados.
                        </p>
                        <p>Preços sem IVA · IVA calculado no checkout</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
