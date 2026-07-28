<?php

namespace Tests\Unit;

use App\Models\Setting;
use App\Services\SettingsService;
use App\Services\StripeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StripeServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_payment_method_types_include_all_portugal_methods_by_default(): void
    {
        $this->seedPaymentMethodSettings();

        $service = app(StripeService::class);

        $this->assertSame(
            ['card', 'mb_way', 'multibanco'],
            $service->paymentMethodTypes(),
        );
    }

    public function test_payment_method_types_respect_admin_toggles(): void
    {
        $this->seedPaymentMethodSettings([
            'stripe.payment_card' => '1',
            'stripe.payment_mbway' => '0',
            'stripe.payment_multibanco' => '1',
        ]);

        $service = app(StripeService::class);

        $this->assertSame(
            ['card', 'multibanco'],
            $service->paymentMethodTypes(),
        );
    }

    public function test_payment_method_types_fallback_to_card_when_all_disabled(): void
    {
        $this->seedPaymentMethodSettings([
            'stripe.payment_card' => '0',
            'stripe.payment_mbway' => '0',
            'stripe.payment_multibanco' => '0',
        ]);

        $service = app(StripeService::class);

        $this->assertSame(['card'], $service->paymentMethodTypes());
    }

    /**
     * @param  array<string, string>  $overrides
     */
    private function seedPaymentMethodSettings(array $overrides = []): void
    {
        foreach (SettingsService::definition() as $definition) {
            if ($definition['group'] !== 'stripe') {
                continue;
            }

            Setting::query()->updateOrCreate(
                ['key' => $definition['key']],
                [
                    'type' => $definition['type'],
                    'group' => $definition['group'],
                    'label' => $definition['label'],
                    'description' => $definition['description'],
                    'is_public' => $definition['is_public'],
                    'value' => $overrides[$definition['key']] ?? match ($definition['key']) {
                        'stripe.payment_card',
                        'stripe.payment_mbway',
                        'stripe.payment_multibanco' => '1',
                        default => null,
                    },
                ],
            );
        }

        app(SettingsService::class)->clearCache();
    }
}
