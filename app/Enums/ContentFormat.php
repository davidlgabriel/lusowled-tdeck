<?php

namespace App\Enums;

enum ContentFormat: string
{
    case Plain = 'plain';
    case Html = 'html';

    public function label(): string
    {
        return match ($this) {
            self::Plain => 'Texto simples',
            self::Html => 'Editor visual',
        };
    }
}
