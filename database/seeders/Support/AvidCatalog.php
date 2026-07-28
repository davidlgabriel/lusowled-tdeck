<?php

namespace Database\Seeders\Support;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Str;

class AvidCatalog
{
    /**
     * @return list<array<string, mixed>>
     */
    public static function categories(): array
    {
        return [
            [
                'name' => 'Decking WPC',
                'slug' => 'decking-wpc',
                'description' => 'Aparência de madeira natural, durável e com excelente isolamento térmico.',
                'image' => 'avidwpc/categories/decking.jpg',
                'children' => [
                    ['name' => 'Decking Clássico', 'slug' => 'decking-classico'],
                    ['name' => 'Decking 3D', 'slug' => 'decking-3d'],
                    ['name' => 'Decking Co-Extrusão', 'slug' => 'decking-co-extrusao'],
                ],
            ],
            [
                'name' => 'Cladding WPC',
                'slug' => 'cladding-wpc',
                'description' => 'Revestimento exterior em composite para fachadas e paredes.',
                'image' => 'avidwpc/categories/cladding.jpg',
                'children' => [
                    ['name' => 'Cladding Clássico', 'slug' => 'cladding-classico'],
                    ['name' => 'Cladding 3D', 'slug' => 'cladding-3d'],
                    ['name' => 'Cladding Co-Extrusão', 'slug' => 'cladding-co-extrusao'],
                ],
            ],
            [
                'name' => 'Vedações WPC',
                'slug' => 'vedacoes-wpc',
                'description' => 'Vedações em composite para jardim, pátio e espaços exteriores.',
                'image' => 'avidwpc/categories/fencing.jpg',
                'children' => [
                    ['name' => 'Vedação Clássica', 'slug' => 'vedacao-classica'],
                    ['name' => 'Vedação 3D', 'slug' => 'vedacao-3d'],
                    ['name' => 'Vedação Co-Extrusão', 'slug' => 'vedacao-co-extrusao'],
                ],
            ],
            [
                'name' => 'Co-Extrusão Alumínio',
                'slug' => 'co-extrusao-aluminio',
                'description' => 'Perfis e painéis em alumínio co-extrudido para exteriores.',
                'image' => 'avidwpc/categories/aluminum.jpg',
                'children' => [],
            ],
            [
                'name' => 'Co-Extrusão ASA',
                'slug' => 'co-extrusao-asa',
                'description' => 'Painéis ASA co-extrudidos com alta resistência UV.',
                'image' => 'avidwpc/categories/asa.jpg',
                'children' => [],
            ],
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function products(): array
    {
        return [
            [
                'name' => 'Decking WPC Clássico',
                'sku' => 'TDECK-DECK-CLASSIC',
                'category_slug' => 'decking-classico',
                'base_price' => 26.75,
                'sale_price' => 23.17,
                'featured' => true,
                'stock' => 120,
                'image' => 'avidwpc/products/decking-classic.png',
                'description' => 'Decking composite clássico com acabamento madeira. Ideal para terraços, pátios e jardins.',
            ],
            [
                'name' => 'Decking WPC 3D',
                'sku' => 'TDECK-DECK-3D',
                'category_slug' => 'decking-3d',
                'base_price' => 30.00,
                'sale_price' => null,
                'featured' => true,
                'stock' => 95,
                'image' => 'avidwpc/products/decking-3d.png',
                'description' => 'Textura 3D embossing para maior realismo visual e aderência antiderrapante.',
            ],
            [
                'name' => 'Decking WPC Co-Extrusão',
                'sku' => 'TDECK-DECK-COEX',
                'category_slug' => 'decking-co-extrusao',
                'base_price' => 34.55,
                'sale_price' => 31.63,
                'featured' => true,
                'stock' => 80,
                'image' => 'avidwpc/products/decking-coextrusion.png',
                'description' => 'Segunda geração co-extrudida com camada protetora UV e manutenção mínima.',
            ],
            [
                'name' => 'Cladding WPC Clássico',
                'sku' => 'TDECK-CLAD-CLASSIC',
                'category_slug' => 'cladding-classico',
                'base_price' => 22.36,
                'sale_price' => null,
                'featured' => true,
                'stock' => 110,
                'image' => 'avidwpc/products/cladding-classic.png',
                'description' => 'Painéis de revestimento exterior com acabamento madeira natural.',
            ],
            [
                'name' => 'Cladding WPC 3D',
                'sku' => 'TDECK-CLAD-3D',
                'category_slug' => 'cladding-3d',
                'base_price' => 25.93,
                'sale_price' => 23.50,
                'featured' => false,
                'stock' => 85,
                'image' => 'avidwpc/products/cladding-3d.png',
                'description' => 'Revestimento 3D embossing para fachadas com elevado impacto visual.',
            ],
            [
                'name' => 'Cladding WPC Co-Extrusão',
                'sku' => 'TDECK-CLAD-COEX',
                'category_slug' => 'cladding-co-extrusao',
                'base_price' => 30.89,
                'sale_price' => null,
                'featured' => true,
                'stock' => 70,
                'image' => 'avidwpc/products/cladding-coextrusion.png',
                'description' => 'Cladding co-extrudido com longa vida útil e resistência às intempéries.',
            ],
            [
                'name' => 'Vedação WPC Clássica',
                'sku' => 'TDECK-FENCE-CLASSIC',
                'category_slug' => 'vedacao-classica',
                'base_price' => 20.24,
                'sale_price' => 17.80,
                'featured' => true,
                'stock' => 150,
                'image' => 'avidwpc/products/fencing-classic.png',
                'description' => 'Vedação em composite para jardins e espaços residenciais.',
            ],
            [
                'name' => 'Vedação WPC 3D',
                'sku' => 'TDECK-FENCE-3D',
                'category_slug' => 'vedacao-3d',
                'base_price' => 23.17,
                'sale_price' => null,
                'featured' => false,
                'stock' => 100,
                'image' => 'avidwpc/products/fencing-3d.png',
                'description' => 'Vedação com textura 3D e acabamento madeira de alta qualidade.',
            ],
            [
                'name' => 'Painel Co-Extrusão Alumínio',
                'sku' => 'TDECK-ALU-COEX',
                'category_slug' => 'co-extrusao-aluminio',
                'base_price' => 39.02,
                'sale_price' => null,
                'featured' => true,
                'stock' => 55,
                'image' => 'avidwpc/products/coextrusion-aluminum.png',
                'description' => 'Painel em alumínio co-extrudido para aplicações exteriores exigentes.',
            ],
            [
                'name' => 'Painel Co-Extrusão ASA',
                'sku' => 'TDECK-ASA-COEX',
                'category_slug' => 'co-extrusao-asa',
                'base_price' => 36.50,
                'sale_price' => 32.44,
                'featured' => true,
                'stock' => 75,
                'image' => 'avidwpc/products/coextrusion-asa.png',
                'description' => 'Painel ASA co-extrudido com máxima resistência a riscos e raios UV.',
            ],
        ];
    }

    /**
     * @return list<string>
     */
    public static function allowedCategorySlugs(): array
    {
        $slugs = [];

        foreach (self::categories() as $category) {
            $slugs[] = $category['slug'];
            foreach ($category['children'] as $child) {
                $slugs[] = $child['slug'];
            }
        }

        return $slugs;
    }

    /**
     * @return list<string>
     */
    public static function allowedProductSkus(): array
    {
        return collect(self::products())->pluck('sku')->all();
    }

    public static function purgeStaleCatalog(): void
    {
        $allowedSkus = self::allowedProductSkus();
        $allowedSlugs = self::allowedCategorySlugs();

        Product::query()
            ->whereNotIn('sku', $allowedSkus)
            ->each(function (Product $product) {
                $product->categories()->detach();
                $product->images()->delete();
                $product->variants()->delete();
                $product->delete();
            });

        Category::query()
            ->whereNotNull('parent_id')
            ->whereNotIn('slug', $allowedSlugs)
            ->each(function (Category $category) {
                $category->products()->detach();
                $category->promotions()->detach();
                $category->delete();
            });

        Category::query()
            ->whereNull('parent_id')
            ->whereNotIn('slug', $allowedSlugs)
            ->each(function (Category $category) {
                $category->products()->detach();
                $category->promotions()->detach();
                $category->delete();
            });
    }
}
