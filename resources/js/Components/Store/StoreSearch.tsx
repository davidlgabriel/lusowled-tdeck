import ProductImage from '@/Components/Store/ProductImage';
import ProductPrice from '@/Components/Store/ProductPrice';
import { StoreProduct } from '@/types';
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function StoreSearch({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<StoreProduct[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setQuery('');
            setResults([]);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    useEffect(() => {
        if (!open) return;

        const trimmed = query.trim();
        if (trimmed.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(
                    `${route('products.search')}?q=${encodeURIComponent(trimmed)}`,
                    {
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    },
                );

                if (!response.ok) {
                    setResults([]);
                    return;
                }

                const data = await response.json();
                setResults(data.products ?? []);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, open]);

    const goToAllResults = useCallback(() => {
        const trimmed = query.trim();
        if (!trimmed) return;

        onClose();
        router.get(route('products.index'), { q: trimmed });
    }, [query, onClose]);

    const openProduct = useCallback(
        (slug: string) => {
            onClose();
            router.visit(route('products.show', slug));
        },
        [onClose],
    );

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh] sm:pt-[12vh]">
            <button
                type="button"
                className="absolute inset-0 bg-brand-900/50 backdrop-blur-sm"
                aria-label="Fechar pesquisa"
                onClick={onClose}
            />

            <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-xl border border-brand-200 bg-white shadow-2xl">
                <div className="flex items-center gap-3 border-b border-brand-200 px-4 py-3">
                    <svg
                        className="h-5 w-5 shrink-0 text-brand-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        aria-hidden
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        />
                    </svg>
                    <input
                        ref={inputRef}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                goToAllResults();
                            }
                        }}
                        placeholder="Pesquisar produtos por nome ou SKU..."
                        className="flex-1 border-0 bg-transparent text-base text-brand-900 placeholder:text-brand-400 focus:outline-none focus:ring-0"
                        autoComplete="off"
                    />
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md px-2 py-1 text-xs font-medium text-brand-500 hover:bg-brand-50 hover:text-brand-900"
                    >
                        Esc
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {query.trim().length < 2 ? (
                        <p className="px-4 py-8 text-center text-sm text-brand-500">
                            Escreva pelo menos 2 caracteres para pesquisar
                        </p>
                    ) : loading ? (
                        <p className="px-4 py-8 text-center text-sm text-brand-500">
                            A pesquisar...
                        </p>
                    ) : results.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-brand-500">
                            Nenhum produto encontrado para &ldquo;{query.trim()}
                            &rdquo;
                        </p>
                    ) : (
                        <ul className="divide-y divide-brand-100">
                            {results.map((product) => (
                                <li key={product.id}>
                                    <button
                                        type="button"
                                        onClick={() => openProduct(product.slug)}
                                        className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-brand-50"
                                    >
                                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-brand-100">
                                            <ProductImage
                                                product={product}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-brand-900">
                                                {product.name}
                                            </p>
                                            {product.categories?.[0] && (
                                                <p className="truncate text-xs text-brand-500">
                                                    {product.categories[0].name}
                                                </p>
                                            )}
                                            <ProductPrice
                                                product={product}
                                                size="sm"
                                            />
                                        </div>
                                        {!product.is_in_stock && (
                                            <span className="shrink-0 text-xs text-brand-500">
                                                Esgotado
                                            </span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {query.trim().length >= 2 && (
                    <div className="border-t border-brand-200 px-4 py-3">
                        <button
                            type="button"
                            onClick={goToAllResults}
                            className="w-full rounded-md py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50 hover:text-brand-900"
                        >
                            Ver todos os resultados para &ldquo;{query.trim()}
                            &rdquo;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
