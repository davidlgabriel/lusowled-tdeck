<?php

namespace App\Http\Controllers\Store;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Support\StorefrontData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::query()
            ->active()
            ->with(['images', 'categories']);

        if ($search = $request->string('q')->trim()->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($categorySlug = $request->string('categoria')->trim()->toString()) {
            $query->whereHas('categories', fn ($q) => $q->where('slug', $categorySlug));
        }

        if ($request->boolean('promocao')) {
            $query->whereNotNull('sale_price')
                ->whereColumn('sale_price', '<', 'base_price');
        }

        if ($min = $request->float('preco_min')) {
            $query->whereRaw('COALESCE(sale_price, base_price) >= ?', [$min]);
        }

        if ($max = $request->float('preco_max')) {
            $query->whereRaw('COALESCE(sale_price, base_price) <= ?', [$max]);
        }

        $sort = $request->string('ordenar', 'recentes')->toString();
        match ($sort) {
            'preco_asc' => $query->orderByRaw('COALESCE(sale_price, base_price) asc'),
            'preco_desc' => $query->orderByRaw('COALESCE(sale_price, base_price) desc'),
            'nome' => $query->orderBy('name'),
            default => $query->latest(),
        };

        $products = $query->paginate(12)->withQueryString();

        $categories = Category::query()
            ->active()
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Category $c) => StorefrontData::category($c));

        return Inertia::render('Store/Products/Index', [
            'products' => $products->through(fn (Product $p) => StorefrontData::product($p)),
            'categories' => $categories,
            'filters' => [
                'q' => $search ?? '',
                'categoria' => $categorySlug ?? '',
                'promocao' => $request->boolean('promocao'),
                'preco_min' => $request->input('preco_min'),
                'preco_max' => $request->input('preco_max'),
                'ordenar' => $sort,
            ],
        ]);
    }

    public function search(Request $request): \Illuminate\Http\JsonResponse
    {
        $search = $request->string('q')->trim()->toString();

        if (mb_strlen($search) < 2) {
            return response()->json(['products' => []]);
        }

        $products = Product::query()
            ->active()
            ->with(['images', 'categories'])
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->limit(8)
            ->get()
            ->map(fn (Product $p) => StorefrontData::product($p));

        return response()->json(['products' => $products]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->status === ProductStatus::Active, 404);

        $product->load(['images', 'categories', 'variants' => fn ($q) => $q->where('is_active', true)]);

        $related = Product::query()
            ->active()
            ->where('id', '!=', $product->id)
            ->whereHas('categories', fn ($q) => $q->whereIn(
                'categories.id',
                $product->categories->pluck('id')
            ))
            ->with(['images', 'categories'])
            ->limit(4)
            ->get()
            ->map(fn (Product $p) => StorefrontData::product($p));

        return Inertia::render('Store/Products/Show', [
            'product' => StorefrontData::product($product, detailed: true),
            'relatedProducts' => $related,
        ]);
    }
}
