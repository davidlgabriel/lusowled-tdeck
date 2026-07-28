<?php

namespace App\Enums;

enum ContentPageFooterSection: string
{
    case CustomerSupport = 'customer_support';
    case Legal = 'legal';

    public function label(): string
    {
        return match ($this) {
            self::CustomerSupport => 'Apoio ao cliente',
            self::Legal => 'Informações legais',
        };
    }
}
