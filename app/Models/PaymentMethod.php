<?php

namespace App\Models;

use App\Support\PublicAsset;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name',
    'image_path',
    'sort_order',
    'is_active',
])]
class PaymentMethod extends Model
{
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }

    public function imageUrl(): string
    {
        return PublicAsset::url($this->image_path) ?? '';
    }
}
