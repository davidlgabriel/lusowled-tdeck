<?php

namespace App\Models;

use App\Enums\ContentFormat;
use App\Enums\ContentPageFooterSection;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'title',
    'slug',
    'content',
    'content_format',
    'footer_section',
    'show_in_footer',
    'sort_order',
    'is_published',
])]
class ContentPage extends Model
{
    protected function casts(): array
    {
        return [
            'content_format' => ContentFormat::class,
            'footer_section' => ContentPageFooterSection::class,
            'show_in_footer' => 'boolean',
            'sort_order' => 'integer',
            'is_published' => 'boolean',
        ];
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeInFooter($query)
    {
        return $query
            ->where('show_in_footer', true)
            ->whereNotNull('footer_section')
            ->orderBy('sort_order');
    }

    public function usesHtml(): bool
    {
        return ($this->content_format ?? ContentFormat::Html) === ContentFormat::Html;
    }
}
