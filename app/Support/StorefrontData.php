<?php

namespace App\Support;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Promotion;

class StorefrontData
{
    /**
     * @return array<string, mixed>
     */
    public static function product(Product $product, bool $detailed = false): array
    {
        $product->loadMissing(['images', 'categories', 'variants' => fn ($q) => $q->where('is_active', true)]);

        $primaryImage = $product->images->firstWhere('is_primary', true) ?? $product->images->first();

        $data = [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'base_price' => (float) $product->base_price,
            'sale_price' => $product->sale_price !== null ? (float) $product->sale_price : null,
            'current_price' => $product->currentPrice(),
            'is_on_sale' => $product->isOnSale(),
            'is_featured' => $product->is_featured,
            'is_in_stock' => $product->isInStock(),
            'stock_quantity' => $product->stock_quantity,
            'image_url' => self::imageUrl($primaryImage),
            'categories' => $product->categories->map(fn (Category $c) => self::category($c))->values(),
            'has_variants' => $product->variants->isNotEmpty(),
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
                'options' => $v->options,
                'current_price' => $v->currentPrice(),
                'stock_quantity' => $v->stock_quantity,
                'is_in_stock' => $v->isInStock(),
            ])->values();
            $data['has_variants'] = $product->variants->isNotEmpty();
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
