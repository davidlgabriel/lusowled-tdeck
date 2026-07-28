import AdminLayout from '@/Layouts/AdminLayout';
import ProductVariantsSection, {
    ProductVariantForm,
} from '@/Components/Admin/ProductVariantsSection';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useRef } from 'react';

type ProductForm = {
    id?: number;
    name: string;
    slug: string;
    sku: string;
    description: string;
    base_price: number;
    sale_price: number | '';
    status: string;
    stock_quantity: number;
    low_stock_threshold: number;
    is_featured: boolean;
    category_ids: number[];
    images?: { id: number; url: string | null; is_primary: boolean }[];
    variants?: ProductVariantForm[];
};

export default function ProductFormPage({
    product,
    categories,
}: {
    product: ProductForm | null;
    categories: { id: number; name: string }[];
}) {
    const isEdit = !!product?.id;
    const fileRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, patch, processing, errors, delete: destroy } =
        useForm({
            name: product?.name ?? '',
            slug: product?.slug ?? '',
            sku: product?.sku ?? '',
            description: product?.description ?? '',
            base_price: product?.base_price ?? 0,
            sale_price: product?.sale_price ?? '',
            status: product?.status ?? 'draft',
            stock_quantity: product?.stock_quantity ?? 0,
            low_stock_threshold: product?.low_stock_threshold ?? 5,
            is_featured: product?.is_featured ?? false,
            category_ids: product?.category_ids ?? [],
        });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            patch(route('admin.products.update', product!.id));
        } else {
            post(route('admin.products.store'));
        }
    };

    const toggleCategory = (id: number) => {
        const ids = data.category_ids.includes(id)
            ? data.category_ids.filter((c) => c !== id)
            : [...data.category_ids, id];
        setData('category_ids', ids);
    };

    const uploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !product?.id) return;

        const formData = new FormData();
        formData.append('image', file);
        router.post(route('admin.products.images.store', product.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    const removeProduct = () => {
        if (!product?.id || !confirm('Eliminar este produto?')) return;
        destroy(route('admin.products.destroy', product.id));
    };

    return (
        <AdminLayout title={isEdit ? `Editar — ${product!.name}` : 'Novo produto'}>
            <Head title={isEdit ? product!.name : 'Novo produto'} />

            <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                    <section className="card space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900">
                            Informação
                        </h2>
                        <div>
                            <label className="text-sm font-medium">Nome</label>
                            <input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="input-field mt-1.5"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium">SKU</label>
                                <input
                                    value={data.sku}
                                    onChange={(e) => setData('sku', e.target.value)}
                                    className="input-field mt-1.5"
                                />
                                {errors.sku && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.sku}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium">Slug</label>
                                <input
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder="auto se vazio"
                                    className="input-field mt-1.5"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Descrição</label>
                            <textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                rows={6}
                                className="input-field mt-1.5"
                            />
                        </div>
                    </section>

                    {isEdit && (
                        <section className="card">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900">
                                Imagens
                            </h2>
                            <div className="mt-4 flex flex-wrap gap-3">
                                {product?.images?.map((img) => (
                                    <div
                                        key={img.id}
                                        className="relative h-24 w-24 overflow-hidden rounded-lg border border-brand-200"
                                    >
                                        {img.url && (
                                            <img
                                                src={img.url}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        )}
                                        {img.is_primary && (
                                            <span className="absolute left-1 top-1 rounded bg-brand-900 px-1.5 py-0.5 text-[10px] text-white">
                                                Principal
                                            </span>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 flex gap-1 bg-black/60 p-1">
                                            {!img.is_primary && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.patch(
                                                            route(
                                                                'admin.products.images.primary',
                                                                [product!.id, img.id],
                                                            ),
                                                        )
                                                    }
                                                    className="flex-1 text-[10px] text-white underline"
                                                >
                                                    Principal
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.delete(
                                                        route(
                                                            'admin.products.images.destroy',
                                                            [product!.id, img.id],
                                                        ),
                                                    )
                                                }
                                                className="flex-1 text-[10px] text-red-300 underline"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                onChange={uploadImage}
                                className="mt-4 text-sm"
                            />
                        </section>
                    )}

                    {isEdit && product?.id && (
                        <ProductVariantsSection
                            productId={product.id}
                            variants={product.variants ?? []}
                        />
                    )}
                </div>

                <aside className="space-y-6">
                    <section className="card space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900">
                            Preço e stock
                        </h2>
                        <div>
                            <label className="text-sm font-medium">
                                Preço base (sem IVA)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.base_price}
                                onChange={(e) =>
                                    setData('base_price', Number(e.target.value))
                                }
                                className="input-field mt-1.5"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">
                                Preço promoção (sem IVA)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.sale_price}
                                onChange={(e) =>
                                    setData(
                                        'sale_price',
                                        e.target.value
                                            ? Number(e.target.value)
                                            : '',
                                    )
                                }
                                className="input-field mt-1.5"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium">Stock</label>
                                <input
                                    type="number"
                                    value={data.stock_quantity}
                                    onChange={(e) =>
                                        setData(
                                            'stock_quantity',
                                            Number(e.target.value),
                                        )
                                    }
                                    className="input-field mt-1.5"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">
                                    Alerta
                                </label>
                                <input
                                    type="number"
                                    value={data.low_stock_threshold}
                                    onChange={(e) =>
                                        setData(
                                            'low_stock_threshold',
                                            Number(e.target.value),
                                        )
                                    }
                                    className="input-field mt-1.5"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Estado</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="input-field mt-1.5"
                            >
                                <option value="active">Ativo</option>
                                <option value="draft">Rascunho</option>
                            </select>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.is_featured}
                                onChange={(e) =>
                                    setData('is_featured', e.target.checked)
                                }
                            />
                            Produto em destaque
                        </label>
                    </section>

                    <section className="card">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900">
                            Categorias
                        </h2>
                        <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
                            {categories.map((cat) => (
                                <label
                                    key={cat.id}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={data.category_ids.includes(
                                            cat.id,
                                        )}
                                        onChange={() => toggleCategory(cat.id)}
                                    />
                                    {cat.name}
                                </label>
                            ))}
                        </div>
                    </section>

                    <div className="flex flex-col gap-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-primary w-full"
                        >
                            {isEdit ? 'Guardar alterações' : 'Criar produto'}
                        </button>
                        {isEdit && (
                            <button
                                type="button"
                                onClick={removeProduct}
                                className="text-sm text-red-600 underline"
                            >
                                Eliminar produto
                            </button>
                        )}
                    </div>
                </aside>
            </form>
        </AdminLayout>
    );
}
