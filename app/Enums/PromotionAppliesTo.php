<?php

namespace App\Enums;

enum PromotionAppliesTo: string
{
    case All = 'all';
    case Product = 'product';
    case Category = 'category';

    public function label(): string
    {
        return match ($this) {
            self::All => 'Toda a loja',
            self::Product => 'Produtos específicos',
            self::Category => 'Categorias específicas',
        };
    }
}
