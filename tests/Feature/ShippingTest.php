<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Services\CartService;
use App\Services\SettingsService;
use App\Services\ShippingService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShippingTest extends TestCase
{
    use RefreshDatabase;

    public function test_orders_below_threshold_have_quoted_shipping(): void
    {
        $this->seed(DatabaseSeeder::class);

        app(SettingsService::class)->set('store.shipping_free_threshold', '900');

        $product = Product::query()->active()->where('stock_quantity', '>', 0)->first();
        $this->assertNotNull($product);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $summary = app(CartService::class)->summary(
            app(CartService::class)->resolve(request()),
        );

        $this->assertLessThan(900, $summary['subtotal']);
        $this->assertSame('quoted_later', $summary['shipping_mode']);
        $this->assertSame(0.0, $summary['shipping']);
        $this->assertNotNull($summary['shipping_message']);
        $this->assertGreaterThan(0, $summary['amount_until_free_shipping']);
        $this->assertEqualsWithDelta(
            $summary['subtotal'] + $summary['tax_total'],
            $summary['total'],
            0.01,
        );
    }

    public function test_orders_at_or_above_threshold_have_free_shipping(): void
    {
        $this->seed(DatabaseSeeder::class);

        app(SettingsService::class)->set('store.shipping_free_threshold', '900');

        $product = Product::query()->active()->where('base_price', '>', 0)->first();
        $this->assertNotNull($product);

        $unitPrice = $product->currentPrice();
        $quantity = (int) ceil(900 / $unitPrice) + 1;

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => $quantity,
        ]);

        $summary = app(CartService::class)->summary(
            app(CartService::class)->resolve(request()),
        );

        $this->assertGreaterThanOrEqual(900, $summary['subtotal']);
        $this->assertSame('free', $summary['shipping_mode']);
        $this->assertSame('Grátis', $summary['shipping_label']);
        $this->assertSame(0.0, $summary['shipping']);
    }

    public function test_shipping_service_uses_configured_message(): void
    {
        $this->seed(DatabaseSeeder::class);

        $message = 'Transporte orçamentado por email em 24h.';
        app(SettingsService::class)->set('store.shipping_quote_message', $message);

        $result = app(ShippingService::class)->calculate(100);

        $this->assertSame('quoted_later', $result['mode']);
        $this->assertSame($message, $result['message']);
    }
}
