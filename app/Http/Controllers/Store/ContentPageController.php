<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\ContentPage;
use App\Services\StoreSeoService;
use Inertia\Inertia;
use Inertia\Response;

class ContentPageController extends Controller
{
    public function __construct(
        private readonly StoreSeoService $seo,
    ) {}

    public function show(ContentPage $page): Response
    {
        abort_unless($page->is_published, 404);

        return Inertia::render('Store/Pages/Show', [
            'page' => [
                'title' => $page->title,
                'slug' => $page->slug,
                'content' => $page->content ?? '',
                'content_format' => $page->content_format?->value ?? 'html',
            ],
            'seo' => $this->seo->forContentPage($page),
        ]);
    }
}
