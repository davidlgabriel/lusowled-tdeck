<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoreSeoTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_page_includes_seo_and_json_ld(): void
    {
        $this->seed();

        $product = Product::query()->active()->first();
        $this->assertNotNull($product);

        $this->get(route('products.show', $product->slug))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Store/Products/Show')
                ->has('seo')
                ->where('seo.title', $product->name)
                ->has('seo.json_ld'));
    }

    public function test_sitemap_lists_active_product_urls(): void
    {
        $this->seed();

        $product = Product::query()->active()->first();
        $this->assertNotNull($product);

        $response = $this->get(route('sitemap'));

        $response->assertOk();
        $response->assertSee(route('products.show', $product->slug, absolute: true), false);
        $response->assertSee('<urlset', false);
    }

    public function test_robots_txt_points_to_sitemap(): void
    {
        $this->seed();

        $response = $this->get(route('robots'));

        $response->assertOk();
        $response->assertSee('Sitemap: '.route('sitemap', absolute: true), false);
        $response->assertSee('Disallow: /admin', false);
    }

    public function test_home_page_includes_seo_payload(): void
    {
        $this->seed();

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Store/Home')
                ->has('seo')
                ->where('seo.title', 'Início'));
    }
}
