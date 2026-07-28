<?php

namespace App\Services;

use App\Enums\SettingType;
use App\Models\Setting;
use App\Support\PublicAsset;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class SettingsService
{
    private const CACHE_KEY = 'app.settings';

    private const CACHE_TTL = 3600;

    public function get(string $key, mixed $default = null): mixed
    {
        $setting = $this->all()->get($key);

        if (! $setting) {
            return $this->envFallback($key, $default);
        }

        return $setting->getDecryptedValue() ?? $default;
    }

    public function set(string $key, mixed $value): Setting
    {
        $setting = Setting::query()->where('key', $key)->firstOrFail();
        $setting->setTypedValue($value);
        $setting->save();

        Cache::forget(self::CACHE_KEY);

        return $setting;
    }

    public function all(): Collection
    {
        $cached = Cache::get(self::CACHE_KEY);

        if (is_array($cached)) {
            return $this->hydrateSettings($cached);
        }

        $settings = Setting::query()->get()->keyBy('key');

        Cache::put(
            self::CACHE_KEY,
            $settings->map(fn (Setting $setting) => $setting->getAttributes())->all(),
            self::CACHE_TTL,
        );

        return $settings;
    }

    /**
     * @param  array<string, array<string, mixed>>  $cached
     */
    private function hydrateSettings(array $cached): Collection
    {
        return collect($cached)->map(function (array $attributes) {
            $setting = new Setting;
            $setting->forceFill($attributes);
            $setting->syncOriginal();

            return $setting;
        });
    }

    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Cria apenas definições em falta — nunca altera valores existentes.
     */
    public function syncMissingFromDefinition(): int
    {
        $created = 0;

        foreach (self::definition() as $definition) {
            if (Setting::query()->where('key', $definition['key'])->exists()) {
                continue;
            }

            $setting = new Setting([
                'key' => $definition['key'],
                'type' => $definition['type'],
                'group' => $definition['group'],
                'label' => $definition['label'],
                'description' => $definition['description'],
                'is_public' => $definition['is_public'],
            ]);

            $setting->setTypedValue($this->defaultValueForKey($definition['key'], $definition['type']));
            $setting->save();
            $created++;
        }

        if ($created > 0) {
            $this->clearCache();
        }

        return $created;
    }

    public function definitionForGroup(string $group): Collection
    {
        return collect(self::definition())
            ->filter(fn (array $definition) => $definition['group'] === $group)
            ->values();
    }

    private function defaultValueForKey(string $key, SettingType $type): mixed
    {
        $value = match ($key) {
            'store.name' => 'Lusoweld',
            'store.currency' => 'EUR',
            'store.shipping_cost' => '5.99',
            'store.default_vat_rate' => '23',
            'store.sales_enabled' => true,
            'store.sales_disabled_message' => 'As vendas online estão temporariamente indisponíveis. Pode consultar o nosso catálogo ou contacte-nos para mais informações.',
            'store.legal_text' => 'Os preços apresentados são sem IVA. O IVA é calculado automaticamente no carrinho e checkout.',
            'store.home_show_featured_products' => false,
            'stripe.payment_card', 'stripe.payment_mbway', 'stripe.payment_multibanco' => true,
            'invoicing.mode' => 'manual',
            'email.smtp_port' => 587,
            default => null,
        };

        if ($value !== null) {
            return $value;
        }

        return match ($type) {
            SettingType::Boolean => false,
            SettingType::Integer => 0,
            default => null,
        };
    }

    public function group(string $group): Collection
    {
        return $this->all()->filter(fn (Setting $setting) => $setting->group === $group);
    }

    public function publicSettings(): array
    {
        return $this->all()
            ->filter(fn (Setting $setting) => $setting->is_public)
            ->mapWithKeys(fn (Setting $setting) => [$setting->key => $setting->getDecryptedValue()])
            ->all();
    }

    /**
     * Branding público partilhado com o frontend (nome, logótipo, favicon).
     *
     * @return array{name: string, logo_url: ?string, favicon_url: ?string, currency: string}
     */
    public function branding(): array
    {
        return [
            'name' => (string) $this->get('store.name', 'Lusoweld'),
            'logo_url' => $this->assetUrl($this->get('store.logo_path')),
            'favicon_url' => $this->assetUrl($this->get('store.favicon_path')),
            'currency' => (string) $this->get('store.currency', 'EUR'),
            'vat_rate' => (float) $this->get('store.default_vat_rate', 23),
            'sales_enabled' => filter_var($this->get('store.sales_enabled', true), FILTER_VALIDATE_BOOLEAN),
            'sales_disabled_message' => (string) $this->get(
                'store.sales_disabled_message',
                'As vendas online estão temporariamente indisponíveis. Pode consultar o nosso catálogo.',
            ),
        ];
    }

    public function assetUrl(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return PublicAsset::url($path);
    }

    private function envFallback(string $key, mixed $default): mixed
    {
        return match ($key) {
            'stripe.publishable_key' => env('STRIPE_KEY', $default),
            'stripe.secret_key' => env('STRIPE_SECRET', $default),
            'stripe.webhook_secret' => env('STRIPE_WEBHOOK_SECRET', $default),
            'store.name' => env('APP_NAME', $default),
            'store.currency' => env('STORE_CURRENCY', $default ?? 'EUR'),
            'store.default_vat_rate' => (float) env('STORE_DEFAULT_VAT_RATE', $default ?? 23),
            'store.shipping_cost' => (float) env('STORE_SHIPPING_COST', $default ?? 5.99),
            'store.announcement_text' => 'T-DECK by True Solutions · Decking, Cladding e Fencing · Preços com IVA incluído',
            'store.footer_tagline' => 'T-DECK by True Solutions — decking, revestimento e vedações em composite para exteriores em Portugal.',
            'store.home_hero_eyebrow' => 'T-DECK by True Solutions',
            'store.home_hero_title' => 'Soluções WPC para exteriores',
            'store.home_hero_subtitle' => 'Decking, cladding e fencing com aparência de madeira natural. Durável e de baixa manutenção.',
            'store.home_hero_cta_primary_label' => 'Comprar agora',
            'store.home_hero_cta_primary_url' => '/produtos',
            'store.home_hero_cta_secondary_label' => 'Ver promoções',
            'store.home_hero_cta_secondary_url' => '/produtos?promocao=1',
            default => $default,
        };
    }

    public static function definition(): array
    {
        return [
            // Stripe
            ['key' => 'stripe.publishable_key', 'type' => SettingType::String, 'group' => 'stripe', 'label' => 'Chave publicável', 'description' => 'Chave publicável do Stripe (pk_...)', 'is_public' => true],
            ['key' => 'stripe.secret_key', 'type' => SettingType::Encrypted, 'group' => 'stripe', 'label' => 'Chave secreta', 'description' => 'Chave secreta do Stripe (sk_...)', 'is_public' => false],
            ['key' => 'stripe.webhook_secret', 'type' => SettingType::Encrypted, 'group' => 'stripe', 'label' => 'Webhook secret', 'description' => 'Signing secret do webhook Stripe (whsec_...)', 'is_public' => false],
            ['key' => 'stripe.payment_card', 'type' => SettingType::Boolean, 'group' => 'stripe', 'label' => 'Cartão de crédito/débito', 'description' => 'Visa, Mastercard, American Express, etc. Ative também em Stripe → Definições → Métodos de pagamento.', 'is_public' => false],
            ['key' => 'stripe.payment_mbway', 'type' => SettingType::Boolean, 'group' => 'stripe', 'label' => 'MB WAY', 'description' => 'Pagamento com carteira digital MB WAY (Portugal, EUR). Requer ativação no painel Stripe.', 'is_public' => false],
            ['key' => 'stripe.payment_multibanco', 'type' => SettingType::Boolean, 'group' => 'stripe', 'label' => 'Multibanco', 'description' => 'Referência Multibanco para pagamento em ATM/homebanking (Portugal, EUR). Requer ativação no painel Stripe.', 'is_public' => false],

            // Segurança
            ['key' => 'security.recaptcha_site_key', 'type' => SettingType::String, 'group' => 'security', 'label' => 'reCAPTCHA — Site key', 'description' => 'Chave pública do Google reCAPTCHA v2 (grátis em google.com/recaptcha/admin)', 'is_public' => true],
            ['key' => 'security.recaptcha_secret_key', 'type' => SettingType::Encrypted, 'group' => 'security', 'label' => 'reCAPTCHA — Secret key', 'description' => 'Chave secreta do Google reCAPTCHA v2', 'is_public' => false],

            // Email
            ['key' => 'email.contact_recipient', 'type' => SettingType::String, 'group' => 'email', 'label' => 'Email de contacto', 'description' => 'Endereço que recebe as mensagens do formulário Contacte-nos', 'is_public' => false],
            ['key' => 'email.from_address', 'type' => SettingType::String, 'group' => 'email', 'label' => 'Email remetente', 'description' => 'Endereço usado para enviar emails (ex: noreply@loja.pt)', 'is_public' => false],
            ['key' => 'email.from_name', 'type' => SettingType::String, 'group' => 'email', 'label' => 'Nome remetente', 'description' => 'Nome exibido como remetente dos emails', 'is_public' => false],
            ['key' => 'email.smtp_host', 'type' => SettingType::String, 'group' => 'email', 'label' => 'SMTP Host', 'description' => 'Servidor SMTP (ex: smtp.gmail.com, mail.loja.pt)', 'is_public' => false],
            ['key' => 'email.smtp_port', 'type' => SettingType::Integer, 'group' => 'email', 'label' => 'SMTP Porta', 'description' => 'Porta SMTP (587 TLS, 465 SSL, 25 sem encriptação)', 'is_public' => false],
            ['key' => 'email.smtp_username', 'type' => SettingType::String, 'group' => 'email', 'label' => 'SMTP Utilizador', 'description' => 'Utilizador de autenticação SMTP', 'is_public' => false],
            ['key' => 'email.smtp_password', 'type' => SettingType::Encrypted, 'group' => 'email', 'label' => 'SMTP Password', 'description' => 'Password de autenticação SMTP', 'is_public' => false],

            // Invoicing
            ['key' => 'invoicing.mode', 'type' => SettingType::String, 'group' => 'invoicing', 'label' => 'Modo de faturação', 'description' => 'manual ou automatic', 'is_public' => false],
            ['key' => 'invoicing.company_name', 'type' => SettingType::String, 'group' => 'invoicing', 'label' => 'Nome da empresa', 'description' => null, 'is_public' => false],
            ['key' => 'invoicing.company_tax_id', 'type' => SettingType::String, 'group' => 'invoicing', 'label' => 'NIF da empresa', 'description' => null, 'is_public' => false],
            ['key' => 'invoicing.company_address', 'type' => SettingType::Text, 'group' => 'invoicing', 'label' => 'Morada da empresa', 'description' => null, 'is_public' => false],
            ['key' => 'invoicing.provider', 'type' => SettingType::String, 'group' => 'invoicing', 'label' => 'Fornecedor de faturação', 'description' => 'InvoiceXpress, Vendus, Moloni, etc.', 'is_public' => false],
            ['key' => 'invoicing.provider_api_key', 'type' => SettingType::Encrypted, 'group' => 'invoicing', 'label' => 'API Key do fornecedor', 'description' => null, 'is_public' => false],

            // Store
            ['key' => 'store.name', 'type' => SettingType::String, 'group' => 'store', 'label' => 'Nome da loja', 'description' => null, 'is_public' => true],
            ['key' => 'store.logo_path', 'type' => SettingType::String, 'group' => 'store', 'label' => 'Logótipo', 'description' => 'Caminho do ficheiro do logótipo', 'is_public' => true],
            ['key' => 'store.favicon_path', 'type' => SettingType::String, 'group' => 'store', 'label' => 'Favicon', 'description' => 'Ícone do separador do browser (.ico, .png ou .svg)', 'is_public' => true],
            ['key' => 'store.currency', 'type' => SettingType::String, 'group' => 'store', 'label' => 'Moeda', 'description' => 'Código ISO (ex: EUR)', 'is_public' => true],
            ['key' => 'store.shipping_cost', 'type' => SettingType::String, 'group' => 'store', 'label' => 'Portes de envio', 'description' => 'Valor fixo de envio em EUR', 'is_public' => true],
            ['key' => 'store.default_vat_rate', 'type' => SettingType::String, 'group' => 'store', 'label' => 'Taxa de IVA (%)', 'description' => 'Percentagem de IVA aplicada automaticamente aos preços (introduzidos sem IVA)', 'is_public' => true],
            ['key' => 'store.sales_enabled', 'type' => SettingType::Boolean, 'group' => 'store', 'label' => 'Vendas online', 'description' => 'Desative para mostrar apenas o catálogo (produtos e preços visíveis, sem carrinho nem checkout)', 'is_public' => true],
            ['key' => 'store.sales_disabled_message', 'type' => SettingType::String, 'group' => 'store', 'label' => 'Mensagem — vendas desativadas', 'description' => 'Texto apresentado no site quando as vendas estão bloqueadas', 'is_public' => true],
            ['key' => 'store.legal_text', 'type' => SettingType::Text, 'group' => 'store', 'label' => 'Texto legal', 'description' => 'Termos, política de privacidade, etc.', 'is_public' => true],

            // Aparência
            ['key' => 'store.announcement_text', 'type' => SettingType::String, 'group' => 'appearance', 'label' => 'Barra de anúncio', 'description' => 'Texto no topo do site', 'is_public' => true],
            ['key' => 'store.footer_tagline', 'type' => SettingType::Text, 'group' => 'appearance', 'label' => 'Tagline do footer', 'description' => 'Texto descritivo no rodapé', 'is_public' => true],
            ['key' => 'store.home_hero_image', 'type' => SettingType::String, 'group' => 'appearance', 'label' => 'Imagem hero', 'description' => 'Imagem principal da homepage', 'is_public' => true],
            ['key' => 'store.home_hero_eyebrow', 'type' => SettingType::String, 'group' => 'appearance', 'label' => 'Hero — etiqueta', 'description' => 'Texto pequeno acima do título', 'is_public' => true],
            ['key' => 'store.home_hero_title', 'type' => SettingType::String, 'group' => 'appearance', 'label' => 'Hero — título', 'description' => null, 'is_public' => true],
            ['key' => 'store.home_hero_subtitle', 'type' => SettingType::Text, 'group' => 'appearance', 'label' => 'Hero — subtítulo', 'description' => null, 'is_public' => true],
            ['key' => 'store.home_hero_cta_primary_label', 'type' => SettingType::String, 'group' => 'appearance', 'label' => 'Hero — botão principal', 'description' => null, 'is_public' => true],
            ['key' => 'store.home_hero_cta_primary_url', 'type' => SettingType::String, 'group' => 'appearance', 'label' => 'Hero — URL botão principal', 'description' => 'Caminho (/produtos) ou URL completa', 'is_public' => true],
            ['key' => 'store.home_hero_cta_secondary_label', 'type' => SettingType::String, 'group' => 'appearance', 'label' => 'Hero — botão secundário', 'description' => null, 'is_public' => true],
            ['key' => 'store.home_hero_cta_secondary_url', 'type' => SettingType::String, 'group' => 'appearance', 'label' => 'Hero — URL botão secundário', 'description' => null, 'is_public' => true],
            ['key' => 'store.home_show_featured_products', 'type' => SettingType::Boolean, 'group' => 'appearance', 'label' => 'Produtos em destaque na homepage', 'description' => 'Mostrar secção de produtos em destaque na página inicial', 'is_public' => true],
        ];
    }
}
