<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use App\Support\PublicAsset;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoreSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_search_returns_matching_products(): void
    {
        $this->seed(DatabaseSeeder::class);

        $product = Product::query()->active()->first();
        $this->assertNotNull($product);

        $this->getJson(route('products.search', ['q' => $product->sku]))
            ->assertOk()
            ->assertJsonStructure(['products'])
            ->assertJsonFragment(['slug' => $product->slug]);
    }

    public function test_product_search_requires_minimum_query_length(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->getJson(route('products.search', ['q' => 'a']))
            ->assertOk()
            ->assertJson(['products' => []]);
    }

    public function test_public_asset_url_is_relative(): void
    {
        $this->assertSame(
            '/storage/branding/logo.png',
            PublicAsset::url('branding/logo.png'),
        );
    }
}
