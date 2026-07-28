<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Processing = 'processing';
    case Shipped = 'shipped';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Refunded = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pendente',
            self::Paid => 'Paga',
            self::Processing => 'Em processamento',
            self::Shipped => 'Enviada',
            self::Completed => 'Concluída',
            self::Cancelled => 'Cancelada',
            self::Refunded => 'Reembolsada',
        };
    }
}
