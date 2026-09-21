<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\ContentPage;
use App\Models\Product;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $urls = [];

        $urls[] = $this->entry(route('home', absolute: true), now(), 'daily', '1.0');
        $urls[] = $this->entry(route('products.index', absolute: true), now(), 'daily', '0.9');
        $urls[] = $this->entry(route('contact.index', absolute: true), now(), 'monthly', '0.5');

        Category::query()
            ->active()
            ->orderBy('id')
            ->chunk(100, function ($categories) use (&$urls) {
                foreach ($categories as $category) {
                    $urls[] = $this->entry(
                        route('categories.show', $category->slug, absolute: true),
                        $category->updated_at,
                        'weekly',
                        '0.8',
                    );
                }
            });

        Product::query()
            ->active()
            ->orderBy('id')
            ->chunk(100, function ($products) use (&$urls) {
                foreach ($products as $product) {
                    $urls[] = $this->entry(
                        route('products.show', $product->slug, absolute: true),
                        $product->updated_at,
                        'weekly',
                        '0.8',
                    );
                }
            });

        ContentPage::query()
            ->published()
            ->orderBy('id')
            ->chunk(100, function ($pages) use (&$urls) {
                foreach ($pages as $page) {
                    $urls[] = $this->entry(
                        route('pages.show', $page->slug, absolute: true),
                        $page->updated_at,
                        'monthly',
                        '0.4',
                    );
                }
            });

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        foreach ($urls as $url) {
            $xml .= '<url>'
                .'<loc>'.e($url['loc']).'</loc>'
                .'<lastmod>'.e($url['lastmod']).'</lastmod>'
                .'<changefreq>'.e($url['changefreq']).'</changefreq>'
                .'<priority>'.e($url['priority']).'</priority>'
                .'</url>';
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    /**
     * @return array{loc: string, lastmod: string, changefreq: string, priority: string}
     */
    private function entry(string $loc, ?\Illuminate\Support\Carbon $updatedAt, string $freq, string $priority): array
    {
        return [
            'loc' => $loc,
            'lastmod' => ($updatedAt ?? now())->toAtomString(),
            'changefreq' => $freq,
            'priority' => $priority,
        ];
    }
}
