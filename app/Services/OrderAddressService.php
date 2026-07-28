<?php

namespace App\Services;

use App\Enums\AddressType;
use App\Models\Address;
use App\Models\Order;
use App\Models\User;

class OrderAddressService
{
    public function syncFromOrder(Order $order): void
    {
        if (! $order->user_id) {
            return;
        }

        $user = $order->user ?? User::query()->find($order->user_id);

        if (! $user) {
            return;
        }

        $this->upsertAddress($user, AddressType::Billing, [
            'name' => $order->billing_name,
            'tax_id' => $order->billing_tax_id,
            'address_line_1' => $order->billing_address_line_1,
            'address_line_2' => $order->billing_address_line_2,
            'city' => $order->billing_city,
            'state' => $order->billing_state,
            'postal_code' => $order->billing_postal_code,
            'country' => $order->billing_country,
            'phone' => $order->billing_phone,
        ]);

        $this->upsertAddress($user, AddressType::Shipping, [
            'name' => $order->shipping_name,
            'tax_id' => null,
            'address_line_1' => $order->shipping_address_line_1,
            'address_line_2' => $order->shipping_address_line_2,
            'city' => $order->shipping_city,
            'state' => $order->shipping_state,
            'postal_code' => $order->shipping_postal_code,
            'country' => $order->shipping_country,
            'phone' => $order->shipping_phone,
        ]);
    }

    /**
     * @param  array<string, string|null>  $data
     */
    private function upsertAddress(User $user, AddressType $type, array $data): void
    {
        if (! $data['address_line_1'] || ! $data['city'] || ! $data['postal_code']) {
            return;
        }

        $existing = $user->addresses()
            ->where('type', $type)
            ->where('address_line_1', $data['address_line_1'])
            ->where('postal_code', $data['postal_code'])
            ->where('city', $data['city'])
            ->where('country', $data['country'] ?? 'PT')
            ->first();

        if ($existing instanceof Address) {
            $existing->update([
                'name' => $data['name'] ?? $existing->name,
                'tax_id' => $data['tax_id'] ?? $existing->tax_id,
                'address_line_2' => $data['address_line_2'],
                'state' => $data['state'],
                'phone' => $data['phone'],
            ]);

            return;
        }

        $hasDefault = $user->addresses()
            ->where('type', $type)
            ->where('is_default', true)
            ->exists();

        $user->addresses()->create([
            'type' => $type,
            'label' => $type === AddressType::Billing ? 'Faturação' : 'Envio',
            'name' => $data['name'] ?? $user->name,
            'tax_id' => $data['tax_id'],
            'address_line_1' => $data['address_line_1'],
            'address_line_2' => $data['address_line_2'],
            'city' => $data['city'],
            'state' => $data['state'],
            'postal_code' => $data['postal_code'],
            'country' => $data['country'] ?? 'PT',
            'phone' => $data['phone'],
            'is_default' => ! $hasDefault,
        ]);
    }
}
