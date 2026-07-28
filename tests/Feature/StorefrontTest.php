<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use App\Services\SettingsService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StorefrontTest extends TestCase
{
    use RefreshDatabase;

    public function test_homepage_renders_store(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Store/Home')
                ->has('featuredProducts')
                ->has('categories'));
    }

    public function test_products_index_lists_active_products(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->get(route('products.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Store/Products/Index')
                ->has('products.data'));
    }

    public function test_product_page_renders_by_slug(): void
    {
        $this->seed(DatabaseSeeder::class);

        $product = Product::query()->active()->first();
        $this->assertNotNull($product);

        $this->get(route('products.show', $product->slug))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Store/Products/Show')
                ->where('product.slug', $product->slug));
    }

    public function test_guest_can_add_product_to_cart(): void
    {
        $this->seed(DatabaseSeeder::class);

        $product = Product::query()->active()->where('stock_quantity', '>', 0)->first();
        $this->assertNotNull($product);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertRedirect();

        $this->get(route('cart.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Store/Cart/Index')
                ->where('cart.item_count', 1));
    }

    public function test_customer_can_view_own_order_after_authorize_fix(): void
    {
        $this->seed(DatabaseSeeder::class);

        $customer = User::query()->where('email', 'cliente@lusoweld.pt')->first();

        $this->actingAs($customer)
            ->get(route('account.orders.show', 1))
            ->assertOk();
    }

    public function test_sales_disabled_blocks_cart_and_checkout_but_shows_products(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->disableSales();

        $product = Product::query()->active()->where('stock_quantity', '>', 0)->first();
        $this->assertNotNull($product);

        $this->get(route('products.show', $product->slug))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Store/Products/Show')
                ->where('store.sales_enabled', false));

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertSessionHasErrors('sales');

        $this->get(route('checkout.index'))
            ->assertRedirect(route('products.index'));
    }

    private function disableSales(): void
    {
        Setting::query()->updateOrCreate(
            ['key' => 'store.sales_enabled'],
            [
                'type' => 'boolean',
                'group' => 'store',
                'label' => 'Vendas online',
                'description' => null,
                'is_public' => true,
                'value' => '0',
            ],
        );

        app(SettingsService::class)->clearCache();
    }

    public function test_product_with_variants_requires_variant_in_cart(): void
    {
        $this->seed(DatabaseSeeder::class);

        $product = Product::factory()->create([
            'stock_quantity' => 0,
            'base_price' => 30,
        ]);

        ProductVariant::factory()->create([
            'product_id' => $product->id,
            'name' => 'Cinza — Pack 5 m²',
            'sku' => 'TEST-VAR-GRAY',
            'options' => ['cor' => 'Cinza', 'pack' => '5 m²'],
            'price' => 35,
            'stock_quantity' => 5,
        ]);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertSessionHasErrors('product_variant_id');

        $variant = $product->variants()->first();

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ])->assertRedirect();

        $this->get(route('cart.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Store/Cart/Index')
                ->where('cart.item_count', 1));
    }

    public function test_product_page_exposes_variant_prices(): void
    {
        $this->seed(DatabaseSeeder::class);

        $product = Product::factory()->create([
            'status' => 'active',
            'stock_quantity' => 0,
            'base_price' => 25,
        ]);

        ProductVariant::factory()->create([
            'product_id' => $product->id,
            'name' => 'Castanho — Pack 5 m²',
            'options' => ['cor' => 'Castanho', 'pack' => '5 m²'],
            'price' => 40,
            'stock_quantity' => 3,
        ]);

        ProductVariant::factory()->create([
            'product_id' => $product->id,
            'name' => 'Castanho — Pack 10 m²',
            'options' => ['cor' => 'Castanho', 'pack' => '10 m²'],
            'price' => 75,
            'stock_quantity' => 2,
        ]);

        $this->get(route('products.show', $product->slug))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Store/Products/Show')
                ->where('product.has_variants', true)
                ->where('product.price_from', 40)
                ->where('product.price_to', 75)
                ->where('product.has_variable_pricing', true)
                ->has('product.variants', 2));
    }
}
