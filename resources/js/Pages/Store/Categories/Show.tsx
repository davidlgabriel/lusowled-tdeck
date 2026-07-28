import Breadcrumbs from '@/Components/Store/Breadcrumbs';
import Pagination from '@/Components/Store/Pagination';
import ProductCard from '@/Components/Store/ProductCard';
import StoreLayout from '@/Layouts/StoreLayout';
import { PageProps, StoreProduct } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function CategoryShow({
    category,
    subcategories,
    products,
}: PageProps<{
    category: { id: number; name: string; slug: string; description?: string };
    subcategories: { id: number; name: string; slug: string }[];
    products: {
        data: StoreProduct[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}>) {
    return (
        <StoreLayout>
            <Head title={category.name} />

            <div className="store-container pb-16">
                <Breadcrumbs
                    items={[
                        { label: 'Início', href: route('home') },
                        { label: category.name },
                    ]}
                />

                <div className="mb-10">
                    <h1 className="store-heading">{category.name}</h1>
                    {category.description && (
                        <p className="store-subheading max-w-2xl">
                            {category.description}
                        </p>
                    )}
                </div>

                {subcategories.length > 0 && (
                    <div className="mb-10 flex flex-wrap gap-2">
                        {subcategories.map((sub) => (
                            <Link
                                key={sub.id}
                                href={route('categories.show', sub.slug)}
                                className="rounded-full border border-brand-300 px-4 py-2 text-sm font-medium text-brand-800 transition hover:border-brand-900 hover:bg-brand-50"
                            >
                                {sub.name}
                            </Link>
                        ))}
                    </div>
                )}

                {products.data.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-brand-300 bg-brand-50 py-16 text-center text-brand-600">
                        Sem produtos nesta categoria.
                    </div>
                ) : (
                    <>
                        <div className="product-grid">
                            {products.data.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                        <Pagination links={products.links} />
                    </>
                )}
            </div>
        </StoreLayout>
    );
}
