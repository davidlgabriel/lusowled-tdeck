<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_dashboard(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'info@lusoweld.com')->first();

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->has('stats')
                ->has('recentOrders'));
    }

    public function test_customer_cannot_access_admin(): void
    {
        $this->seed(DatabaseSeeder::class);

        $customer = User::query()->where('email', 'cliente@lusoweld.pt')->first();

        $this->actingAs($customer)
            ->get(route('admin.dashboard'))
            ->assertForbidden();
    }

    public function test_admin_can_list_products(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'info@lusoweld.com')->first();

        $this->actingAs($admin)
            ->get(route('admin.products.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Products/Index')
                ->has('products.data'));
    }

    public function test_admin_can_access_settings(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'info@lusoweld.com')->first();

        $this->actingAs($admin)
            ->get(route('admin.settings.index', ['group' => 'stripe']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Settings/Index')
                ->where('group', 'stripe')
                ->has('settings'));
    }

    public function test_admin_can_create_category(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'info@lusoweld.com')->first();

        $this->actingAs($admin)
            ->post(route('admin.categories.store'), [
                'name' => 'Nova Categoria Teste',
                'is_active' => true,
                'sort_order' => 10,
            ])
            ->assertRedirect(route('admin.categories.index'));

        $this->assertDatabaseHas('categories', [
            'name' => 'Nova Categoria Teste',
            'slug' => 'nova-categoria-teste',
        ]);
    }

    public function test_admin_can_upload_category_image(): void
    {
        Storage::fake('public');
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'info@lusoweld.com')->first();
        $category = Category::query()->roots()->first();
        $this->assertNotNull($category);

        $this->actingAs($admin)
            ->post(route('admin.categories.image.store', $category), [
                'image' => UploadedFile::fake()->image('decking.jpg', 800, 1000),
            ])
            ->assertRedirect();

        $category->refresh();
        $this->assertNotNull($category->image_path);
        Storage::disk('public')->assertExists($category->image_path);
    }

    public function test_admin_order_detail_includes_payment_links(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'info@lusoweld.com')->first();

        $pendingOrder = \App\Models\Order::query()
            ->where('payment_status', 'pending')
            ->whereNotNull('stripe_checkout_session_id')
            ->first();

        if (! $pendingOrder) {
            $pendingOrder = \App\Models\Order::factory()->guest()->create([
                'stripe_checkout_session_id' => 'cs_test_'.str_repeat('a', 24),
            ]);
        }

        $this->actingAs($admin)
            ->get(route('admin.orders.show', $pendingOrder))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Orders/Show')
                ->has('order.payment_url')
                ->has('order.stripe_dashboard_url')
                ->where('order.payment_url', route('checkout.payment', [
                    'order' => $pendingOrder->id,
                    'token' => $pendingOrder->guest_token,
                ], absolute: true)));
    }

    public function test_admin_can_delete_pending_order(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'info@lusoweld.com')->first();
        $order = \App\Models\Order::factory()->create();

        $this->actingAs($admin)
            ->delete(route('admin.orders.destroy', $order))
            ->assertRedirect(route('admin.orders.index'));

        $this->assertDatabaseMissing('orders', ['id' => $order->id]);
    }

    public function test_admin_delete_paid_order_restores_stock_and_promotion_usage(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'info@lusoweld.com')->first();
        $product = \App\Models\Product::query()->active()->first();
        $this->assertNotNull($product);

        $promotion = \App\Models\Promotion::query()->first();
        $this->assertNotNull($promotion);

        $product->update(['stock_quantity' => 8]);
        $promotion->update(['usage_count' => 3]);

        $order = \App\Models\Order::factory()->paid()->create([
            'promotion_id' => $promotion->id,
        ]);

        \App\Models\OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_variant_id' => null,
            'quantity' => 2,
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.orders.destroy', $order))
            ->assertRedirect(route('admin.orders.index'));

        $this->assertDatabaseMissing('orders', ['id' => $order->id]);
        $this->assertSame(10, $product->fresh()->stock_quantity);
        $this->assertSame(2, $promotion->fresh()->usage_count);
    }

    public function test_customer_cannot_delete_order(): void
    {
        $this->seed(DatabaseSeeder::class);

        $customer = User::query()->where('email', 'cliente@lusoweld.pt')->first();
        $order = \App\Models\Order::factory()->create(['user_id' => $customer->id]);

        $this->actingAs($customer)
            ->delete(route('admin.orders.destroy', $order))
            ->assertForbidden();
    }
}
