<?php

namespace Database\Seeders\Support;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class TdeckBranding
{
    public static function installLogo(): string
    {
        $path = 'tdeck/branding/logo.png';
        $disk = Storage::disk('public');
        $source = database_path('seeders/assets/tdeck-logo.png');

        $disk->makeDirectory('tdeck/branding');

        if (File::exists($source)) {
            $disk->put($path, File::get($source));
        }

        return $path;
    }

    public static function storeName(): string
    {
        return 'T-DECK';
    }

    public static function companyName(): string
    {
        return 'True Solutions';
    }
}
