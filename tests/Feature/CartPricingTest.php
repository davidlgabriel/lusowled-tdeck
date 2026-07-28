<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Services\CartService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartPricingTest extends TestCase
{
    use RefreshDatabase;

    public function test_cart_total_adds_vat_on_top_of_net_prices(): void
    {
        $this->seed(DatabaseSeeder::class);

        $product = Product::query()->active()->where('stock_quantity', '>', 0)->first();
        $this->assertNotNull($product);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response = $this->get(route('cart.index'));
        $response->assertOk();

        $cart = $response->original->getData()['page']['props']['cart'];

        $this->assertEqualsWithDelta(
            $cart['subtotal'] + $cart['tax_total'] + $cart['shipping'],
            $cart['total'],
            0.01,
            'O total deve ser subtotal (sem IVA) + IVA + envio.',
        );

        $this->assertGreaterThan(0, $cart['tax_total']);
        $this->assertLessThan($cart['subtotal'], $cart['tax_total']);
    }

    public function test_cart_service_calculates_vat_from_net_subtotal(): void
    {
        $this->seed(DatabaseSeeder::class);

        $product = Product::query()->active()->first();
        $this->assertNotNull($product);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $cart = app(CartService::class)->resolve(request());
        $summary = app(CartService::class)->summary($cart);

        $expectedTax = round($summary['subtotal'] * ($summary['vat_rate'] / 100), 2);

        $this->assertEqualsWithDelta($expectedTax, $summary['tax_total'], 0.01);
        $this->assertEqualsWithDelta(
            $summary['subtotal'] + $summary['tax_total'] + $summary['shipping'],
            $summary['total'],
            0.01,
        );
    }
}
