<?php

namespace App\Services;

use App\Models\Order;
use Stripe\Checkout\Session;
use Stripe\Exception\SignatureVerificationException;
use Stripe\StripeClient;
use Stripe\Webhook;
use UnexpectedValueException;

class StripeService
{
    public function client(): StripeClient
    {
        $secret = $this->settings()->get('stripe.secret_key');

        if (! $secret) {
            throw new \RuntimeException('Chave secreta do Stripe não configurada.');
        }

        return new StripeClient($secret);
    }

    public function publishableKey(): ?string
    {
        return $this->settings()->get('stripe.publishable_key');
    }

    /**
     * Métodos de pagamento ativos (cartão, MB WAY, Multibanco).
     *
     * @return list<string>
     */
    public function paymentMethodTypes(): array
    {
        $methods = [];

        if ($this->isPaymentMethodEnabled('stripe.payment_card', true)) {
            $methods[] = 'card';
        }

        if ($this->isPaymentMethodEnabled('stripe.payment_mbway', true)) {
            $methods[] = 'mb_way';
        }

        if ($this->isPaymentMethodEnabled('stripe.payment_multibanco', true)) {
            $methods[] = 'multibanco';
        }

        return $methods !== [] ? $methods : ['card'];
    }

    public function createCheckoutSession(Order $order): Session
    {
        $currency = strtolower($order->currency);
        $paymentMethodTypes = $currency === 'eur'
            ? $this->paymentMethodTypes()
            : ['card'];

        $params = [
            'ui_mode' => 'elements',
            'mode' => 'payment',
            'locale' => 'pt',
            'customer_email' => $order->billing_email,
            'line_items' => [[
                'price_data' => [
                    'currency' => $currency,
                    'unit_amount' => (int) round($order->total * 100),
                    'product_data' => [
                        'name' => 'Encomenda '.$order->order_number,
                    ],
                ],
                'quantity' => 1,
            ]],
            'metadata' => [
                'order_id' => (string) $order->id,
                'order_number' => $order->order_number,
            ],
            'payment_method_types' => $paymentMethodTypes,
            'return_url' => $this->checkoutReturnUrl($order),
        ];

        return $this->client()->checkout->sessions->create($params);
    }

    public function retrieveCheckoutSession(
        string $sessionId,
        bool $expandPaymentIntent = false,
    ): Session {
        $params = $expandPaymentIntent
            ? ['expand' => ['payment_intent']]
            : [];

        return $this->client()->checkout->sessions->retrieve($sessionId, $params);
    }

    public function retrieveOrderCheckoutSession(
        Order $order,
        bool $expandPaymentIntent = false,
    ): Session {
        if (! $order->stripe_checkout_session_id) {
            throw new \RuntimeException('Esta encomenda não tem sessão Stripe associada.');
        }

        return $this->retrieveCheckoutSession(
            $order->stripe_checkout_session_id,
            $expandPaymentIntent,
        );
    }

    public function checkoutReturnUrl(Order $order): string
    {
        $params = ['order' => $order->id];

        if ($order->guest_token) {
            $params['token'] = $order->guest_token;
        }

        $base = route('checkout.success', $params, absolute: true);

        return $base.(str_contains($base, '?') ? '&' : '?').'session_id={CHECKOUT_SESSION_ID}';
    }

    public function dashboardCheckoutSessionUrl(?string $sessionId): ?string
    {
        if (! $sessionId) {
            return null;
        }

        $secret = $this->settings()->get('stripe.secret_key');
        $prefix = str_starts_with((string) $secret, 'sk_test_') ? '/test' : '';

        return "https://dashboard.stripe.com{$prefix}/checkout/sessions/{$sessionId}";
    }

    public function dashboardPaymentUrl(?string $paymentIntentId): ?string
    {
        if (! $paymentIntentId) {
            return null;
        }

        $secret = $this->settings()->get('stripe.secret_key');
        $prefix = str_starts_with((string) $secret, 'sk_test_') ? '/test' : '';

        return "https://dashboard.stripe.com{$prefix}/payments/{$paymentIntentId}";
    }

    public function isTestMode(): bool
    {
        $secret = $this->settings()->get('stripe.secret_key');

        return str_starts_with((string) $secret, 'sk_test_');
    }

    /**
     * @return array<string, mixed>
     */
    public function constructWebhookEvent(string $payload, ?string $signature): array
    {
        $secret = $this->settings()->get('stripe.webhook_secret');

        if (! $secret) {
            throw new \RuntimeException('Webhook secret do Stripe não configurado.');
        }

        try {
            $event = Webhook::constructEvent($payload, $signature ?? '', $secret);

            return json_decode(json_encode($event), true);
        } catch (UnexpectedValueException|SignatureVerificationException $e) {
            throw new \RuntimeException('Assinatura do webhook inválida.', 0, $e);
        }
    }

    private function isPaymentMethodEnabled(string $key, bool $default): bool
    {
        $value = $this->settings()->get($key, $default);

        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    private function settings(): SettingsService
    {
        return app(SettingsService::class);
    }
}
