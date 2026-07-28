<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateStockRequest;
use App\Models\Product;
use App\Support\StorefrontData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(): Response
    {
        $products = Product::query()
            ->with('images')
            ->orderBy('name')
            ->paginate(30)
            ->through(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'image_url' => StorefrontData::imageUrl(
                    $product->images->firstWhere('is_primary', true)
                        ?? $product->images->first(),
                ),
                'stock_quantity' => $product->stock_quantity,
                'low_stock_threshold' => $product->low_stock_threshold,
                'is_low_stock' => $product->stock_quantity <= $product->low_stock_threshold,
                'status' => $product->status->value,
            ]);

        return Inertia::render('Admin/Stock/Index', ['products' => $products]);
    }

    public function update(UpdateStockRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->validated());

        return Redirect::back()->with('success', 'Stock atualizado.');
    }
}
