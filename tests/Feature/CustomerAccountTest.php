<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Order;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_account_area(): void
    {
        $this->get(route('account.dashboard'))->assertRedirect(route('login'));
    }

    public function test_customer_can_view_account_dashboard(): void
    {
        $user = User::factory()->customer()->create();

        $this->actingAs($user)
            ->get(route('account.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Dashboard')
                ->has('stats')
                ->has('recentOrders'));
    }

    public function test_customer_can_update_profile(): void
    {
        $user = User::factory()->customer()->create([
            'name' => 'Antigo Nome',
            'phone' => null,
        ]);

        $this->actingAs($user)
            ->patch(route('account.profile.update'), [
                'name' => 'Novo Nome',
                'email' => $user->email,
                'phone' => '912000000',
                'tax_id' => '123456789',
            ])
            ->assertRedirect(route('account.profile'));

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Novo Nome',
            'phone' => '912000000',
            'tax_id' => '123456789',
        ]);
    }

    public function test_customer_can_manage_addresses(): void
    {
        $user = User::factory()->customer()->create();

        $this->actingAs($user)
            ->post(route('account.addresses.store'), [
                'type' => 'billing',
                'name' => $user->name,
                'address_line_1' => 'Rua Teste, 1',
                'city' => 'Lisboa',
                'postal_code' => '1000-001',
                'country' => 'PT',
                'is_default' => true,
            ])
            ->assertRedirect(route('account.addresses.index'));

        $address = Address::query()->where('user_id', $user->id)->first();
        $this->assertNotNull($address);

        $other = User::factory()->customer()->create();

        $this->actingAs($other)
            ->patch(route('account.addresses.update', $address), [
                'type' => 'billing',
                'name' => 'Hacker',
                'address_line_1' => 'Rua Teste, 1',
                'city' => 'Lisboa',
                'postal_code' => '1000-001',
                'country' => 'PT',
            ])
            ->assertForbidden();
    }

    public function test_customer_can_only_view_own_orders(): void
    {
        $this->seed(DatabaseSeeder::class);

        $customer = User::query()->where('email', 'cliente@lusoweld.pt')->first();
        $other = User::factory()->customer()->create();

        $order = Order::query()->where('user_id', $customer->id)->first();
        $this->assertNotNull($order);

        $this->actingAs($customer)
            ->get(route('account.orders.show', $order))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Orders/Show')
                ->where('order.order_number', $order->order_number));

        $this->actingAs($other)
            ->get(route('account.orders.show', $order))
            ->assertForbidden();
    }

    public function test_customer_sees_payment_link_for_pending_order(): void
    {
        $this->seed(DatabaseSeeder::class);

        $customer = User::query()->where('email', 'cliente@lusoweld.pt')->first();
        $order = Order::factory()->create([
            'user_id' => $customer->id,
            'payment_status' => 'pending',
            'stripe_checkout_session_id' => null,
        ]);

        $this->actingAs($customer)
            ->get(route('account.orders.show', $order))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Orders/Show')
                ->where('order.payment_url', route('checkout.payment', [
                    'order' => $order->id,
                ], absolute: true)));
    }

    public function test_login_redirects_to_account_area(): void
    {
        $user = User::factory()->customer()->create();

        $this->post(route('login'), [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('account.dashboard'));
    }
}
