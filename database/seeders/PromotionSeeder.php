<?php

namespace Database\Seeders;

use App\Enums\PromotionAppliesTo;
use App\Enums\PromotionType;
use App\Models\Category;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Database\Seeder;

class PromotionSeeder extends Seeder
{
    public function run(): void
    {
        Promotion::query()->updateOrCreate(
            ['code' => 'BEMVINDO10'],
            [
            'name' => 'Bem-vindo — 10% na primeira compra',
            'description' => 'Desconto de 10% para novos clientes em produtos WPC',
            'type' => PromotionType::Percentage,
            'value' => 10,
            'applies_to' => PromotionAppliesTo::All,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addMonths(6),
            'usage_limit' => 1000,
            'usage_count' => 0,
            'is_active' => true,
            ]
        );

        $deckingPromo = Promotion::query()->updateOrCreate(
            ['name' => 'WPC Decking — 15% de desconto'],
            [
            'code' => null,
            'description' => 'Desconto automático em toda a linha de decking',
            'type' => PromotionType::Percentage,
            'value' => 15,
            'applies_to' => PromotionAppliesTo::Category,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addMonth(),
            'usage_limit' => null,
            'usage_count' => 0,
            'is_active' => true,
            ]
        );

        $decking = Category::query()->where('slug', 'decking-wpc')->first();
        if ($decking) {
            $deckingPromo->categories()->sync([
                $decking->id,
                ...$decking->children()->pluck('id')->all(),
            ]);
        }

        $coexPromo = Promotion::query()->updateOrCreate(
            ['code' => 'COEX5'],
            [
            'name' => 'Co-Extrusion — €5/m²',
            'description' => 'Desconto fixo em decking co-extrusion',
            'type' => PromotionType::FixedAmount,
            'value' => 5,
            'applies_to' => PromotionAppliesTo::Product,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addWeeks(2),
            'usage_limit' => 50,
            'usage_count' => 0,
            'is_active' => true,
            ]
        );

        $coexProduct = Product::query()->where('sku', 'TDECK-DECK-COEX')->first();
        if ($coexProduct) {
            $coexPromo->products()->attach($coexProduct->id);
        }
    }
}
