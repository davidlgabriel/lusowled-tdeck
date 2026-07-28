<?php

namespace App\Support;

use App\Services\SettingsService;

class VatCalculator
{
    public static function defaultRate(): float
    {
        return (float) app(SettingsService::class)->get('store.default_vat_rate', 23);
    }

    public static function taxFromNet(float $net, ?float $rate = null): float
    {
        $rate ??= self::defaultRate();

        return round($net * ($rate / 100), 2);
    }

    public static function grossFromNet(float $net, ?float $rate = null): float
    {
        return round($net + self::taxFromNet($net, $rate), 2);
    }

    public static function netFromGross(float $gross, ?float $rate = null): float
    {
        $rate ??= self::defaultRate();

        return round($gross / (1 + ($rate / 100)), 2);
    }
}
