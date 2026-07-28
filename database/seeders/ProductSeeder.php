<?php

namespace Database\Seeders;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Database\Seeders\Support\AvidCatalog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        foreach (AvidCatalog::products() as $item) {
            $product = Product::query()->updateOrCreate(
                ['sku' => $item['sku']],
                [
                    'name' => $item['name'],
                    'slug' => Str::slug($item['name']),
                    'description' => $this->description($item['name'], $item['description']),
                    'base_price' => $item['base_price'],
                    'sale_price' => $item['sale_price'],
                    'is_featured' => $item['featured'],
                    'status' => ProductStatus::Active,
                    'stock_quantity' => $item['stock'],
                    'low_stock_threshold' => 10,
                ],
            );

            $category = Category::query()->where('slug', $item['category_slug'])->first();
            $categoryIds = collect([$category?->id, $category?->parent_id])->filter()->unique()->values();

            $product->categories()->sync($categoryIds);

            ProductImage::query()->updateOrCreate(
                [
                    'product_id' => $product->id,
                    'is_primary' => true,
                ],
                [
                    'path' => $item['image'],
                    'alt_text' => $item['name'],
                    'sort_order' => 0,
                ],
            );
        }
    }

    private function description(string $name, string $summary): string
    {
        return "<p><strong>{$name}</strong> — {$summary}</p>"
            .'<p>Produto T-DECK by True Solutions — composite WPC para uso exterior.</p>'
            .'<ul>'
            .'<li>Aparência natural de madeira</li>'
            .'<li>Resistente à humidade e UV</li>'
            .'<li>Baixa manutenção — vida útil 15+ anos</li>'
            .'<li>Disponível em 8 cores (sob consulta)</li>'
            .'</ul>';
    }
}
