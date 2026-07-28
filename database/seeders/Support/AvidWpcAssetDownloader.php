<?php

namespace Database\Seeders\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AvidWpcAssetDownloader
{
    /**
     * @return array<string, string> Map of storage path => source URL
     */
    public static function catalog(): array
    {
        $base = 'https://www.avidwpc.com/pic/';
        $img = 'https://img.avidwpc.com/upload/middle/';

        return [
            // Branding & homepage
            'avidwpc/branding/logo.png' => $base.'avidwpc-logo.png',
            'avidwpc/home/hero.jpg' => $base.'slide-01.jpg',
            'avidwpc/home/slide-decking.jpg' => $base.'slide-01.jpg',
            'avidwpc/home/slide-cladding.jpg' => $base.'slide-02.jpg',
            'avidwpc/home/slide-fencing.jpg' => $base.'slide-03.jpg',
            'avidwpc/home/about.jpg' => $base.'home-prod-101.jpg',
            'avidwpc/home/banner.jpg' => $base.'home-102.png',

            // Category tiles
            'avidwpc/categories/decking.jpg' => $base.'2025-home-cate-01.jpg',
            'avidwpc/categories/cladding.jpg' => $base.'2025-home-cate-02.jpg',
            'avidwpc/categories/fencing.jpg' => $base.'2025-home-cate-03.jpg',
            'avidwpc/categories/aluminum.jpg' => $base.'2025-home-cate-04.jpg',
            'avidwpc/categories/asa.jpg' => $base.'2025-home-cate-05.jpg',

            // Homepage product cards
            'avidwpc/products/decking-classic.png' => $base.'avidwpc-homeprod-15697.png',
            'avidwpc/products/decking-3d.png' => $base.'avidwpc-homeprod-15698.png',
            'avidwpc/products/decking-coextrusion.png' => $base.'avidwpc-homeprod-15699.png',
            'avidwpc/products/cladding-classic.png' => $base.'avidwpc-homeprod-15701.png',
            'avidwpc/products/cladding-3d.png' => $base.'avidwpc-homeprod-15702.png',
            'avidwpc/products/cladding-coextrusion.png' => $base.'avidwpc-homeprod-15703.png',
            'avidwpc/products/fencing-classic.png' => $base.'avidwpc-homeprod-15705.png',
            'avidwpc/products/fencing-3d.png' => $base.'avidwpc-homeprod-15706.png',
            'avidwpc/products/coextrusion-aluminum.png' => $base.'avidwpc-homeprod-15709.png',
            'avidwpc/products/coextrusion-asa.png' => $base.'avidwpc-homeprod-15710.png',

            // Extra catalog shots
            'avidwpc/products/decking-outdoor.jpg' => $img.'2410_lowmaintenancewpcdeckingforoutdooruse_1758937702.jpg',
            'avidwpc/products/decking-pool.png' => $img.'2410_naturallookingwaterproofantiuvcoextrusiondeckingforswimmingpool_1759107625.png',
            'avidwpc/products/decking-modern.png' => $img.'2410_modernstylishuvproofwaterproofdeckingforexterioruse_1759218278.png',
            'avidwpc/products/cladding-panel.png' => $img.'2410_uvresistanthighqualitycheapcoextrusionwpcwallpanel_1759884231.png',
            'avidwpc/products/cladding-durable.png' => $img.'2410_uvresistantlongservicelifedurablecoextrusionwpccladding_1759807721.png',
            'avidwpc/products/fencing-garden.png' => $img.'2410_mostpopularwpccheapinstallation161520mmfencingforgarden_1759219208.png',
            'avidwpc/products/fencing-modern.png' => $img.'2410_moderndesignecoextrusionwoodgrainhighqualitylowmaintenanceantislipwaterprooffence_1759219563.png',
            'avidwpc/products/aluminum-tube.png' => $img.'2410_wpcwoodplasticcompositesquaretubealuminumalloyplasticwoodforoutdoordecorativewaterproof_1759807258.png',
            'avidwpc/products/aluminum-panel.jpg' => $img.'2410_aluminumcompositescoextrusionwpcwallcladdingpanelforoutdoor_1759150200.jpg',
        ];
    }

    /**
     * @return array<string, string> Successfully stored paths
     */
    public static function downloadAll(): array
    {
        $disk = Storage::disk('public');
        $downloaded = [];

        foreach (self::catalog() as $path => $url) {
            $stored = self::downloadOne($path, $url);
            if ($stored) {
                $downloaded[$path] = $stored;
            }
        }

        return $downloaded;
    }

    public static function downloadOne(string $path, string $url): ?string
    {
        $disk = Storage::disk('public');

        if ($disk->exists($path) && $disk->size($path) > 0) {
            return $path;
        }

        $disk->makeDirectory(Str::beforeLast($path, '/'));

        try {
            $response = Http::timeout(30)
                ->withHeaders(['User-Agent' => 'LusoweldSeeder/1.0'])
                ->get($url);

            if (! $response->successful()) {
                return null;
            }

            $disk->put($path, $response->body());

            return $path;
        } catch (\Throwable) {
            return null;
        }
    }
}
