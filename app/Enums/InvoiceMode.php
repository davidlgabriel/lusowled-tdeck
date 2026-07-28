<?php

namespace App\Enums;

enum InvoiceMode: string
{
    case Manual = 'manual';
    case Automatic = 'automatic';

    public function label(): string
    {
        return match ($this) {
            self::Manual => 'Manual',
            self::Automatic => 'Automático',
        };
    }
}
