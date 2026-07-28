<?php

namespace App\Services;

use App\Enums\ContentPageFooterSection;
use App\Models\ContentPage;
use App\Models\NavigationItem;
use App\Models\PaymentMethod;
use Illuminate\Support\Facades\Schema;

class StorefrontContentService
{
    public function __construct(
        private readonly SettingsService $settings,
    ) {}

    /**
     * @return array<int, array{label: string, href: string, open_in_new_tab: bool}>
     */
    public function headerNavigation(): array
    {
        if (! $this->hasCmsTables()) {
            return $this->defaultNavigation();
        }

        return NavigationItem::query()
            ->activeHeader()
            ->get()
            ->map(fn (NavigationItem $item) => [
                'label' => $item->label,
                'href' => $item->resolveUrl(),
                'open_in_new_tab' => $item->open_in_new_tab,
            ])
            ->all();
    }

    /**
     * @return array{customer_support: array<int, array{title: string, href: string}>, legal: array<int, array{title: string, href: string}>}
     */
    public function footerPages(): array
    {
        if (! $this->hasCmsTables()) {
            return ['customer_support' => [], 'legal' => []];
        }

        $pages = ContentPage::query()->published()->inFooter()->get();

        return [
            'customer_support' => $pages
                ->where('footer_section', ContentPageFooterSection::CustomerSupport)
                ->map(fn (ContentPage $page) => [
                    'title' => $page->title,
                    'href' => route('pages.show', $page->slug),
                ])
                ->values()
                ->all(),
            'legal' => $pages
                ->where('footer_section', ContentPageFooterSection::Legal)
                ->map(fn (ContentPage $page) => [
                    'title' => $page->title,
                    'href' => route('pages.show', $page->slug),
                ])
                ->values()
                ->all(),
        ];
    }

    /**
     * @return array<int, array{name: string, image_url: string}>
     */
    public function paymentMethods(): array
    {
        if (! Schema::hasTable('payment_methods')) {
            return [];
        }

        return PaymentMethod::query()
            ->active()
            ->get()
            ->map(fn (PaymentMethod $method) => [
                'name' => $method->name,
                'image_url' => $method->imageUrl(),
            ])
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function appearance(): array
    {
        return [
            'announcement' => (string) $this->settings->get(
                'store.announcement_text',
                'Envio fixo em Portugal · Preços sem IVA · Pagamento seguro',
            ),
            'show_featured_products' => filter_var(
                $this->settings->get('store.home_show_featured_products', false),
                FILTER_VALIDATE_BOOLEAN,
            ),
            'footer_tagline' => (string) $this->settings->get(
                'store.footer_tagline',
                'T-DECK by True Solutions — decking, revestimento e vedações em composite para exteriores.',
            ),
            'hero' => [
                'image_url' => $this->settings->assetUrl(
                    $this->settings->get('store.home_hero_image'),
                ),
                'eyebrow' => (string) $this->settings->get(
                    'store.home_hero_eyebrow',
                    'T-DECK by True Solutions',
                ),
                'title' => (string) $this->settings->get(
                    'store.home_hero_title',
                    'Soluções WPC para exteriores',
                ),
                'subtitle' => (string) $this->settings->get(
                    'store.home_hero_subtitle',
                    'Decking, cladding e vedações com aparência de madeira natural. Durável, de baixa manutenção e pronto a instalar.',
                ),
                'cta_primary' => [
                    'label' => (string) $this->settings->get(
                        'store.home_hero_cta_primary_label',
                        'Comprar agora',
                    ),
                    'href' => $this->resolveHref(
                        (string) $this->settings->get(
                            'store.home_hero_cta_primary_url',
                            '/produtos',
                        ),
                    ),
                ],
                'cta_secondary' => [
                    'label' => (string) $this->settings->get(
                        'store.home_hero_cta_secondary_label',
                        'Ver promoções',
                    ),
                    'href' => $this->resolveHref(
                        (string) $this->settings->get(
                            'store.home_hero_cta_secondary_url',
                            '/produtos?promocao=1',
                        ),
                    ),
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function shared(): array
    {
        return [
            'navigation' => $this->headerNavigation(),
            'footer' => $this->footerPages(),
            'payment_methods' => $this->paymentMethods(),
            'appearance' => $this->appearance(),
        ];
    }

    private function hasCmsTables(): bool
    {
        return Schema::hasTable('navigation_items')
            && Schema::hasTable('content_pages');
    }

    /**
     * @return array<int, array{label: string, href: string, open_in_new_tab: bool}>
     */
    private function defaultNavigation(): array
    {
        return [
            [
                'label' => 'Produtos',
                'href' => route('products.index'),
                'open_in_new_tab' => false,
            ],
        ];
    }

    private function resolveHref(string $value): string
    {
        if ($value === '') {
            return route('home');
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        if (str_starts_with($value, '/')) {
            return url($value);
        }

        return route($value);
    }
}
