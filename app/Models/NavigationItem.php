<?php

namespace App\Models;

use App\Enums\NavigationItemType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'label',
    'type',
    'target',
    'location',
    'sort_order',
    'is_active',
    'open_in_new_tab',
])]
class NavigationItem extends Model
{
    protected function casts(): array
    {
        return [
            'type' => NavigationItemType::class,
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'open_in_new_tab' => 'boolean',
        ];
    }

    public function scopeActiveHeader($query)
    {
        return $query
            ->where('location', 'header')
            ->where('is_active', true)
            ->orderBy('sort_order');
    }

    public function resolveUrl(): string
    {
        return match ($this->type) {
            NavigationItemType::Page => route('pages.show', $this->target),
            NavigationItemType::Category => route('categories.show', $this->target),
            NavigationItemType::Products => route('products.index'),
            NavigationItemType::Home => route('home'),
            NavigationItemType::Url => $this->target ?? '#',
        };
    }
}
