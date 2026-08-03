<?php

namespace Tests\Unit;

use App\Support\VariantPresentation;
use PHPUnit\Framework\TestCase;

class VariantPresentationTest extends TestCase
{
    public function test_formats_options_for_cart_label(): void
    {
        $label = VariantPresentation::formatOptions([
            'cor' => 'Castanho',
            'pack' => '5 m²',
        ]);

        $this->assertSame('Cor: Castanho · Pack: 5 m²', $label);
    }
}
