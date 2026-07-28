import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function PageForm({
    page,
    footerSections,
    contentFormats,
}: {
    page: {
        id: number;
        title: string;
        slug: string;
        content: string;
        content_format: string;
        footer_section: string | null;
        show_in_footer: boolean;
        sort_order: number;
        is_published: boolean;
    } | null;
    footerSections: { value: string; label: string }[];
    contentFormats: { value: string; label: string }[];
}) {
    const isEdit = !!page;

    const { data, setData, post, patch, processing, errors } = useForm({
        title: page?.title ?? '',
        slug: page?.slug ?? '',
        content: page?.content ?? '',
        content_format: page?.content_format ?? 'plain',
        footer_section: page?.footer_section ?? '',
        show_in_footer: page?.show_in_footer ?? true,
        sort_order: page?.sort_order ?? 0,
        is_published: page?.is_published ?? true,
    });

    const isHtml = data.content_format === 'html';

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            patch(route('admin.pages.update', page!.id));
        } else {
            post(route('admin.pages.store'));
        }
    };

    return (
        <AdminLayout title={isEdit ? `Editar — ${page!.title}` : 'Nova página'}>
            <Head title={isEdit ? page!.title : 'Nova página'} />

            <form
                onSubmit={submit}
                className="grid gap-8 lg:grid-cols-[1fr_280px]"
            >
                <div className="space-y-4">
                    <div className="card">
                        <label className="text-sm font-medium">Título</label>
                        <input
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="input-field mt-1.5"
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div className="card">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <label className="text-sm font-medium">Conteúdo</label>
                            <div className="flex rounded-md border border-brand-200 p-0.5">
                                {contentFormats.map((format) => (
                                    <button
                                        key={format.value}
                                        type="button"
                                        onClick={() =>
                                            setData('content_format', format.value)
                                        }
                                        className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                                            data.content_format === format.value
                                                ? 'bg-brand-900 text-white'
                                                : 'text-brand-600 hover:text-brand-900'
                                        }`}
                                    >
                                        {format.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <p className="mt-2 text-xs text-brand-500">
                            {isHtml
                                ? 'Modo HTML: pode usar etiquetas como <p>, <h2>, <ul>, <a href="">, etc.'
                                : 'Modo texto simples: escreva normalmente. As quebras de linha são preservadas — não precisa de HTML.'}
                        </p>

                        <textarea
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            rows={18}
                            placeholder={
                                isHtml
                                    ? '<p>Escreva o conteúdo em HTML...</p>'
                                    : 'Escreva o texto aqui...\n\nPode usar parágrafos separados por linhas em branco.'
                            }
                            className={`input-field mt-2 text-sm ${
                                isHtml ? 'font-mono' : ''
                            }`}
                        />
                        {errors.content && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.content}
                            </p>
                        )}
                        {errors.content_format && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.content_format}
                            </p>
                        )}

                        {data.content && (
                            <div className="mt-4 border-t border-brand-200 pt-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
                                    Pré-visualização
                                </p>
                                {isHtml ? (
                                    <article
                                        className="prose prose-sm mt-3 max-w-none text-brand-700 prose-headings:font-semibold prose-headings:text-brand-900 prose-a:text-brand-900 prose-a:underline"
                                        dangerouslySetInnerHTML={{
                                            __html: data.content,
                                        }}
                                    />
                                ) : (
                                    <article className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-brand-700">
                                        {data.content}
                                    </article>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <aside className="space-y-4">
                    <div className="card space-y-4">
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
                            <label className="text-sm font-medium">
                                Secção do footer
                            </label>
                            <select
                                value={data.footer_section}
                                onChange={(e) =>
                                    setData('footer_section', e.target.value)
                                }
                                className="input-field mt-1.5"
                            >
                                <option value="">Nenhuma</option>
                                {footerSections.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
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
                                className="input-field mt-1.5 w-24"
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.show_in_footer}
                                onChange={(e) =>
                                    setData('show_in_footer', e.target.checked)
                                }
                            />
                            Mostrar no footer
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.is_published}
                                onChange={(e) =>
                                    setData('is_published', e.target.checked)
                                }
                            />
                            Publicada
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-primary w-full"
                    >
                        {isEdit ? 'Guardar' : 'Criar página'}
                    </button>
                </aside>
            </form>
        </AdminLayout>
    );
}
