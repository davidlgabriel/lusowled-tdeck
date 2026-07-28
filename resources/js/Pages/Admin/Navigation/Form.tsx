import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function NavigationForm({
    item,
    types,
    pages,
    categories,
}: {
    item: {
        id: number;
        label: string;
        type: string;
        target: string | null;
        sort_order: number;
        is_active: boolean;
        open_in_new_tab: boolean;
    } | null;
    types: { value: string; label: string }[];
    pages: { slug: string; title: string }[];
    categories: { slug: string; name: string }[];
}) {
    const isEdit = !!item;

    const { data, setData, post, patch, processing } = useForm({
        label: item?.label ?? '',
        type: item?.type ?? 'products',
        target: item?.target ?? '',
        sort_order: item?.sort_order ?? 0,
        is_active: item?.is_active ?? true,
        open_in_new_tab: item?.open_in_new_tab ?? false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            patch(route('admin.navigation.update', item!.id));
        } else {
            post(route('admin.navigation.store'));
        }
    };

    const needsTarget = ['page', 'category', 'url'].includes(data.type);

    return (
        <AdminLayout title={isEdit ? 'Editar navegação' : 'Novo item'}>
            <Head title="Navegação" />

            <form
                onSubmit={submit}
                className="max-w-xl space-y-4 rounded-lg border border-brand-200 bg-white p-6 shadow-card"
            >
                <div>
                    <label className="text-sm font-medium">Texto do menu</label>
                    <input
                        value={data.label}
                        onChange={(e) => setData('label', e.target.value)}
                        className="input-field mt-1.5"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">Tipo</label>
                    <select
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                        className="input-field mt-1.5"
                    >
                        {types.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                </div>

                {needsTarget && (
                    <div>
                        <label className="text-sm font-medium">Destino</label>
                        {data.type === 'page' ? (
                            <select
                                value={data.target}
                                onChange={(e) =>
                                    setData('target', e.target.value)
                                }
                                className="input-field mt-1.5"
                            >
                                <option value="">Selecionar página</option>
                                {pages.map((p) => (
                                    <option key={p.slug} value={p.slug}>
                                        {p.title}
                                    </option>
                                ))}
                            </select>
                        ) : data.type === 'category' ? (
                            <select
                                value={data.target}
                                onChange={(e) =>
                                    setData('target', e.target.value)
                                }
                                className="input-field mt-1.5"
                            >
                                <option value="">Selecionar categoria</option>
                                {categories.map((c) => (
                                    <option key={c.slug} value={c.slug}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                value={data.target}
                                onChange={(e) =>
                                    setData('target', e.target.value)
                                }
                                placeholder="https://..."
                                className="input-field mt-1.5"
                            />
                        )}
                    </div>
                )}

                <div>
                    <label className="text-sm font-medium">Ordem</label>
                    <input
                        type="number"
                        value={data.sort_order}
                        onChange={(e) =>
                            setData('sort_order', Number(e.target.value))
                        }
                        className="input-field mt-1.5 w-24"
                    />
                </div>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                    />
                    Ativo
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={data.open_in_new_tab}
                        onChange={(e) =>
                            setData('open_in_new_tab', e.target.checked)
                        }
                    />
                    Abrir em nova aba
                </label>

                <button type="submit" disabled={processing} className="btn-primary">
                    {isEdit ? 'Guardar' : 'Criar'}
                </button>
            </form>
        </AdminLayout>
    );
}
