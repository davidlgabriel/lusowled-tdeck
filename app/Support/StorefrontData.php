<?php

namespace App\Support;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Promotion;
use App\Services\StoreSalesService;

class StorefrontData
{
    /**
     * @return array<string, mixed>
     */
    public static function product(Product $product, bool $detailed = false): array
    {
        $product->loadMissing(['images', 'categories', 'variants' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order')]);

        $product->variants->each(fn (ProductVariant $variant) => $variant->setRelation('product', $product));

        $primaryImage = $product->images->firstWhere('is_primary', true) ?? $product->images->first();

        $hasVariants = $product->variants->isNotEmpty();
        $priceRange = $hasVariants ? $product->variantPriceRange() : null;

        $data = [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'base_price' => (float) $product->base_price,
            'sale_price' => $product->sale_price !== null ? (float) $product->sale_price : null,
            'current_price' => $priceRange ? $priceRange['min'] : $product->currentPrice(),
            'price_from' => $priceRange ? $priceRange['min'] : null,
            'price_to' => $priceRange ? $priceRange['max'] : null,
            'has_variable_pricing' => $priceRange !== null && $priceRange['min'] !== $priceRange['max'],
            'is_on_sale' => $hasVariants ? false : $product->isOnSale(),
            'is_featured' => $product->is_featured,
            'is_in_stock' => $product->isInStock(),
            'stock_quantity' => $product->stock_quantity,
            'image_url' => self::imageUrl($primaryImage),
            'categories' => $product->categories->map(fn (Category $c) => self::category($c))->values(),
            'has_variants' => $hasVariants,
        ];

        if ($detailed) {
            $data['description'] = $product->description;
            $data['images'] = $product->images->map(fn (ProductImage $img) => [
                'id' => $img->id,
                'url' => self::imageUrl($img),
                'alt' => $img->alt_text ?? $product->name,
                'is_primary' => $img->is_primary,
            ])->values();
            $data['variants'] = $product->variants->map(fn (ProductVariant $v) => [
                'id' => $v->id,
                'name' => $v->name,
                'sku' => $v->sku,
                'options' => is_array($v->options) ? $v->options : [],
                'price' => $v->price !== null ? (float) $v->price : null,
                'current_price' => $v->price !== null
                    ? (float) $v->price
                    : $product->currentPrice(),
                'stock_quantity' => $v->stock_quantity,
                'is_in_stock' => $v->isInStock(),
            ])->values()->all();
            $data['has_variants'] = count($data['variants']) > 0;
        }

        if (! app(StoreSalesService::class)->enabled()) {
            $data['base_price'] = null;
            $data['sale_price'] = null;
            $data['current_price'] = null;
            $data['price_from'] = null;
            $data['price_to'] = null;
            $data['has_variable_pricing'] = false;
            $data['is_on_sale'] = false;

            if (isset($data['variants'])) {
                $data['variants'] = collect($data['variants'])
                    ->map(fn (array $variant) => [
                        ...$variant,
                        'current_price' => null,
                    ])
                    ->values()
                    ->all();
            }
        }

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    public static function category(Category $category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'image_url' => PublicAsset::url($category->image_path),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function promotion(Promotion $promotion): array
    {
        return [
            'id' => $promotion->id,
            'name' => $promotion->name,
            'description' => $promotion->description,
            'code' => $promotion->code,
            'type' => $promotion->type->value,
            'value' => (float) $promotion->value,
            'applies_to' => $promotion->applies_to->value,
        ];
    }

    public static function imageUrl(?ProductImage $image): ?string
    {
        if (! $image) {
            return null;
        }

        try {
            return $image->url();
        } catch (\Throwable) {
            return null;
        }
    }

    public static function formatMoney(float $amount, string $currency = 'EUR'): string
    {
        return (new \NumberFormatter('pt_PT', \NumberFormatter::CURRENCY))
            ->formatCurrency($amount, $currency);
    }
}
