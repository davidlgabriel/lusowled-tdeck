<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;

class RobotsController extends Controller
{
    public function __invoke(): Response
    {
        $sitemap = route('sitemap', absolute: true);

        $body = implode("\n", [
            'User-agent: *',
            'Disallow: /admin',
            'Disallow: /conta',
            'Disallow: /checkout',
            'Disallow: /carrinho',
            '',
            "Sitemap: {$sitemap}",
            '',
        ]);

        return response($body, 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
