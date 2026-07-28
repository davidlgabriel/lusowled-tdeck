<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Support\StorefrontData;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function show(Category $category): Response
    {
        abort_unless($category->is_active, 404);

        $category->load('children');

        $categoryIds = collect([$category->id])
            ->merge($category->children->pluck('id'));

        $products = Product::query()
            ->active()
            ->whereHas('categories', fn ($q) => $q->whereIn('categories.id', $categoryIds))
            ->with(['images', 'categories'])
            ->latest()
            ->paginate(12);

        return Inertia::render('Store/Categories/Show', [
            'category' => StorefrontData::category($category),
            'subcategories' => $category->children->map(fn (Category $c) => StorefrontData::category($c))->values(),
            'products' => $products->through(fn (Product $p) => StorefrontData::product($p)),
        ]);
    }
}
