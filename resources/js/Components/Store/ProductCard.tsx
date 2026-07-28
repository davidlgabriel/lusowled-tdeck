import ProductCardActions from '@/Components/Store/ProductCardActions';
import ProductImage from '@/Components/Store/ProductImage';
import ProductPrice from '@/Components/Store/ProductPrice';
import SaleBadge from '@/Components/Store/SaleBadge';
import { StoreProduct } from '@/types';
import { Link } from '@inertiajs/react';

export default function ProductCard({ product }: { product: StoreProduct }) {
    return (
        <article className="group flex h-full flex-col">
            <Link
                href={route('products.show', product.slug)}
                className="relative block aspect-square overflow-hidden rounded-lg bg-brand-100"
            >
                <ProductImage
                    product={product}
                    className="h-full w-full transition duration-500 ease-out group-hover:scale-105"
                />
                {product.is_on_sale && product.sale_price !== null && (
                    <SaleBadge
                        basePrice={product.base_price}
                        salePrice={product.sale_price}
                    />
                )}
                {!product.is_in_stock && (
                    <span className="absolute inset-0 flex items-center justify-center bg-white/60 text-sm font-medium text-brand-900">
                        Esgotado
                    </span>
                )}
            </Link>

            <ProductCardActions product={product} />

            <Link
                href={route('products.show', product.slug)}
                className="mt-3 flex flex-1 flex-col space-y-1"
            >
                {product.categories?.[0] && (
                    <p className="text-xs text-brand-500">
                        {product.categories[0].name}
                    </p>
                )}
                <h3 className="text-sm font-medium leading-snug text-brand-900 transition group-hover:underline md:text-base">
                    {product.name}
                </h3>
                <ProductPrice product={product} size="sm" />
            </Link>
        </article>
    );
}
