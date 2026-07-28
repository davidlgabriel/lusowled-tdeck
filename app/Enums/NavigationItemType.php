<?php

namespace App\Enums;

enum NavigationItemType: string
{
    case Page = 'page';
    case Category = 'category';
    case Products = 'products';
    case Home = 'home';
    case Url = 'url';

    public function label(): string
    {
        return match ($this) {
            self::Page => 'Página CMS',
            self::Category => 'Categoria',
            self::Products => 'Lista de produtos',
            self::Home => 'Início',
            self::Url => 'URL personalizado',
        };
    }
}
