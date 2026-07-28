import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useRef } from 'react';

export default function AppearanceIndex({
    settings,
}: {
    settings: {
        key: string;
        label: string;
        description: string | null;
        type: string;
        value: string;
        asset_url: string | null;
    }[];
}) {
    const fileRef = useRef<HTMLInputElement>(null);

    const initial: Record<string, string> = {};
    settings.forEach((s) => {
        initial[s.key] = String(s.value ?? '');
    });

    const { data, setData, patch, processing } = useForm({
        group: 'appearance',
        settings: initial,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(route('admin.appearance.update'), { preserveScroll: true });
    };

    const uploadHero = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        router.post(route('admin.appearance.hero'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    const heroSetting = settings.find((s) => s.key === 'store.home_hero_image');

    return (
        <AdminLayout title="Aparência">
            <Head title="Admin — Aparência" />

            <div className="grid gap-8 lg:grid-cols-2">
                <section className="card">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900">
                        Homepage — Hero
                    </h2>
                    {heroSetting?.asset_url && (
                        <img
                            src={heroSetting.asset_url}
                            alt="Hero"
                            className="mt-4 max-h-48 w-full rounded-lg object-cover"
                        />
                    )}
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={uploadHero}
                        className="mt-4 text-sm"
                    />
                    <p className="mt-2 text-xs text-brand-500">
                        Imagem principal da homepage (recomendado: 1200×1200px)
                    </p>
                </section>

                <form onSubmit={submit} className="card space-y-4">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900">
                        Textos do site
                    </h2>

                    {settings
                        .filter((s) => s.key !== 'store.home_hero_image')
                        .map((setting) => (
                            <div key={setting.key}>
                                <label className="text-sm font-medium">
                                    {setting.label}
                                </label>
                                {setting.type === 'text' ? (
                                    <textarea
                                        value={data.settings[setting.key]}
                                        onChange={(e) =>
                                            setData('settings', {
                                                ...data.settings,
                                                [setting.key]: e.target.value,
                                            })
                                        }
                                        rows={3}
                                        className="input-field mt-1.5"
                                    />
                                ) : (
                                    <input
                                        value={data.settings[setting.key]}
                                        onChange={(e) =>
                                            setData('settings', {
                                                ...data.settings,
                                                [setting.key]: e.target.value,
                                            })
                                        }
                                        className="input-field mt-1.5"
                                    />
                                )}
                                {setting.description && (
                                    <p className="mt-1 text-xs text-brand-500">
                                        {setting.description}
                                    </p>
                                )}
                            </div>
                        ))}

                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-primary"
                    >
                        Guardar aparência
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
}
