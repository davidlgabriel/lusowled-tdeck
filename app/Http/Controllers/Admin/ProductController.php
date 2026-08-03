<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        private readonly SettingsService $settings,
    ) {}

    public function index(): Response
    {
        $products = Product::query()
            ->with('categories')
            ->withCount([
                'variants as active_variants_count' => fn ($q) => $q->where('is_active', true),
            ])
            ->latest()
            ->paginate(20)
            ->through(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'base_price' => (float) $product->base_price,
                'sale_price' => $product->sale_price !== null ? (float) $product->sale_price : null,
                'status' => $product->status->value,
                'status_label' => $product->status->label(),
                'stock_quantity' => $product->stock_quantity,
                'is_featured' => $product->is_featured,
                'categories' => $product->categories->pluck('name'),
                'active_variants_count' => (int) $product->active_variants_count,
            ]);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Products/Form', [
            'product' => null,
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $data = $this->productData($request);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name']);

        $product = Product::query()->create($data);
        $product->categories()->sync($request->input('category_ids', []));

        return Redirect::route('admin.products.show', $product)
            ->with('success', 'Produto criado. Adicione imagens e variantes abaixo.');
    }

    public function show(Product $product): Response
    {
        $product->load(['categories', 'images', 'variants']);

        return Inertia::render('Admin/Products/Show', [
            'product' => $this->formatProduct($product),
            'storeUrl' => route('products.show', $product->slug),
        ]);
    }

    public function edit(Product $product): Response
    {
        $product->load(['categories', 'images', 'variants']);

        return Inertia::render('Admin/Products/Form', [
            'product' => $this->formatProduct($product),
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $data = $this->productData($request);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name'], $product->id);

        $product->update($data);
        $product->categories()->sync($request->input('category_ids', []));

        return Redirect::route('admin.products.edit', $product)
            ->with('success', 'Produto atualizado.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->images()->each(function (ProductImage $image) {
            $this->deleteImageFile($image);
        });

        $product->categories()->detach();
        $product->delete();

        return Redirect::route('admin.products.index')
            ->with('success', 'Produto eliminado.');
    }

    public function storeImage(Request $request, Product $product): RedirectResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:5120'],
        ]);

        $path = $request->file('image')->store('products/'.$product->id, 'public');
        $isPrimary = $product->images()->count() === 0;

        $product->images()->create([
            'path' => $path,
            'alt_text' => $product->name,
            'sort_order' => $product->images()->count(),
            'is_primary' => $isPrimary,
        ]);

        return Redirect::back()->with('success', 'Imagem adicionada.');
    }

    public function destroyImage(Product $product, ProductImage $image): RedirectResponse
    {
        abort_unless($image->product_id === $product->id, 404);

        $wasPrimary = $image->is_primary;
        $this->deleteImageFile($image);
        $image->delete();

        if ($wasPrimary) {
            $next = $product->images()->orderBy('sort_order')->first();
            $next?->update(['is_primary' => true]);
        }

        return Redirect::back()->with('success', 'Imagem removida.');
    }

    public function setPrimaryImage(Product $product, ProductImage $image): RedirectResponse
    {
        abort_unless($image->product_id === $product->id, 404);

        $product->images()->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);

        return Redirect::back()->with('success', 'Imagem principal definida.');
    }

    /**
     * @return array<string, mixed>
     */
    private function productData(ProductRequest $request): array
    {
        $data = $request->validated();
        unset($data['category_ids']);
        $data['is_featured'] = $request->boolean('is_featured');

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    private function formatProduct(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'description' => $product->description,
            'base_price' => (float) $product->base_price,
            'sale_price' => $product->sale_price !== null ? (float) $product->sale_price : null,
            'status' => $product->status->value,
            'stock_quantity' => $product->stock_quantity,
            'low_stock_threshold' => $product->low_stock_threshold,
            'is_featured' => $product->is_featured,
            'category_ids' => $product->categories->pluck('id'),
            'images' => $product->images->map(fn (ProductImage $img) => [
                'id' => $img->id,
                'url' => $this->settings->assetUrl($img->path),
                'is_primary' => $img->is_primary,
            ]),
            'variants' => $product->variants->map(fn (ProductVariant $variant) => [
                'id' => $variant->id,
                'name' => $variant->name,
                'sku' => $variant->sku,
                'option_cor' => $variant->options['cor'] ?? '',
                'option_pack' => $variant->options['pack'] ?? '',
                'price' => $variant->price !== null ? (float) $variant->price : '',
                'stock_quantity' => $variant->stock_quantity,
                'sort_order' => $variant->sort_order,
                'is_active' => $variant->is_active,
            ]),
        ];
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function categoryOptions(): array
    {
        return Category::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Category $c) => ['id' => $c->id, 'name' => $c->name])
            ->all();
    }

    private function uniqueSlug(string $nameOrSlug, ?int $ignoreId = null): string
    {
        $slug = Str::slug($nameOrSlug);
        $original = $slug;
        $i = 1;

        while (
            Product::query()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $original.'-'.$i++;
        }

        return $slug;
    }

    private function deleteImageFile(ProductImage $image): void
    {
        $disk = config('filesystems.product_images_disk', 'public');
        \Illuminate\Support\Facades\Storage::disk($disk)->delete($image->path);
    }
}
