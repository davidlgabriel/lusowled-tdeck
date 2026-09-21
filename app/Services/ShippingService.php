<?php

namespace App\Services;

class ShippingService
{
    public function __construct(
        private readonly SettingsService $settings,
    ) {}

    /**
     * @return array{
     *     amount: float,
     *     mode: 'free'|'quoted_later',
     *     label: string,
     *     message: string|null,
     *     free_threshold: float,
     *     amount_until_free_shipping: float
     * }
     */
    public function calculate(float $netSubtotal): array
    {
        $threshold = $this->freeShippingThreshold();
        $amountUntilFree = max(0, round($threshold - $netSubtotal, 2));

        if ($netSubtotal >= $threshold) {
            return [
                'amount' => 0.0,
                'mode' => 'free',
                'label' => 'Grátis',
                'message' => null,
                'free_threshold' => $threshold,
                'amount_until_free_shipping' => 0.0,
            ];
        }

        return [
            'amount' => 0.0,
            'mode' => 'quoted_later',
            'label' => 'A calcular',
            'message' => $this->quoteMessage(),
            'free_threshold' => $threshold,
            'amount_until_free_shipping' => $amountUntilFree,
        ];
    }

    public function freeShippingThreshold(): float
    {
        return (float) $this->settings->get('store.shipping_free_threshold', 900);
    }

    public function quoteMessage(): string
    {
        $message = trim((string) $this->settings->get('store.shipping_quote_message', ''));

        if ($message !== '') {
            return $message;
        }

        return 'Será enviado por email o valor do transporte, calculado em função do volume da encomenda e do local de entrega.';
    }

    public function requiresQuote(float $netSubtotal): bool
    {
        return $this->calculate($netSubtotal)['mode'] === 'quoted_later';
    }
}
