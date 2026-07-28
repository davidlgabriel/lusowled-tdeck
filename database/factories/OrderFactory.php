<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 29.99, 499.99);
        $shipping = 5.99;
        $discount = 0;
        $tax = round(($subtotal - $discount) * 0.23, 2);
        $total = round($subtotal - $discount + $shipping + $tax, 2);

        return [
            'order_number' => 'LW-'.now()->format('Ymd').'-'.strtoupper(Str::random(6)),
            'user_id' => User::factory(),
            'status' => OrderStatus::Pending,
            'payment_status' => PaymentStatus::Pending,
            'stripe_payment_intent_id' => null,
            'stripe_checkout_session_id' => null,
            'stripe_charge_id' => null,
            'subtotal' => $subtotal,
            'discount_total' => $discount,
            'shipping_total' => $shipping,
            'tax_total' => $tax,
            'total' => $total,
            'currency' => 'EUR',
            'promotion_id' => null,
            'billing_name' => fake()->name(),
            'billing_tax_id' => fake()->optional()->numerify('#########'),
            'billing_email' => fake()->safeEmail(),
            'billing_phone' => fake()->numerify('9########'),
            'billing_address_line_1' => fake()->streetAddress(),
            'billing_address_line_2' => null,
            'billing_city' => fake()->city(),
            'billing_state' => 'Lisboa',
            'billing_postal_code' => fake()->numerify('####-###'),
            'billing_country' => 'PT',
            'shipping_name' => fake()->name(),
            'shipping_phone' => fake()->numerify('9########'),
            'shipping_address_line_1' => fake()->streetAddress(),
            'shipping_address_line_2' => null,
            'shipping_city' => fake()->city(),
            'shipping_state' => 'Lisboa',
            'shipping_postal_code' => fake()->numerify('####-###'),
            'shipping_country' => 'PT',
            'invoice_mode' => null,
            'invoice_path' => null,
            'invoice_number' => null,
            'invoice_sent_at' => null,
            'guest_token' => null,
            'idempotency_key' => Str::uuid()->toString(),
            'paid_at' => null,
            'shipped_at' => null,
            'completed_at' => null,
            'cancelled_at' => null,
            'refunded_at' => null,
        ];
    }

    public function paid(): static
    {
        return $this->state(fn () => [
            'status' => OrderStatus::Paid,
            'payment_status' => PaymentStatus::Paid,
            'stripe_checkout_session_id' => 'cs_test_'.Str::random(24),
            'stripe_payment_intent_id' => 'pi_'.Str::random(24),
            'paid_at' => now(),
        ]);
    }

    public function guest(): static
    {
        return $this->state(fn () => [
            'user_id' => null,
            'guest_token' => Str::random(32),
        ]);
    }
}
