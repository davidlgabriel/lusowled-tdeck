<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Support\VatCalculator;
use Illuminate\Support\Str;

class GoogleShoppingFeedService
{
    public function __construct(
        private readonly SettingsService $settings,
    ) {}

    public function isEnabled(): bool
    {
        return filter_var(
            $this->settings->get('google_shopping.enabled', false),
            FILTER_VALIDATE_BOOLEAN,
        );
    }

    public function feedToken(): string
    {
        return (string) $this->settings->get('google_shopping.feed_token', '');
    }

    public function tokenIsValid(?string $token): bool
    {
        $expected = $this->feedToken();

        if ($expected === '' || $token === null || $token === '') {
            return false;
        }

        return hash_equals($expected, $token);
    }

    public function feedUrl(): string
    {
        $token = $this->feedToken();

        return route('feeds.google-shopping', ['token' => $token], absolute: true);
    }

    public function regenerateToken(): string
    {
        $token = Str::random(48);
        $this->settings->set('google_shopping.feed_token', $token);

        return $token;
    }

    public function toXml(): string
    {
        $storeName = (string) $this->settings->get('store.name', 'Loja');
        $storeUrl = url('/');

        $items = $this->buildItems();

        $channel = $this->xmlElement('title', $storeName)
            .$this->xmlElement('link', $storeUrl)
            .$this->xmlElement('description', "Catálogo {$storeName}");

        foreach ($items as $item) {
            $channel .= '<item>'.$item.'</item>';
        }

        return '<?xml version="1.0" encoding="UTF-8"?>'
            .'<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">'
            .'<channel>'.$channel.'</channel>'
            .'</rss>';
    }

    /**
     * @return list<string>
     */
    private function buildItems(): array
    {
        $items = [];
        $includeVariants = filter_var(
            $this->settings->get('google_shopping.include_variants', true),
            FILTER_VALIDATE_BOOLEAN,
        );

        Product::query()
            ->active()
            ->with([
                'images',
                'variants' => fn ($query) => $query->where('is_active', true)->orderBy('sort_order'),
            ])
            ->orderBy('id')
            ->chunkById(100, function ($products) use (&$items, $includeVariants) {
                foreach ($products as $product) {
                    $activeVariants = $product->variants;

                    if ($includeVariants && $activeVariants->isNotEmpty()) {
                        foreach ($activeVariants as $variant) {
                            $items[] = $this->itemXml($product, $variant);
                        }

                        continue;
                    }

                    $items[] = $this->itemXml($product, null);
                }
            });

        return $items;
    }

    private function itemXml(Product $product, ?ProductVariant $variant): string
    {
        $brand = trim((string) $this->settings->get('google_shopping.brand', ''));
        if ($brand === '') {
            $brand = (string) $this->settings->get('store.name', 'Loja');
        }

        $id = $variant !== null ? $variant->sku : $product->sku;
        $title = $variant !== null ? $variant->name : $product->name;
        $link = route('products.show', $product->slug, absolute: true);
        $description = $this->plainDescription($product->description ?: $product->name);
        $imageLink = $this->primaryImageUrl($product);
        $priceNet = $variant !== null ? $variant->currentPrice() : $product->currentPrice();
        $inStock = $variant !== null ? $variant->isInStock() : $product->isInStock();
        $mpn = $variant !== null ? $variant->sku : $product->sku;

        $xml = $this->xmlElement('g:id', $id)
            .$this->xmlElement('g:title', Str::limit($title, 150, ''))
            .$this->xmlElement('g:description', Str::limit($description, 5000, ''))
            .$this->xmlElement('g:link', $link)
            .$this->xmlElement('g:availability', $inStock ? 'in_stock' : 'out_of_stock')
            .$this->xmlElement('g:price', $this->formatGooglePrice($priceNet))
            .$this->xmlElement('g:brand', $brand)
            .$this->xmlElement('g:condition', 'new')
            .$this->xmlElement('g:mpn', $mpn)
            .$this->xmlElement('g:identifier_exists', 'no');

        if ($imageLink !== null) {
            $xml .= $this->xmlElement('g:image_link', $imageLink);
        }

        if ($variant !== null) {
            $xml .= $this->xmlElement('g:item_group_id', (string) $product->id);
        }

        $targetCountry = strtoupper((string) $this->settings->get('google_shopping.target_country', 'PT'));
        $contentLanguage = strtolower((string) $this->settings->get('google_shopping.content_language', 'pt'));

        $xml .= $this->xmlElement('g:target_country', $targetCountry);
        $xml .= $this->xmlElement('g:content_language', $contentLanguage);

        return $xml;
    }

    private function formatGooglePrice(float $netPrice): string
    {
        $includesVat = filter_var(
            $this->settings->get('google_shopping.price_includes_vat', true),
            FILTER_VALIDATE_BOOLEAN,
        );

        $amount = $includesVat ? VatCalculator::grossFromNet($netPrice) : $netPrice;
        $currency = strtoupper((string) $this->settings->get('store.currency', 'EUR'));

        return sprintf('%.2f %s', $amount, $currency);
    }

    private function primaryImageUrl(Product $product): ?string
    {
        $image = $product->images->firstWhere('is_primary', true)
            ?? $product->images->first();

        if (! $image instanceof ProductImage) {
            return null;
        }

        return $this->settings->assetUrl($image->path);
    }

    private function plainDescription(string $html): string
    {
        $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/u', ' ', $text) ?? $text;

        return trim($text);
    }

    private function xmlElement(string $name, string $value): string
    {
        return '<'.$name.'>'.$this->escapeXml($value).'</'.$name.'>';
    }

    private function escapeXml(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}
