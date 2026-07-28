import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import AddressLocationFields from '@/Components/Store/AddressLocationFields';
import AccountLayout from '@/Layouts/AccountLayout';
import { Address, PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

const emptyForm = {
    type: 'billing' as 'billing' | 'shipping',
    label: '',
    name: '',
    tax_id: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'PT',
    phone: '',
    is_default: false,
};

export default function AddressesIndex({
    addresses,
}: PageProps<{ addresses: Address[] }>) {
    const { auth } = usePage<PageProps>().props;
    const [editing, setEditing] = useState<Address | null>(null);
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        ...emptyForm,
        name: auth.user?.name ?? '',
    });

    const openCreate = () => {
        reset();
        setData({ ...emptyForm, name: auth.user?.name ?? '' });
        setEditing(null);
        setShowForm(true);
    };

    const openEdit = (address: Address) => {
        setEditing(address);
        setData({
            type: address.type as 'billing' | 'shipping',
            label: address.label ?? '',
            name: address.name,
            tax_id: address.tax_id ?? '',
            address_line_1: address.address_line_1,
            address_line_2: address.address_line_2 ?? '',
            city: address.city,
            state: address.state ?? '',
            postal_code: address.postal_code,
            country: address.country,
            phone: address.phone ?? '',
            is_default: address.is_default,
        });
        setShowForm(true);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (editing) {
            patch(route('account.addresses.update', editing.id), {
                onSuccess: () => {
                    setShowForm(false);
                    setEditing(null);
                },
            });
        } else {
            post(route('account.addresses.store'), {
                onSuccess: () => {
                    setShowForm(false);
                    reset();
                },
            });
        }
    };

    const remove = (address: Address) => {
        if (confirm('Remover esta morada?')) {
            router.delete(route('account.addresses.destroy', address.id));
        }
    };

    return (
        <AccountLayout title="Moradas">
            <Head title="Moradas" />

            <div className="mb-6 flex justify-end">
                <button type="button" onClick={openCreate} className="btn-primary">
                    Adicionar morada
                </button>
            </div>

            {showForm && (
                <form onSubmit={submit} className="card mb-8 max-w-2xl space-y-4">
                    <h2 className="font-display text-lg font-semibold">
                        {editing ? 'Editar morada' : 'Nova morada'}
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel value="Tipo" />
                            <select
                                value={data.type}
                                onChange={(e) =>
                                    setData(
                                        'type',
                                        e.target.value as 'billing' | 'shipping',
                                    )
                                }
                                className="input-field mt-1"
                            >
                                <option value="billing">Faturação</option>
                                <option value="shipping">Envio</option>
                            </select>
                            <InputError message={errors.type} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel value="Etiqueta (opcional)" />
                            <TextInput
                                value={data.label}
                                className="input-field mt-1"
                                placeholder="Casa, Escritório..."
                                onChange={(e) => setData('label', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel value="Nome" />
                            <TextInput
                                value={data.name}
                                className="input-field mt-1"
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel value="NIF (opcional)" />
                            <TextInput
                                value={data.tax_id}
                                className="input-field mt-1"
                                onChange={(e) => setData('tax_id', e.target.value)}
                            />
                        </div>
                    </div>

                    <AddressLocationFields
                        values={{
                            address_line_1: data.address_line_1,
                            address_line_2: data.address_line_2,
                            city: data.city,
                            state: data.state,
                            postal_code: data.postal_code,
                            country: data.country,
                        }}
                        onChange={(field, value) => setData(field, value)}
                        errors={errors}
                    />

                    <div>
                        <InputLabel value="Telefone" />
                        <TextInput
                            value={data.phone}
                            className="input-field mt-1"
                            onChange={(e) => setData('phone', e.target.value)}
                        />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={data.is_default}
                            onChange={(e) =>
                                setData('is_default', e.target.checked)
                            }
                            className="rounded border-brand-300 text-brand-accent focus:ring-brand-accent"
                        />
                        Morada predefinida
                    </label>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-primary"
                        >
                            Guardar
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {addresses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50 p-10 text-center">
                    <p className="text-brand-700">
                        Ainda não tem moradas guardadas.
                    </p>
                    <p className="mt-2 text-sm text-brand-600">
                        As moradas de faturação e envio são guardadas
                        automaticamente após uma encomenda paga.
                    </p>
                    <button
                        type="button"
                        onClick={openCreate}
                        className="btn-primary mt-6"
                    >
                        Adicionar morada
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {addresses.map((address) => (
                        <div key={address.id} className="card">
                            <div className="mb-3 flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
                                        {address.type_label}
                                        {address.label && ` · ${address.label}`}
                                    </p>
                                    <p className="font-medium">{address.name}</p>
                                </div>
                                {address.is_default && (
                                    <span className="rounded-sm bg-brand-100 px-2 py-0.5 text-xs text-brand-700">
                                        Predefinida
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-brand-700">
                                {address.formatted}
                            </p>
                            <div className="mt-4 flex gap-3 text-sm">
                                <button
                                    type="button"
                                    onClick={() => openEdit(address)}
                                    className="text-brand-accent underline"
                                >
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => remove(address)}
                                    className="text-red-700 underline"
                                >
                                    Remover
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AccountLayout>
    );
}
