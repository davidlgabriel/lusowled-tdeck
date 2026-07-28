import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function PromotionFormPage({
    promotion,
    products,
    categories,
}: {
    promotion: {
        id: number;
        name: string;
        code: string | null;
        description: string | null;
        type: string;
        value: number;
        applies_to: string;
        starts_at: string | null;
        ends_at: string | null;
        usage_limit: number | null;
        is_active: boolean;
        product_ids: number[];
        category_ids: number[];
    } | null;
    products: { id: number; name: string }[];
    categories: { id: number; name: string }[];
}) {
    const isEdit = !!promotion;

    const { data, setData, post, patch, processing, errors } = useForm({
        name: promotion?.name ?? '',
        code: promotion?.code ?? '',
        description: promotion?.description ?? '',
        type: promotion?.type ?? 'percentage',
        value: promotion?.value ?? 10,
        applies_to: promotion?.applies_to ?? 'all',
        starts_at: promotion?.starts_at ?? '',
        ends_at: promotion?.ends_at ?? '',
        usage_limit: promotion?.usage_limit ?? '',
        is_active: promotion?.is_active ?? true,
        product_ids: promotion?.product_ids ?? [],
        category_ids: promotion?.category_ids ?? [],
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            patch(route('admin.promotions.update', promotion!.id));
        } else {
            post(route('admin.promotions.store'));
        }
    };

    const toggleId = (
        field: 'product_ids' | 'category_ids',
        id: number,
    ) => {
        const ids = data[field].includes(id)
            ? data[field].filter((x) => x !== id)
            : [...data[field], id];
        setData(field, ids);
    };

    return (
        <AdminLayout title={isEdit ? `Editar — ${promotion!.name}` : 'Nova promoção'}>
            <Head title={isEdit ? promotion!.name : 'Nova promoção'} />

            <form
                onSubmit={submit}
                className="max-w-2xl space-y-5 rounded-lg border border-brand-200 bg-white p-6 shadow-card"
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
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
                        <label className="text-sm font-medium">Código</label>
                        <input
                            value={data.code}
                            onChange={(e) =>
                                setData('code', e.target.value.toUpperCase())
                            }
                            className="input-field mt-1.5 uppercase"
                            placeholder="BEMVINDO10"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Tipo</label>
                        <select
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            className="input-field mt-1.5"
                        >
                            <option value="percentage">Percentagem</option>
                            <option value="fixed_amount">Valor fixo</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Valor</label>
                        <input
                            type="number"
                            step="0.01"
                            value={data.value}
                            onChange={(e) =>
                                setData('value', Number(e.target.value))
                            }
                            className="input-field mt-1.5"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Aplica-se a</label>
                        <select
                            value={data.applies_to}
                            onChange={(e) =>
                                setData('applies_to', e.target.value)
                            }
                            className="input-field mt-1.5"
                        >
                            <option value="all">Toda a loja</option>
                            <option value="product">Produtos específicos</option>
                            <option value="category">Categorias específicas</option>
                        </select>
                    </div>
                </div>

                {data.applies_to === 'product' && (
                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-brand-200 p-3">
                        {products.map((p) => (
                            <label
                                key={p.id}
                                className="flex items-center gap-2 text-sm"
                            >
                                <input
                                    type="checkbox"
                                    checked={data.product_ids.includes(p.id)}
                                    onChange={() =>
                                        toggleId('product_ids', p.id)
                                    }
                                />
                                {p.name}
                            </label>
                        ))}
                    </div>
                )}

                {data.applies_to === 'category' && (
                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-brand-200 p-3">
                        {categories.map((c) => (
                            <label
                                key={c.id}
                                className="flex items-center gap-2 text-sm"
                            >
                                <input
                                    type="checkbox"
                                    checked={data.category_ids.includes(c.id)}
                                    onChange={() =>
                                        toggleId('category_ids', c.id)
                                    }
                                />
                                {c.name}
                            </label>
                        ))}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-sm font-medium">Início</label>
                        <input
                            type="datetime-local"
                            value={data.starts_at}
                            onChange={(e) =>
                                setData('starts_at', e.target.value)
                            }
                            className="input-field mt-1.5"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Fim</label>
                        <input
                            type="datetime-local"
                            value={data.ends_at}
                            onChange={(e) => setData('ends_at', e.target.value)}
                            className="input-field mt-1.5"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium">
                        Limite de utilizações
                    </label>
                    <input
                        type="number"
                        value={data.usage_limit}
                        onChange={(e) =>
                            setData(
                                'usage_limit',
                                e.target.value ? Number(e.target.value) : '',
                            )
                        }
                        className="input-field mt-1.5 w-40"
                        placeholder="Ilimitado"
                    />
                </div>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                    />
                    Promoção ativa
                </label>

                <button type="submit" disabled={processing} className="btn-primary">
                    {isEdit ? 'Guardar' : 'Criar promoção'}
                </button>
            </form>
        </AdminLayout>
    );
}
