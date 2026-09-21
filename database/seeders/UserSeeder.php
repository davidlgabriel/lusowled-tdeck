<?php

namespace Database\Seeders;

use App\Enums\AddressType;
use App\Enums\UserRole;
use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    private const DEMO_CUSTOMER_TARGET = 9;

    public function run(): void
    {
        User::query()->firstOrCreate(
            ['email' => 'info@lusoweld.com'],
            [
                'name' => 'Admin Lusoweld',
                'role' => UserRole::Admin,
                'phone' => '912345678',
                'tax_id' => '500000001',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ],
        );

        $customer = User::query()->firstOrCreate(
            ['email' => 'cliente@lusoweld.pt'],
            [
                'name' => 'João Silva',
                'role' => UserRole::Customer,
                'phone' => '923456789',
                'tax_id' => '123456789',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ],
        );

        Address::query()->firstOrCreate(
            [
                'user_id' => $customer->id,
                'type' => AddressType::Billing,
                'label' => 'Faturação',
            ],
            [
                'name' => $customer->name,
                'tax_id' => $customer->tax_id,
                'address_line_1' => 'Av. da República, 45',
                'city' => 'Lisboa',
                'state' => 'Lisboa',
                'postal_code' => '1050-187',
                'country' => 'PT',
                'phone' => $customer->phone,
                'is_default' => true,
            ],
        );

        Address::query()->firstOrCreate(
            [
                'user_id' => $customer->id,
                'type' => AddressType::Shipping,
                'label' => 'Entrega',
            ],
            [
                'name' => $customer->name,
                'address_line_1' => 'Rua das Oficinas, 12',
                'city' => 'Amadora',
                'state' => 'Lisboa',
                'postal_code' => '2700-123',
                'country' => 'PT',
                'phone' => $customer->phone,
                'is_default' => true,
            ],
        );

        $customerCount = User::query()->where('role', UserRole::Customer)->count();
        $missingCustomers = max(0, self::DEMO_CUSTOMER_TARGET - $customerCount);

        if ($missingCustomers > 0) {
            User::factory()
                ->count($missingCustomers)
                ->customer()
                ->create()
                ->each(function (User $user) {
                    Address::factory()->billing()->default()->create(['user_id' => $user->id]);
                    Address::factory()->shipping()->default()->create(['user_id' => $user->id]);
                });
        }
    }
}
