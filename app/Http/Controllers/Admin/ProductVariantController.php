<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductVariantRequest;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;

class ProductVariantController extends Controller
{
    public function store(ProductVariantRequest $request, Product $product): RedirectResponse
    {
        $data = $this->variantData($request);
        $data['product_id'] = $product->id;

        $product->variants()->create($data);

        return Redirect::route('admin.products.show', $product)
            ->with('success', 'Variante adicionada.');
    }

    public function update(
        ProductVariantRequest $request,
        Product $product,
        ProductVariant $variant,
    ): RedirectResponse {
        $this->assertVariantBelongsToProduct($product, $variant);

        $variant->update($this->variantData($request));

        return Redirect::route('admin.products.show', $product)
            ->with('success', 'Variante atualizada.');
    }

    public function destroy(Product $product, ProductVariant $variant): RedirectResponse
    {
        $this->assertVariantBelongsToProduct($product, $variant);

        $variant->delete();

        return Redirect::route('admin.products.show', $product)
            ->with('success', 'Variante eliminada.');
    }

    /**
     * @return array<string, mixed>
     */
    private function variantData(ProductVariantRequest $request): array
    {
        $data = $request->safe()->only([
            'name',
            'sku',
            'stock_quantity',
            'sort_order',
        ]);

        $data['options'] = $request->options() ?: null;
        $data['price'] = $request->input('price') !== null && $request->input('price') !== ''
            ? $request->input('price')
            : null;
        $data['is_active'] = $request->boolean('is_active', true);
        $data['sort_order'] = $data['sort_order'] ?? 0;

        return $data;
    }

    private function assertVariantBelongsToProduct(Product $product, ProductVariant $variant): void
    {
        abort_unless($variant->product_id === $product->id, 404);
    }
}
