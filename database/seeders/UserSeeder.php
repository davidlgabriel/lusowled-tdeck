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
    public function run(): void
    {
        $admin = User::query()->create([
            'name' => 'Admin Lusoweld',
            'email' => 'admin@lusoweld.pt',
            'role' => UserRole::Admin,
            'phone' => '912345678',
            'tax_id' => '500000001',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
        ]);

        $customer = User::query()->create([
            'name' => 'João Silva',
            'email' => 'cliente@lusoweld.pt',
            'role' => UserRole::Customer,
            'phone' => '923456789',
            'tax_id' => '123456789',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
        ]);

        Address::query()->create([
            'user_id' => $customer->id,
            'type' => AddressType::Billing,
            'label' => 'Faturação',
            'name' => $customer->name,
            'tax_id' => $customer->tax_id,
            'address_line_1' => 'Av. da República, 45',
            'city' => 'Lisboa',
            'state' => 'Lisboa',
            'postal_code' => '1050-187',
            'country' => 'PT',
            'phone' => $customer->phone,
            'is_default' => true,
        ]);

        Address::query()->create([
            'user_id' => $customer->id,
            'type' => AddressType::Shipping,
            'label' => 'Entrega',
            'name' => $customer->name,
            'address_line_1' => 'Rua das Oficinas, 12',
            'city' => 'Amadora',
            'state' => 'Lisboa',
            'postal_code' => '2700-123',
            'country' => 'PT',
            'phone' => $customer->phone,
            'is_default' => true,
        ]);

        User::factory()
            ->count(8)
            ->customer()
            ->create()
            ->each(function (User $user) {
                Address::factory()->billing()->default()->create(['user_id' => $user->id]);
                Address::factory()->shipping()->default()->create(['user_id' => $user->id]);
            });

        unset($admin);
    }
}
