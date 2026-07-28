<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\Setting;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_populates_core_catalog(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseHas('users', [
            'email' => 'info@lusoweld.com',
            'role' => UserRole::Admin->value,
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'cliente@lusoweld.pt',
            'role' => UserRole::Customer->value,
        ]);

        $this->assertGreaterThanOrEqual(4, Category::query()->count());
        $this->assertGreaterThanOrEqual(10, Product::query()->count());
        $this->assertGreaterThanOrEqual(3, Promotion::query()->count());
        $this->assertGreaterThanOrEqual(20, Setting::query()->count());
    }

    public function test_admin_user_has_admin_role(): void
    {
        $admin = User::factory()->admin()->create();

        $this->assertTrue($admin->isAdmin());
        $this->assertSame(UserRole::Admin, $admin->role);
    }

    public function test_product_current_price_uses_sale_price_when_lower(): void
    {
        $product = Product::factory()->create([
            'base_price' => 100.00,
            'sale_price' => 79.99,
        ]);

        $this->assertTrue($product->isOnSale());
        $this->assertSame(79.99, $product->currentPrice());
    }
}
