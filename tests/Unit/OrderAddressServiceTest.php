<?php

namespace Tests\Unit;

use App\Enums\AddressType;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\User;
use App\Services\OrderAddressService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderAddressServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_sync_from_paid_order_creates_billing_and_shipping_addresses(): void
    {
        $user = User::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => OrderStatus::Paid,
            'payment_status' => PaymentStatus::Paid,
            'billing_name' => $user->name,
            'billing_email' => $user->email,
            'billing_address_line_1' => 'Rua das Flores, 10',
            'billing_city' => 'Lisboa',
            'billing_state' => 'Lisboa',
            'billing_postal_code' => '1000-001',
            'billing_country' => 'PT',
            'shipping_name' => $user->name,
            'shipping_address_line_1' => 'Av. da Liberdade, 200',
            'shipping_city' => 'Lisboa',
            'shipping_state' => 'Lisboa',
            'shipping_postal_code' => '1250-096',
            'shipping_country' => 'PT',
        ]);

        app(OrderAddressService::class)->syncFromOrder($order);

        $this->assertDatabaseHas('addresses', [
            'user_id' => $user->id,
            'type' => AddressType::Billing->value,
            'address_line_1' => 'Rua das Flores, 10',
            'is_default' => true,
        ]);

        $this->assertDatabaseHas('addresses', [
            'user_id' => $user->id,
            'type' => AddressType::Shipping->value,
            'address_line_1' => 'Av. da Liberdade, 200',
            'is_default' => true,
        ]);
    }

    public function test_sync_does_not_duplicate_existing_address(): void
    {
        $user = User::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'billing_name' => $user->name,
            'billing_address_line_1' => 'Rua A',
            'billing_city' => 'Porto',
            'billing_postal_code' => '4000-001',
            'billing_country' => 'PT',
            'shipping_name' => $user->name,
            'shipping_address_line_1' => 'Rua B',
            'shipping_city' => 'Porto',
            'shipping_postal_code' => '4000-002',
            'shipping_country' => 'PT',
        ]);

        $service = app(OrderAddressService::class);
        $service->syncFromOrder($order);
        $service->syncFromOrder($order);

        $this->assertSame(2, $user->addresses()->count());
    }
}
