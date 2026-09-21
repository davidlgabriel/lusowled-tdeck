import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useRef } from 'react';

type SettingField = {
    key: string;
    label: string;
    description: string | null;
    type: string;
    value: string;
    masked: string | null;
    asset_url: string | null;
};

export default function SettingsIndex({
    group,
    groups,
    settings,
    stripeWebhookUrl,
    stripeGuide,
    contactFormUrl,
    googleShopping,
}: {
    group: string;
    groups: { key: string; label: string }[];
    settings: SettingField[];
    stripeWebhookUrl: string;
    stripeGuide: {
        configured: boolean;
        testMode: boolean;
        apiKeysUrl: string;
        paymentMethodsUrl: string;
        webhooksUrl: string;
    };
    contactFormUrl: string;
    googleShopping: {
        enabled: boolean;
        feedUrl: string | null;
        hasToken: boolean;
        sitemapUrl: string;
        robotsUrl: string;
    };
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const uploadKeyRef = useRef<string>('store.logo_path');

    const initial: Record<string, string> = {};
    settings.forEach((s) => {
        initial[s.key] =
            s.type === 'encrypted' ? '__UNCHANGED__' : String(s.value ?? '');
    });

    const { data, setData, patch, processing } = useForm({
        group,
        settings: initial,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(route('admin.settings.update'), { preserveScroll: true });
    };

    const regenerateFeedToken = () => {
        if (
            !confirm(
                'Isto invalida o URL anterior. Terá de atualizar o feed no Merchant Center. Continuar?',
            )
        ) {
            return;
        }
        router.post(route('admin.settings.google-shopping.regenerate-token'), {}, {
            preserveScroll: true,
        });
    };

    const visibleSettings = settings.filter(
        (s) =>
            s.key !== 'google_shopping.feed_token' &&
            s.key !== 'store.shipping_cost',
    );

    const uploadAsset = (key: string) => {
        uploadKeyRef.current = key;
        fileRef.current?.click();
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('key', uploadKeyRef.current);
        router.post(route('admin.settings.upload'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    return (
        <AdminLayout title="Configurações">
            <Head title="Admin — Configurações" />

            <div className="mb-6 flex flex-wrap gap-2">
                {groups.map((g) => (
                    <a
                        key={g.key}
                        href={route('admin.settings.index', { group: g.key })}
                        className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                            group === g.key
                                ? 'bg-brand-900 text-white'
                                : 'border border-brand-300 bg-white text-brand-700 hover:border-brand-900'
                        }`}
                    >
                        {g.label}
                    </a>
                ))}
            </div>

            {group === 'store' && (
                <div className="mb-6 rounded-lg border border-brand-200 bg-white p-4 text-sm text-brand-600">
                    <p className="font-medium text-brand-900">
                        Portes de envio
                    </p>
                    <p className="mt-2">
                        Encomendas a partir de <strong>900&nbsp;€ (sem IVA)</strong>{' '}
                        têm portes grátis. Abaixo desse valor, o cliente vê a
                        mensagem configurada em «Mensagem — portes por calcular» e
                        o transporte <strong>não entra</strong> no total pago online.
                    </p>
                    <p className="mt-2">
                        Desative <strong>Vendas online</strong> para bloquear
                        carrinho e checkout. Os produtos e preços continuam
                        visíveis na loja.
                    </p>
                </div>
            )}

            {group === 'security' && (
                <div className="mb-6 rounded-lg border border-brand-200 bg-white p-4 text-sm text-brand-600">
                    <p className="font-medium text-brand-900">
                        Google reCAPTCHA (anti-spam)
                    </p>
                    <p className="mt-2">
                        Protege o formulário Contacte-nos contra bots. É{' '}
                        <strong>gratuito</strong> no Google.
                    </p>
                    <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs">
                        <li>
                            Crie as chaves em{' '}
                            <a
                                href="https://www.google.com/recaptcha/admin/create"
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-brand-900 underline"
                            >
                                google.com/recaptcha/admin
                            </a>
                        </li>
                        <li>
                            Escolha tipo <strong>reCAPTCHA v2</strong> → “Não
                            sou um robô”
                        </li>
                        <li>
                            Adicione o domínio do site (ex: tdeck.pt,
                            localhost)
                        </li>
                        <li>Cole a Site key e Secret key abaixo</li>
                    </ol>
                </div>
            )}

            {group === 'email' && (
                <div className="mb-6 rounded-lg border border-brand-200 bg-white p-4 text-sm text-brand-600">
                    <p className="font-medium text-brand-900">
                        Formulário Contacte-nos
                    </p>
                    <p className="mt-2">
                        Configure o SMTP e o email de destino abaixo. As
                        mensagens do formulário são enviadas para o{' '}
                        <strong>Email de contacto</strong> e a resposta pode
                        ser feita diretamente ao cliente (reply-to).
                    </p>
                    <p className="mt-2 text-xs">
                        Página pública:{' '}
                        <a
                            href={contactFormUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-brand-900 underline"
                        >
                            {contactFormUrl}
                        </a>
                    </p>
                </div>
            )}

            {group === 'google_shopping' && (
                <div className="mb-6 space-y-4">
                    <div className="rounded-lg border border-brand-200 bg-white p-4 text-sm text-brand-600">
                        <p className="font-medium text-brand-900">
                            Google Shopping (feed pago)
                        </p>
                        <p className="mt-2">
                            Este feed alimenta o{' '}
                            <strong>Google Merchant Center</strong>. Depois
                            liga uma campanha em{' '}
                            <strong>Google Ads</strong> (Shopping ou
                            Performance Max) para aparecer no carrossel «Produtos
                            patrocinados».
                        </p>
                        <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs">
                            <li>
                                Conta em{' '}
                                <a
                                    href="https://merchant.google.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium text-brand-900 underline"
                                >
                                    merchant.google.com
                                </a>{' '}
                                — verifique o domínio da loja e configure envio /
                                devoluções.
                            </li>
                            <li>
                                Ative <strong>Feed Google Shopping ativo</strong>{' '}
                                abaixo e guarde.
                            </li>
                            <li>
                                Em Merchant Center → Produtos → Feeds → adicionar
                                feed «Primário», país <strong>Portugal</strong>,
                                idioma <strong>Português</strong>, método{' '}
                                <strong>URL programado</strong> e cole o URL
                                abaixo.
                            </li>
                            <li>
                                Aguarde aprovação dos produtos (imagem, preço e
                                link devem coincidir com a loja).
                            </li>
                            <li>
                                Em{' '}
                                <a
                                    href="https://ads.google.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium text-brand-900 underline"
                                >
                                    ads.google.com
                                </a>{' '}
                                crie campanha Shopping ligada ao Merchant Center.
                            </li>
                        </ol>
                        <p className="mt-3 text-xs">
                            Só entram produtos com estado <strong>Ativo</strong>.
                            Preços no feed usam a taxa de IVA das configurações da
                            loja quando «Preços com IVA» está ativo. A mesma marca e
                            regra de IVA aplicam-se ao <strong>JSON-LD</strong> nas
                            páginas da loja (SEO orgânico).
                        </p>
                        <p className="mt-2 text-xs">
                            Sitemap (Search Console):{' '}
                            <a
                                href={googleShopping.sitemapUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-brand-900 underline break-all"
                            >
                                {googleShopping.sitemapUrl}
                            </a>
                        </p>
                    </div>

                    <div className="rounded-lg border border-brand-200 bg-white p-4 text-sm text-brand-600">
                        <p className="font-medium text-brand-900">
                            URL do feed (XML)
                        </p>
                        {googleShopping.feedUrl ? (
                            <>
                                <code className="mt-2 block break-all rounded bg-brand-50 p-2 text-xs">
                                    {googleShopping.feedUrl}
                                </code>
                                <p className="mt-2 text-xs">
                                    Abra num separador (logado ou anónimo) para
                                    confirmar que vê XML com os produtos.
                                </p>
                            </>
                        ) : (
                            <p className="mt-2 text-amber-800 text-xs">
                                {googleShopping.enabled
                                    ? 'Token em falta — clique em «Regenerar URL do feed».'
                                    : 'Ative o feed abaixo e guarde para ver o URL.'}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={regenerateFeedToken}
                            className="btn-secondary mt-3 text-sm"
                        >
                            Regenerar URL do feed
                        </button>
                    </div>
                </div>
            )}

            {group === 'stripe' && (
                <div className="mb-6 space-y-4">
                    <div className="rounded-lg border border-brand-200 bg-white p-4 text-sm text-brand-600">
                        <p className="font-medium text-brand-900">
                            Configuração completa do Stripe
                        </p>
                        {stripeGuide.configured ? (
                            <p className="mt-2">
                                Modo atual:{' '}
                                <strong className="text-brand-900">
                                    {stripeGuide.testMode
                                        ? 'Teste (sk_test_)'
                                        : 'Produção (sk_live_)'}
                                </strong>
                            </p>
                        ) : (
                            <p className="mt-2 text-amber-800">
                                Chaves Stripe ainda não configuradas. Siga os
                                passos abaixo.
                            </p>
                        )}
                        <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs">
                            <li>
                                Crie conta em{' '}
                                <a
                                    href="https://dashboard.stripe.com/register"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium text-brand-900 underline"
                                >
                                    stripe.com
                                </a>{' '}
                                e complete os dados da empresa (Portugal, EUR).
                            </li>
                            <li>
                                Obtenha as chaves API em{' '}
                                <a
                                    href={stripeGuide.apiKeysUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium text-brand-900 underline"
                                >
                                    Stripe → Chaves API
                                </a>{' '}
                                e cole abaixo (publicável + secreta).
                            </li>
                            <li>
                                Ative os métodos em{' '}
                                <a
                                    href={stripeGuide.paymentMethodsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium text-brand-900 underline"
                                >
                                    Stripe → Métodos de pagamento
                                </a>
                                : <strong>Cartões</strong>,{' '}
                                <strong>MB WAY</strong>,{' '}
                                <strong>Multibanco</strong>.
                            </li>
                            <li>
                                Marque como <strong>Ativo</strong> abaixo os
                                métodos que quer na loja.
                            </li>
                            <li>
                                Crie um webhook em{' '}
                                <a
                                    href={stripeGuide.webhooksUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium text-brand-900 underline"
                                >
                                    Stripe → Webhooks
                                </a>{' '}
                                com o URL abaixo e eventos{' '}
                                <code>checkout.session.completed</code>,{' '}
                                <code>payment_intent.succeeded</code> e{' '}
                                <code>charge.refunded</code>.
                            </li>
                            <li>
                                Copie o <strong>Signing secret</strong> (whsec_)
                                para o campo Webhook secret abaixo.
                            </li>
                        </ol>
                        <p className="mt-3 text-xs">
                            MB WAY e Multibanco só funcionam em{' '}
                            <strong>EUR</strong> com clientes em Portugal.
                            Multibanco pode demorar — a encomenda confirma via
                            webhook quando o pagamento é recebido.
                        </p>
                    </div>

                    <div className="rounded-lg border border-brand-200 bg-white p-4 text-sm text-brand-600">
                        <p className="font-medium text-brand-900">
                            URL do webhook
                        </p>
                        <code className="mt-2 block break-all rounded bg-brand-50 p-2 text-xs">
                            {stripeWebhookUrl}
                        </code>
                    </div>
                </div>
            )}

            <form
                onSubmit={submit}
                className="max-w-2xl space-y-5 rounded-lg border border-brand-200 bg-white p-6 shadow-card"
            >
                {visibleSettings.map((setting) => (
                    <div key={setting.key}>
                        <label className="text-sm font-medium text-brand-900">
                            {setting.label}
                        </label>
                        {setting.description && (
                            <p className="text-xs text-brand-500">
                                {setting.description}
                            </p>
                        )}

                        {setting.type === 'boolean' ? (
                            <label className="mt-2 flex cursor-pointer items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.settings[setting.key] === '1'}
                                    onChange={(e) =>
                                        setData('settings', {
                                            ...data.settings,
                                            [setting.key]: e.target.checked
                                                ? '1'
                                                : '0',
                                        })
                                    }
                                    className="rounded border-brand-300 text-brand-900"
                                />
                                <span className="text-sm text-brand-700">
                                    Ativo
                                </span>
                            </label>
                        ) : setting.type === 'text' ? (
                            <textarea
                                value={
                                    data.settings[setting.key] === '__UNCHANGED__'
                                        ? ''
                                        : data.settings[setting.key]
                                }
                                onChange={(e) =>
                                    setData('settings', {
                                        ...data.settings,
                                        [setting.key]: e.target.value,
                                    })
                                }
                                rows={4}
                                className="input-field mt-1.5"
                            />
                        ) : setting.key === 'store.logo_path' ||
                          setting.key === 'store.favicon_path' ? (
                            <div className="mt-2 flex items-center gap-4">
                                {setting.asset_url && (
                                    <img
                                        src={setting.asset_url}
                                        alt=""
                                        className="h-12 w-auto rounded border border-brand-200"
                                    />
                                )}
                                <button
                                    type="button"
                                    onClick={() => uploadAsset(setting.key)}
                                    className="btn-secondary"
                                >
                                    Carregar ficheiro
                                </button>
                            </div>
                        ) : (
                            <input
                                type={
                                    setting.type === 'encrypted'
                                        ? 'password'
                                        : 'text'
                                }
                                value={
                                    data.settings[setting.key] === '__UNCHANGED__'
                                        ? ''
                                        : data.settings[setting.key]
                                }
                                placeholder={
                                    setting.masked
                                        ? `Atual: ${setting.masked}`
                                        : undefined
                                }
                                onChange={(e) =>
                                    setData('settings', {
                                        ...data.settings,
                                        [setting.key]:
                                            e.target.value || '__UNCHANGED__',
                                    })
                                }
                                className="input-field mt-1.5"
                            />
                        )}
                    </div>
                ))}

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileChange}
                />

                <button type="submit" disabled={processing} className="btn-primary">
                    Guardar configurações
                </button>
            </form>
        </AdminLayout>
    );
}
