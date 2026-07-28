<?php

namespace Database\Seeders;

use App\Enums\SettingType;
use App\Models\Setting;
use App\Services\SettingsService;
use Database\Seeders\Support\AvidWpcAssetDownloader;
use Database\Seeders\Support\TdeckBranding;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        AvidWpcAssetDownloader::downloadAll();
        $logoPath = TdeckBranding::installLogo();

        foreach (SettingsService::definition() as $definition) {
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

            $value = $this->defaultValue($definition['key'], $logoPath);

            $setting->setTypedValue(
                $value ?? match ($definition['type']) {
                    SettingType::Boolean => false,
                    SettingType::Integer => 0,
                    default => null,
                },
            );
            $setting->save();
        }

        app(SettingsService::class)->clearCache();
    }

    private function defaultValue(string $key, string $logoPath): ?string
    {
        return match ($key) {
            'store.name' => TdeckBranding::storeName(),
            'store.logo_path' => $logoPath,
            'store.favicon_path' => $logoPath,
            'store.currency' => 'EUR',
            'store.shipping_cost' => '5.99',
            'store.default_vat_rate' => '23',
            'store.sales_enabled' => '1',
            'store.sales_disabled_message' => 'As vendas online estão temporariamente indisponíveis. Pode consultar o nosso catálogo ou contacte-nos para mais informações.',
            'store.legal_text' => 'Os preços apresentados são sem IVA. O IVA é calculado automaticamente no carrinho e checkout.',
            'store.announcement_text' => '',
            'store.home_show_featured_products' => '0',
            'store.footer_tagline' => 'T-DECK by True Solutions — decking, revestimento e vedações em composite para exteriores. Qualidade profissional, entrega em Portugal.',
            'store.home_hero_image' => 'avidwpc/home/hero.jpg',
            'store.home_hero_eyebrow' => 'T-DECK by True Solutions',
            'store.home_hero_title' => 'Soluções WPC para exteriores',
            'store.home_hero_subtitle' => 'Decking, cladding e fencing com aparência de madeira natural. Durável, de baixa manutenção e pronto a instalar.',
            'store.home_hero_cta_primary_label' => 'Ver produtos',
            'store.home_hero_cta_primary_url' => '/produtos',
            'store.home_hero_cta_secondary_label' => 'Decking',
            'store.home_hero_cta_secondary_url' => '/categorias/decking-wpc',
            'invoicing.mode' => 'manual',
            'invoicing.company_name' => TdeckBranding::companyName(),
            'invoicing.company_tax_id' => '500000000',
            'invoicing.company_address' => 'Portugal',
            'email.from_address' => 'loja@tdeck.pt',
            'email.from_name' => 'T-DECK by True Solutions',
            'email.contact_recipient' => 'loja@tdeck.pt',
            'email.smtp_port' => '587',
            'stripe.payment_card' => '1',
            'stripe.payment_mbway' => '1',
            'stripe.payment_multibanco' => '1',
            default => null,
        };
    }
}
