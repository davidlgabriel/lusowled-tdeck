<?php

namespace App\Enums;

enum AddressType: string
{
    case Billing = 'billing';
    case Shipping = 'shipping';

    public function label(): string
    {
        return match ($this) {
            self::Billing => 'Faturação',
            self::Shipping => 'Envio',
        };
    }
}
