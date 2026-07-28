<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
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
}
