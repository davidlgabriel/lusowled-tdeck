<?php

namespace Database\Seeders;

use App\Models\Category;
use Database\Seeders\Support\AvidCatalog;
use Database\Seeders\Support\AvidWpcAssetDownloader;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        AvidWpcAssetDownloader::downloadAll();
        AvidCatalog::purgeStaleCatalog();

        foreach (AvidCatalog::categories() as $index => $data) {
            $parent = Category::query()->updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'image_path' => $data['image'],
                    'sort_order' => $index,
                    'is_active' => true,
                ],
            );

            foreach ($data['children'] as $childIndex => $child) {
                Category::query()->updateOrCreate(
                    ['slug' => $child['slug']],
                    [
                        'parent_id' => $parent->id,
                        'name' => $child['name'],
                        'description' => "Linha {$child['name']} da categoria {$data['name']}.",
                        'sort_order' => $childIndex,
                        'is_active' => true,
                    ],
                );
            }
        }
    }
}
