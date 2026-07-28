import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function PaymentMethodsIndex({
    methods,
}: {
    methods: {
        id: number;
        name: string;
        image_url: string;
        sort_order: number;
        is_active: boolean;
    }[];
}) {
    const remove = (id: number) => {
        if (!confirm('Eliminar este método?')) return;
        router.delete(route('admin.payment-methods.destroy', id));
    };

    return (
        <AdminLayout
            title="Métodos de pagamento"
            actions={
                <Link
                    href={route('admin.payment-methods.create')}
                    className="btn-primary"
                >
                    Adicionar
                </Link>
            }
        >
            <Head title="Admin — Métodos de pagamento" />

            <p className="mb-6 text-sm text-brand-500">
                Logótipos exibidos no footer (MB WAY, Multibanco, etc.)
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {methods.map((method) => (
                    <div
                        key={method.id}
                        className="card flex flex-col items-center text-center"
                    >
                        <img
                            src={method.image_url}
                            alt={method.name}
                            className="h-10 object-contain"
                        />
                        <p className="mt-3 font-medium">{method.name}</p>
                        <p className="text-xs text-brand-500">
                            {method.is_active ? 'Ativo' : 'Inativo'}
                        </p>
                        <div className="mt-4 flex gap-3 text-sm">
                            <Link
                                href={route(
                                    'admin.payment-methods.edit',
                                    method.id,
                                )}
                                className="underline"
                            >
                                Editar
                            </Link>
                            <button
                                type="button"
                                onClick={() => remove(method.id)}
                                className="text-red-600 underline"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
