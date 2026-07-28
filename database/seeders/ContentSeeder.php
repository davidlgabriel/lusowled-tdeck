<?php

namespace Database\Seeders;

use App\Enums\ContentFormat;
use App\Enums\ContentPageFooterSection;
use App\Enums\NavigationItemType;
use App\Models\ContentPage;
use App\Models\NavigationItem;
use Database\Seeders\Support\LegalPages;
use Illuminate\Database\Seeder;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedPages();
        $this->seedNavigation();
    }

    private function seedPages(): void
    {
        foreach (LegalPages::pages() as $index => $page) {
            ContentPage::query()->updateOrCreate(
                ['slug' => $page['slug']],
                [
                    'title' => $page['title'],
                    'content' => $page['content'],
                    'content_format' => ($page['content_format'] ?? 'html') === 'plain'
                        ? ContentFormat::Plain
                        : ContentFormat::Html,
                    'footer_section' => $page['footer_section'] === 'legal'
                        ? ContentPageFooterSection::Legal
                        : ContentPageFooterSection::CustomerSupport,
                    'show_in_footer' => true,
                    'sort_order' => $index,
                    'is_published' => true,
                ],
            );
        }
    }

    private function seedNavigation(): void
    {
        NavigationItem::query()->delete();

        $items = [
            ['label' => 'Produtos', 'type' => NavigationItemType::Products, 'target' => null, 'sort_order' => 0],
            ['label' => 'Decking', 'type' => NavigationItemType::Category, 'target' => 'decking-wpc', 'sort_order' => 1],
            ['label' => 'Cladding', 'type' => NavigationItemType::Category, 'target' => 'cladding-wpc', 'sort_order' => 2],
            ['label' => 'Vedações', 'type' => NavigationItemType::Category, 'target' => 'vedacoes-wpc', 'sort_order' => 3],
            ['label' => 'Sobre nós', 'type' => NavigationItemType::Page, 'target' => 'sobre-nos', 'sort_order' => 4],
            ['label' => 'Contacte-nos', 'type' => NavigationItemType::Url, 'target' => '/contacte-nos', 'sort_order' => 5],
        ];

        foreach ($items as $item) {
            NavigationItem::query()->create([
                ...$item,
                'location' => 'header',
                'is_active' => true,
            ]);
        }
    }
}
