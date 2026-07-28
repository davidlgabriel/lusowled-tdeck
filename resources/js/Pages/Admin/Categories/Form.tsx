import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useRef } from 'react';

export default function CategoryFormPage({
    category,
    parents,
}: {
    category: {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        parent_id: number | null;
        sort_order: number;
        is_active: boolean;
        image_url?: string | null;
    } | null;
    parents: { id: number; name: string }[];
}) {
    const isEdit = !!category;
    const fileRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, patch, processing, errors } = useForm({
        name: category?.name ?? '',
        slug: category?.slug ?? '',
        description: category?.description ?? '',
        parent_id: category?.parent_id ?? '',
        sort_order: category?.sort_order ?? 0,
        is_active: category?.is_active ?? true,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            patch(route('admin.categories.update', category!.id));
        } else {
            post(route('admin.categories.store'));
        }
    };

    const uploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !category?.id) return;

        const formData = new FormData();
        formData.append('image', file);
        router.post(route('admin.categories.image.store', category.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    const removeImage = () => {
        if (!category?.id || !category.image_url) return;
        if (!confirm('Remover a imagem desta categoria?')) return;
        router.delete(route('admin.categories.image.destroy', category.id), {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout title={isEdit ? `Editar — ${category!.name}` : 'Nova categoria'}>
            <Head title={isEdit ? category!.name : 'Nova categoria'} />

            <form
                onSubmit={submit}
                className="max-w-xl space-y-5 rounded-lg border border-brand-200 bg-white p-6 shadow-card"
            >
                <div>
                    <label className="text-sm font-medium">Nome</label>
                    <input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="input-field mt-1.5"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
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
                <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        rows={3}
                        className="input-field mt-1.5"
                    />
                </div>

                {isEdit && (
                    <div>
                        <label className="text-sm font-medium">
                            Imagem da categoria
                        </label>
                        <p className="text-xs text-brand-500">
                            Aparece na homepage em &quot;Comprar por categoria&quot;
                            (categorias raiz).
                        </p>
                        <div className="mt-3 flex flex-wrap items-start gap-4">
                            {category?.image_url ? (
                                <div className="relative h-32 w-24 overflow-hidden rounded-lg border border-brand-200">
                                    <img
                                        src={category.image_url}
                                        alt={category.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-32 w-24 items-center justify-center rounded-lg border border-dashed border-brand-300 bg-brand-50 text-xs text-brand-500">
                                    Sem imagem
                                </div>
                            )}
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="btn-secondary"
                                >
                                    {category?.image_url
                                        ? 'Substituir imagem'
                                        : 'Carregar imagem'}
                                </button>
                                {category?.image_url && (
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="block text-sm text-red-600 underline"
                                    >
                                        Remover imagem
                                    </button>
                                )}
                            </div>
                        </div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={uploadImage}
                        />
                    </div>
                )}

                <div>
                    <label className="text-sm font-medium">Categoria pai</label>
                    <select
                        value={data.parent_id}
                        onChange={(e) =>
                            setData(
                                'parent_id',
                                e.target.value ? Number(e.target.value) : '',
                            )
                        }
                        className="input-field mt-1.5"
                    >
                        <option value="">Nenhuma (raiz)</option>
                        {parents.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">Ordem</label>
                    <input
                        type="number"
                        value={data.sort_order}
                        onChange={(e) =>
                            setData('sort_order', Number(e.target.value))
                        }
                        className="input-field mt-1.5 w-32"
                    />
                </div>
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                    />
                    Categoria ativa
                </label>
                <button type="submit" disabled={processing} className="btn-primary">
                    {isEdit ? 'Guardar' : 'Criar categoria'}
                </button>

                {!isEdit && (
                    <p className="text-xs text-brand-500">
                        Depois de criar a categoria, pode adicionar a imagem na
                        página de edição.
                    </p>
                )}
            </form>
        </AdminLayout>
    );
}
