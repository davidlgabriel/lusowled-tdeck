import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useRef } from 'react';

export default function PaymentMethodForm({
    method,
}: {
    method: {
        id: number;
        name: string;
        image_url: string;
        sort_order: number;
        is_active: boolean;
    } | null;
}) {
    const isEdit = !!method;
    const fileRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing } = useForm({
        name: method?.name ?? '',
        sort_order: method?.sort_order ?? 0,
        is_active: method?.is_active ?? true,
        image: null as File | null,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('sort_order', String(data.sort_order));
        formData.append('is_active', data.is_active ? '1' : '0');
        if (data.image) {
            formData.append('image', data.image);
        }

        if (isEdit) {
            formData.append('_method', 'patch');
            router.post(
                route('admin.payment-methods.update', method!.id),
                formData,
                { forceFormData: true },
            );
        } else {
            router.post(route('admin.payment-methods.store'), formData, {
                forceFormData: true,
            });
        }
    };

    return (
        <AdminLayout
            title={isEdit ? `Editar — ${method!.name}` : 'Novo método'}
        >
            <Head title="Método de pagamento" />

            <form
                onSubmit={submit}
                className="max-w-md space-y-4 rounded-lg border border-brand-200 bg-white p-6 shadow-card"
            >
                {isEdit && (
                    <img
                        src={method!.image_url}
                        alt={method!.name}
                        className="h-12 object-contain"
                    />
                )}
                <div>
                    <label className="text-sm font-medium">Nome</label>
                    <input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="input-field mt-1.5"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">
                        Imagem {isEdit && '(opcional)'}
                    </label>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            setData('image', e.target.files?.[0] ?? null)
                        }
                        className="mt-1.5 text-sm"
                        required={!isEdit}
                    />
                </div>
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
                <button type="submit" disabled={processing} className="btn-primary">
                    {isEdit ? 'Guardar' : 'Criar'}
                </button>
            </form>
        </AdminLayout>
    );
}
