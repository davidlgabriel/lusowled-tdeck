<?php

namespace App\Services;

use App\Models\Category;
use App\Models\ContentPage;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Support\StorefrontData;
use App\Support\VatCalculator;
use Illuminate\Support\Str;

class StoreSeoService
{
    public function __construct(
        private readonly SettingsService $settings,
        private readonly StoreSalesService $sales,
    ) {}

    /**
     * @return array{
     *     title: string,
     *     description: string,
     *     canonical: string,
     *     og: array{title: string, description: string, url: string, type: string, image: ?string},
     *     json_ld: array<string, mixed>
     * }
     */
    public function forHome(): array
    {
        $storeName = $this->storeName();
        $description = $this->plainText(
            (string) $this->settings->get('store.footer_tagline', $storeName),
            160,
        );

        $graph = [
            $this->organizationNode(),
            $this->webSiteNode(),
        ];

        return $this->pageSeo(
            title: 'Início',
            description: $description !== '' ? $description : "Comprar online na {$storeName}.",
            canonical: route('home', absolute: true),
            ogType: 'website',
            image: $this->settings->assetUrl((string) $this->settings->get('store.logo_path')),
            graph: $graph,
        );
    }

    /**
     * @return array{
     *     title: string,
     *     description: string,
     *     canonical: string,
     *     og: array{title: string, description: string, url: string, type: string, image: ?string},
     *     json_ld: array<string, mixed>
     * }
     */
    public function forProductsIndex(?string $searchQuery = null): array
    {
        $storeName = $this->storeName();
        $title = $searchQuery
            ? 'Pesquisa: '.$searchQuery
            : 'Produtos';
        $description = $searchQuery
            ? "Resultados para «{$searchQuery}» na {$storeName}."
            : "Catálogo completo de produtos {$storeName} — decking, cladding e acessórios.";

        return $this->pageSeo(
            title: $title,
            description: $description,
            canonical: route('products.index', absolute: true),
            ogType: 'website',
            image: null,
            graph: [$this->webSiteNode()],
        );
    }

    /**
     * @return array{
     *     title: string,
     *     description: string,
     *     canonical: string,
     *     og: array{title: string, description: string, url: string, type: string, image: ?string},
     *     json_ld: array<string, mixed>
     * }
     */
    public function forProduct(Product $product): array
    {
        $product->loadMissing([
            'images',
            'categories',
            'variants' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order'),
        ]);

        $storeName = $this->storeName();
        $canonical = route('products.show', $product->slug, absolute: true);
        $plain = $this->plainText($product->description ?: $product->name, 160);
        $description = $plain !== '' ? $plain : "{$product->name} — {$storeName}";

        $images = $product->images
            ->map(fn (ProductImage $img) => StorefrontData::imageUrl($img))
            ->filter()
            ->values()
            ->all();

        $primaryImage = $images[0] ?? null;

        $graph = [
            $this->productNode($product, $canonical, $images),
            $this->breadcrumbNode([
                ['Início', route('home', absolute: true)],
                ['Produtos', route('products.index', absolute: true)],
                [$product->name, $canonical],
            ]),
        ];

        return $this->pageSeo(
            title: $product->name,
            description: $description,
            canonical: $canonical,
            ogType: 'product',
            image: $primaryImage,
            graph: $graph,
        );
    }

    /**
     * @return array{
     *     title: string,
     *     description: string,
     *     canonical: string,
     *     og: array{title: string, description: string, url: string, type: string, image: ?string},
     *     json_ld: array<string, mixed>
     * }
     */
    public function forCategory(Category $category): array
    {
        $storeName = $this->storeName();
        $canonical = route('categories.show', $category->slug, absolute: true);
        $plain = $this->plainText($category->description ?: $category->name, 160);
        $description = $plain !== '' ? $plain : "Produtos na categoria {$category->name} — {$storeName}.";

        $graph = [
            $this->breadcrumbNode([
                ['Início', route('home', absolute: true)],
                [$category->name, $canonical],
            ]),
        ];

        return $this->pageSeo(
            title: $category->name,
            description: $description,
            canonical: $canonical,
            ogType: 'website',
            image: $this->settings->assetUrl($category->image_path),
            graph: $graph,
        );
    }

    /**
     * @return array{
     *     title: string,
     *     description: string,
     *     canonical: string,
     *     og: array{title: string, description: string, url: string, type: string, image: ?string},
     *     json_ld: array<string, mixed>
     * }
     */
    public function forContentPage(ContentPage $page): array
    {
        $storeName = $this->storeName();
        $canonical = route('pages.show', $page->slug, absolute: true);
        $plain = $this->plainText($page->content ?: $page->title, 160);
        $description = $plain !== '' ? $plain : "{$page->title} — {$storeName}";

        return $this->pageSeo(
            title: $page->title,
            description: $description,
            canonical: $canonical,
            ogType: 'article',
            image: null,
            graph: [
                $this->breadcrumbNode([
                    ['Início', route('home', absolute: true)],
                    [$page->title, $canonical],
                ]),
            ],
        );
    }

    /**
     * @param  list<array{0: string, 1: string}>  $items
     * @return array<string, mixed>
     */
    private function breadcrumbNode(array $items): array
    {
        $list = [];
        foreach ($items as $position => [$name, $url]) {
            $list[] = [
                '@type' => 'ListItem',
                'position' => $position + 1,
                'name' => $name,
                'item' => $url,
            ];
        }

        return [
            '@type' => 'BreadcrumbList',
            'itemListElement' => $list,
        ];
    }

    /**
     * @param  list<string|null>  $images
     * @return array<string, mixed>
     */
    private function productNode(Product $product, string $url, array $images): array
    {
        $node = [
            '@type' => 'Product',
            'name' => $product->name,
            'description' => $this->plainText($product->description ?: $product->name, 5000),
            'sku' => $product->sku,
            'url' => $url,
            'brand' => [
                '@type' => 'Brand',
                'name' => $this->brandName(),
            ],
        ];

        if ($images !== []) {
            $node['image'] = count($images) === 1 ? $images[0] : $images;
        }

        $offers = $this->offersForProduct($product, $url);
        if ($offers !== null) {
            $node['offers'] = $offers;
        }

        return $node;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function offersForProduct(Product $product, string $url): ?array
    {
        if (! $this->sales->enabled()) {
            return null;
        }

        $currency = strtoupper((string) $this->settings->get('store.currency', 'EUR'));
        $activeVariants = $product->variants->where('is_active', true);

        if ($activeVariants->isNotEmpty()) {
            $prices = $activeVariants->map(function (ProductVariant $variant) use ($product) {
                $variant->setRelation('product', $product);

                return $this->schemaPrice($variant->currentPrice());
            });

            $inStock = $activeVariants->contains(fn (ProductVariant $v) => $v->isInStock());

            return [
                '@type' => 'AggregateOffer',
                'url' => $url,
                'priceCurrency' => $currency,
                'lowPrice' => (string) $prices->min(),
                'highPrice' => (string) $prices->max(),
                'offerCount' => $activeVariants->count(),
                'availability' => $inStock
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
                'itemCondition' => 'https://schema.org/NewCondition',
            ];
        }

        return [
            '@type' => 'Offer',
            'url' => $url,
            'priceCurrency' => $currency,
            'price' => $this->schemaPrice($product->currentPrice()),
            'availability' => $product->isInStock()
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            'itemCondition' => 'https://schema.org/NewCondition',
        ];
    }

    private function schemaPrice(float $netPrice): string
    {
        $amount = $this->priceIncludesVat()
            ? VatCalculator::grossFromNet($netPrice)
            : $netPrice;

        return number_format($amount, 2, '.', '');
    }

    /**
     * @return array<string, mixed>
     */
    private function organizationNode(): array
    {
        $node = [
            '@type' => 'Organization',
            'name' => $this->storeName(),
            'url' => url('/'),
        ];

        $logo = $this->settings->assetUrl((string) $this->settings->get('store.logo_path'));
        if ($logo) {
            $node['logo'] = $logo;
        }

        return $node;
    }

    /**
     * @return array<string, mixed>
     */
    private function webSiteNode(): array
    {
        return [
            '@type' => 'WebSite',
            'name' => $this->storeName(),
            'url' => url('/'),
            'potentialAction' => [
                '@type' => 'SearchAction',
                'target' => [
                    '@type' => 'EntryPoint',
                    'urlTemplate' => route('products.index', absolute: true).'?q={search_term_string}',
                ],
                'query-input' => 'required name=search_term_string',
            ],
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $graph
     * @return array{
     *     title: string,
     *     description: string,
     *     canonical: string,
     *     og: array{title: string, description: string, url: string, type: string, image: ?string},
     *     json_ld: array<string, mixed>
     * }
     */
    private function pageSeo(
        string $title,
        string $description,
        string $canonical,
        string $ogType,
        ?string $image,
        array $graph,
    ): array {
        $storeName = $this->storeName();
        $ogTitle = $title === 'Início' ? $storeName : "{$title} | {$storeName}";

        return [
            'title' => $title,
            'description' => Str::limit($description, 160, '…'),
            'canonical' => $canonical,
            'og' => [
                'title' => $ogTitle,
                'description' => Str::limit($description, 200, '…'),
                'url' => $canonical,
                'type' => $ogType,
                'image' => $image,
            ],
            'json_ld' => [
                '@context' => 'https://schema.org',
                '@graph' => $graph,
            ],
        ];
    }

    public function plainText(?string $html, int $limit = 160): string
    {
        if ($html === null || trim($html) === '') {
            return '';
        }

        $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/u', ' ', $text) ?? $text;
        $text = trim($text);

        return Str::limit($text, $limit, '…');
    }

    private function storeName(): string
    {
        return (string) $this->settings->get('store.name', 'Loja');
    }

    private function brandName(): string
    {
        $brand = trim((string) $this->settings->get('google_shopping.brand', ''));

        return $brand !== '' ? $brand : $this->storeName();
    }

    private function priceIncludesVat(): bool
    {
        return filter_var(
            $this->settings->get('google_shopping.price_includes_vat', true),
            FILTER_VALIDATE_BOOLEAN,
        );
    }
}
