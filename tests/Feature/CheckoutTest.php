<?php

namespace Tests\Feature;

use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\StripeService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Stripe\Checkout\Session;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_empty_cart_redirects_from_checkout(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->get(route('checkout.index'))
            ->assertRedirect(route('cart.index'));
    }

    public function test_checkout_page_renders_with_items_in_cart(): void
    {
        $this->seed(DatabaseSeeder::class);

        $product = Product::query()->active()->where('stock_quantity', '>', 0)->first();
        $this->assertNotNull($product);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->get(route('checkout.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Store/Checkout/Index')
                ->has('cart')
                ->has('defaults'));
    }

    public function test_checkout_reuses_pending_order_without_stripe_session(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'admin@lusoweld.pt')->firstOrFail();
        $product = Product::query()->active()->where('stock_quantity', '>', 0)->firstOrFail();
        $idempotencyKey = (string) Str::uuid();

        $existingOrder = Order::factory()->create([
            'user_id' => $admin->id,
            'idempotency_key' => $idempotencyKey,
            'payment_status' => PaymentStatus::Pending,
            'stripe_checkout_session_id' => null,
            'billing_email' => $admin->email,
        ]);

        $this->mock(StripeService::class, function ($mock): void {
            $mock->shouldReceive('publishableKey')->andReturn('pk_test');
            $mock->shouldReceive('paymentMethodTypes')->andReturn(['card']);
            $mock->shouldReceive('createCheckoutSession')
                ->once()
                ->andReturn(Session::constructFrom([
                    'id' => 'cs_test_mock',
                    'client_secret' => 'cs_test_mock_secret',
                    'status' => 'open',
                ]));
        });

        $this->actingAs($admin)
            ->withSession(['checkout_idempotency_key' => $idempotencyKey])
            ->post(route('cart.store'), [
                'product_id' => $product->id,
                'quantity' => 1,
            ])
            ->assertRedirect();

        $this->actingAs($admin)
            ->withSession(['checkout_idempotency_key' => $idempotencyKey])
            ->post(route('checkout.store'), $this->checkoutPayload($admin))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Store/Checkout/Payment')
                ->where('clientSecret', 'cs_test_mock_secret'));

        $this->assertSame(1, Order::query()->where('idempotency_key', $idempotencyKey)->count());

        $existingOrder->refresh();
        $this->assertSame('cs_test_mock', $existingOrder->stripe_checkout_session_id);
    }

    /**
     * @return array<string, string>
     */
    private function checkoutPayload(User $user): array
    {
        return [
            'billing_name' => $user->name,
            'billing_tax_id' => $user->tax_id ?? '',
            'billing_email' => $user->email,
            'billing_phone' => $user->phone ?? '',
            'billing_address_line_1' => 'Rua dos cavaleiros n 46',
            'billing_address_line_2' => '46',
            'billing_city' => 'Elvas',
            'billing_state' => 'Portalegre',
            'billing_postal_code' => '7350-175',
            'billing_country' => 'PT',
            'shipping_name' => $user->name,
            'shipping_phone' => $user->phone ?? '',
            'shipping_address_line_1' => 'Rua dos cavaleiros n 46',
            'shipping_address_line_2' => '46',
            'shipping_city' => 'Elvas',
            'shipping_state' => 'Portalegre',
            'shipping_postal_code' => '7350-175',
            'shipping_country' => 'PT',
        ];
    }
}
