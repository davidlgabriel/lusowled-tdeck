<?php

namespace App\Models;

use Database\Factories\ProductVariantFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'product_id',
    'name',
    'sku',
    'options',
    'price',
    'stock_quantity',
    'sort_order',
    'is_active',
])]
class ProductVariant extends Model
{
    /** @use HasFactory<ProductVariantFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'price' => 'decimal:2',
            'stock_quantity' => 'integer',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function currentPrice(): float
    {
        if ($this->price !== null) {
            return (float) $this->price;
        }

        return $this->product->currentPrice();
    }

    public function isInStock(): bool
    {
        return $this->stock_quantity > 0;
    }
}
