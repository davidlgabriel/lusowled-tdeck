<?php

namespace App\Enums;

enum SettingType: string
{
    case String = 'string';
    case Text = 'text';
    case Integer = 'integer';
    case Boolean = 'boolean';
    case Json = 'json';
    case Encrypted = 'encrypted';

    public function label(): string
    {
        return match ($this) {
            self::String => 'Texto curto',
            self::Text => 'Texto longo',
            self::Integer => 'Número inteiro',
            self::Boolean => 'Sim/Não',
            self::Json => 'JSON',
            self::Encrypted => 'Cifrado',
        };
    }
}
