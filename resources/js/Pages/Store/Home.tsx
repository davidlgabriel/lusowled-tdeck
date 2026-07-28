import ProductCard from '@/Components/Store/ProductCard';
import SectionHeading from '@/Components/Store/SectionHeading';
import StoreLayout from '@/Layouts/StoreLayout';
import { PageProps, StoreProduct } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Home({
    featuredProducts,
    categories,
    promotions,
}: PageProps<{
    featuredProducts: StoreProduct[];
    categories: { id: number; name: string; slug: string; description?: string; image_url?: string | null }[];
    promotions: { id: number; name: string; description?: string; code?: string }[];
}>) {
    const { cms } = usePage<PageProps>().props;
    const hero = cms.appearance.hero;
    const showFeatured = cms.appearance.show_featured_products;

    return (
        <StoreLayout>
            <Head title="Início" />

            <section className="relative overflow-hidden bg-brand-100">
                <div className="store-container">
                    <div className="grid min-h-[420px] items-center gap-8 py-12 md:min-h-[520px] md:grid-cols-2 md:py-16 lg:min-h-[600px]">
                        <div className="order-2 md:order-1">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                                {hero.eyebrow}
                            </p>
                            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-brand-900 md:text-5xl lg:text-6xl">
                                {hero.title}
                            </h1>
                            <p className="mt-5 max-w-md text-base leading-relaxed text-brand-600 md:text-lg">
                                {hero.subtitle}
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <a href={hero.cta_primary.href} className="btn-primary">
                                    {hero.cta_primary.label}
                                </a>
                                <a
                                    href={hero.cta_secondary.href}
                                    className="btn-secondary"
                                >
                                    {hero.cta_secondary.label}
                                </a>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            {hero.image_url ? (
                                <div className="aspect-[4/5] overflow-hidden rounded-2xl shadow-card-hover md:aspect-square">
                                    <img
                                        src={hero.image_url}
                                        alt={hero.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-200 via-brand-100 to-white shadow-card-hover md:aspect-square" />
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="store-section">
                <div className="store-container">
                    <SectionHeading
                        title="Comprar por categoria"
                        subtitle="Decking, cladding, fencing e composite para exteriores"
                        action={{
                            label: 'Ver tudo',
                            href: route('products.index'),
                        }}
                    />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={route('categories.show', cat.slug)}
                                className="collection-tile relative aspect-[4/5] overflow-hidden sm:aspect-[3/4]"
                            >
                                {cat.image_url ? (
                                    <img
                                        src={cat.image_url}
                                        alt=""
                                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    />
                                ) : null}
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 via-brand-900/30 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-5">
                                    <h3 className="text-lg font-semibold text-white">
                                        {cat.name}
                                    </h3>
                                    {cat.description && (
                                        <p className="mt-1 line-clamp-2 text-sm text-white/80">
                                            {cat.description}
                                        </p>
                                    )}
                                    <span className="mt-3 inline-block text-sm font-medium text-white underline underline-offset-4">
                                        Explorar
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {promotions.length > 0 && (
                <section className="border-y border-brand-200 bg-brand-50">
                    <div className="store-container store-section">
                        <SectionHeading title="Campanhas ativas" />
                        <div className="grid gap-4 md:grid-cols-3">
                            {promotions.map((promo) => (
                                <div
                                    key={promo.id}
                                    className="rounded-lg border border-brand-200 bg-white p-6 shadow-card"
                                >
                                    <p className="font-semibold text-brand-900">
                                        {promo.name}
                                    </p>
                                    {promo.description && (
                                        <p className="mt-2 text-sm text-brand-500">
                                            {promo.description}
                                        </p>
                                    )}
                                    {promo.code && (
                                        <p className="mt-4 inline-block rounded-md bg-brand-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-800">
                                            {promo.code}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="store-section border-t border-brand-200 bg-brand-50">
                <div className="store-container">
                    <div className="grid items-center gap-10 lg:grid-cols-2">
                        <div className="overflow-hidden rounded-2xl shadow-card-hover">
                            <img
                                src="/storage/avidwpc/home/about.jpg"
                                alt="WPC composite decking e cladding"
                                className="aspect-[4/3] w-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                                T-DECK by True Solutions
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-brand-900">
                                Soluções WPC para o seu exterior
                            </h2>
                            <p className="mt-4 text-base leading-relaxed text-brand-600">
                                Decking, cladding e fencing em composite de alta
                                qualidade. Selecionamos os melhores produtos
                                para profissionais e particulares em Portugal.
                            </p>
                            <ul className="mt-6 space-y-3 text-sm text-brand-700">
                                <li>✓ 8 cores disponíveis — Grey, Cedar, Charcoal e mais</li>
                                <li>✓ Resistência UV e à humidade</li>
                                <li>✓ Assistência técnica e personalização</li>
                            </ul>
                            <a
                                href={route('pages.show', 'sobre-nos')}
                                className="btn-secondary mt-8 inline-flex"
                            >
                                Saber mais
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {showFeatured && featuredProducts.length > 0 && (
                <section className="store-section">
                    <div className="store-container">
                        <SectionHeading
                            title="Produtos em destaque"
                            action={{
                                label: 'Ver todos',
                                href: route('products.index'),
                            }}
                        />
                        <div className="product-grid">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </StoreLayout>
    );
}
