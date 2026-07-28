import Breadcrumbs from '@/Components/Store/Breadcrumbs';
import Pagination from '@/Components/Store/Pagination';
import ProductCard from '@/Components/Store/ProductCard';
import StoreLayout from '@/Layouts/StoreLayout';
import { PageProps, StoreProduct } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

export default function ProductsIndex({
    products,
    categories,
    filters,
}: PageProps<{
    products: {
        data: StoreProduct[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    categories: { id: number; name: string; slug: string }[];
    filters: {
        q: string;
        categoria: string;
        promocao: boolean;
        preco_min?: string;
        preco_max?: string;
        ordenar: string;
    };
}>) {
    const [form, setForm] = useState(filters);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        router.get(route('products.index'), form, { preserveState: true });
    };

    const resultCount = products.data.length;

    return (
        <StoreLayout>
            <Head title="Produtos" />

            <div className="store-container pb-16">
                <Breadcrumbs
                    items={[
                        { label: 'Início', href: route('home') },
                        { label: 'Produtos' },
                    ]}
                />

                <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="store-heading">Todos os produtos</h1>
                        <p className="store-subheading">
                            {resultCount > 0
                                ? `${resultCount} produtos nesta página`
                                : 'Nenhum produto encontrado'}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn-soft lg:hidden"
                        onClick={() => setFiltersOpen((o) => !o)}
                    >
                        Filtros
                    </button>
                </div>

                <div className="grid gap-8 lg:grid-cols-[248px_1fr] lg:gap-10">
                    <aside
                        className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}
                    >
                        <form
                            onSubmit={submit}
                            className="filter-panel sticky top-28 space-y-4"
                        >
                            <p className="text-sm font-medium text-brand-800">
                                Filtrar
                            </p>

                            <div>
                                <label className="text-xs font-medium text-brand-500">
                                    Pesquisa
                                </label>
                                <input
                                    type="search"
                                    value={form.q}
                                    onChange={(e) =>
                                        setForm({ ...form, q: e.target.value })
                                    }
                                    className="input-field-soft mt-1.5"
                                    placeholder="Nome ou SKU..."
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-brand-500">
                                    Categoria
                                </label>
                                <select
                                    value={form.categoria}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            categoria: e.target.value,
                                        })
                                    }
                                    className="input-field-soft mt-1.5"
                                >
                                    <option value="">Todas</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.slug}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-brand-500">
                                        Min. €
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.preco_min ?? ''}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                preco_min: e.target.value,
                                            })
                                        }
                                        className="input-field-soft mt-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-brand-500">
                                        Máx. €
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.preco_max ?? ''}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                preco_max: e.target.value,
                                            })
                                        }
                                        className="input-field-soft mt-1.5"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2.5 text-sm text-brand-700">
                                <input
                                    type="checkbox"
                                    checked={form.promocao}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            promocao: e.target.checked,
                                        })
                                    }
                                    className="h-4 w-4 rounded border-brand-300 text-brand-900 focus:ring-brand-400/40"
                                />
                                Em promoção
                            </label>

                            <div>
                                <label className="text-xs font-medium text-brand-500">
                                    Ordenar por
                                </label>
                                <select
                                    value={form.ordenar}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            ordenar: e.target.value,
                                        })
                                    }
                                    className="input-field-soft mt-1.5"
                                >
                                    <option value="recentes">Mais recentes</option>
                                    <option value="preco_asc">Preço: menor</option>
                                    <option value="preco_desc">Preço: maior</option>
                                    <option value="nome">Nome A–Z</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full rounded-lg"
                            >
                                Aplicar
                            </button>
                        </form>
                    </aside>

                    <div>
                        {products.data.length === 0 ? (
                            <div className="rounded-2xl bg-brand-50 py-16 text-center shadow-[inset_0_1px_2px_rgba(61,26,10,0.04)]">
                                <p className="text-brand-600">
                                    Nenhum produto encontrado.
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.get(route('products.index'))
                                    }
                                    className="btn-soft mt-4"
                                >
                                    Limpar filtros
                                </button>
                            </div>
                        ) : (
                            <div className="product-grid">
                                {products.data.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        )}

                        <Pagination links={products.links} />
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
