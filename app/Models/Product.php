<?php

namespace App\Models;

use App\Enums\ProductStatus;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'slug',
    'description',
    'sku',
    'base_price',
    'sale_price',
    'is_featured',
    'status',
    'stock_quantity',
    'low_stock_threshold',
])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'is_featured' => 'boolean',
            'status' => ProductStatus::class,
            'stock_quantity' => 'integer',
            'low_stock_threshold' => 'integer',
        ];
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'category_product');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage(): HasMany
    {
        return $this->hasMany(ProductImage::class)->where('is_primary', true);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('sort_order');
    }

    public function promotions(): BelongsToMany
    {
        return $this->belongsToMany(Promotion::class, 'promotion_product');
    }

    public function scopeActive($query)
    {
        return $query->where('status', ProductStatus::Active);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('stock_quantity', '<=', 'low_stock_threshold');
    }

    public function currentPrice(): float
    {
        if ($this->sale_price !== null && $this->sale_price < $this->base_price) {
            return (float) $this->sale_price;
        }

        return (float) $this->base_price;
    }

    public function isOnSale(): bool
    {
        return $this->sale_price !== null && $this->sale_price < $this->base_price;
    }

    public function isInStock(): bool
    {
        if ($this->relationLoaded('variants')) {
            $activeVariants = $this->variants->where('is_active', true);

            if ($activeVariants->isNotEmpty()) {
                return $activeVariants->contains(fn (ProductVariant $variant) => $variant->isInStock());
            }
        }

        return $this->stock_quantity > 0;
    }

    /**
     * @return array{min: float, max: float}|null
     */
    public function variantPriceRange(): ?array
    {
        if (! $this->relationLoaded('variants')) {
            $this->load(['variants' => fn ($q) => $q->where('is_active', true)]);
        }

        $activeVariants = $this->variants->where('is_active', true);

        if ($activeVariants->isEmpty()) {
            return null;
        }

        $prices = $activeVariants->map(fn (ProductVariant $variant) => $variant->currentPrice());

        return [
            'min' => (float) $prices->min(),
            'max' => (float) $prices->max(),
        ];
    }
}
