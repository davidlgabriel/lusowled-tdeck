<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Promotion;
use App\Support\StorefrontData;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $featured = Product::query()
            ->active()
            ->featured()
            ->with(['images', 'categories'])
            ->limit(6)
            ->get()
            ->map(fn (Product $p) => StorefrontData::product($p));

        $categories = Category::query()
            ->active()
            ->roots()
            ->orderBy('sort_order')
            ->limit(5)
            ->get()
            ->map(fn (Category $c) => StorefrontData::category($c));

        $promotions = Promotion::query()
            ->active()
            ->limit(3)
            ->get()
            ->map(fn (Promotion $p) => StorefrontData::promotion($p));

        return Inertia::render('Store/Home', [
            'featuredProducts' => $featured,
            'categories' => $categories,
            'promotions' => $promotions,
        ]);
    }
}
