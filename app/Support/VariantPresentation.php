<?php

namespace App\Support;

use App\Models\ProductVariant;

class VariantPresentation
{
    /**
     * @return array<string, string>
     */
    public static function optionLabelMap(): array
    {
        return [
            'cor' => 'Cor',
            'pack' => 'Pack',
        ];
    }

    /**
     * @param  array<string, mixed>|null  $options
     */
    public static function formatOptions(?array $options): string
    {
        if ($options === null || $options === []) {
            return '';
        }

        $labels = self::optionLabelMap();
        $parts = [];

        foreach ($options as $key => $value) {
            if (! is_string($value) && ! is_numeric($value)) {
                continue;
            }
            $text = trim((string) $value);
            if ($text === '') {
                continue;
            }
            $label = $labels[$key] ?? ucfirst((string) $key);
            $parts[] = "{$label}: {$text}";
        }

        return implode(' · ', $parts);
    }

    public static function cartLabel(?ProductVariant $variant): ?string
    {
        if ($variant === null) {
            return null;
        }

        $fromOptions = self::formatOptions($variant->options);
        if ($fromOptions !== '') {
            return $fromOptions;
        }

        return $variant->name;
    }
}
