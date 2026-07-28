<?php

namespace App\Jobs;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\StripeWebhookEvent;
use App\Services\CheckoutService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessStripeWebhook implements ShouldQueue
{
    use Queueable;

    /**
     * @param  array<string, mixed>  $event
     */
    public function __construct(public array $event) {}

    public function handle(CheckoutService $checkout): void
    {
        $eventId = $this->event['id'] ?? null;

        if (! $eventId) {
            return;
        }

        $record = StripeWebhookEvent::query()->firstOrCreate(
            ['event_id' => $eventId],
            [
                'event_type' => $this->event['type'] ?? 'unknown',
                'payload' => $this->event,
            ]
        );

        if ($record->isProcessed()) {
            return;
        }

        $type = $this->event['type'] ?? '';
        $object = $this->event['data']['object'] ?? [];

        match ($type) {
            'checkout.session.completed' => $this->handleCheckoutSessionCompleted($checkout, $object),
            'payment_intent.succeeded' => $this->handlePaymentSucceeded($checkout, $object),
            'charge.refunded' => $this->handleRefunded($object),
            default => null,
        };

        $record->update(['processed_at' => now()]);
    }

    /**
     * @param  array<string, mixed>  $object
     */
    private function handleCheckoutSessionCompleted(CheckoutService $checkout, array $object): void
    {
        if (($object['payment_status'] ?? null) !== 'paid') {
            return;
        }

        $order = $this->resolveOrderFromMetadata($object);

        if (! $order) {
            return;
        }

        $paymentIntentId = $object['payment_intent'] ?? null;
        $sessionId = $object['id'] ?? null;

        $checkout->markAsPaid($order, null, is_string($paymentIntentId) ? $paymentIntentId : null, is_string($sessionId) ? $sessionId : null);
    }

    /**
     * @param  array<string, mixed>  $object
     */
    private function handlePaymentSucceeded(CheckoutService $checkout, array $object): void
    {
        $order = $this->resolveOrderFromMetadata($object);

        if (! $order) {
            return;
        }

        $chargeId = is_array($object['charges']['data'] ?? null)
            ? ($object['charges']['data'][0]['id'] ?? null)
            : null;

        $checkout->markAsPaid(
            $order,
            is_string($chargeId) ? $chargeId : null,
            is_string($object['id'] ?? null) ? $object['id'] : null,
        );
    }

    /**
     * @param  array<string, mixed>  $object
     */
    private function handleRefunded(array $object): void
    {
        $paymentIntentId = $object['payment_intent'] ?? null;

        if (! $paymentIntentId) {
            return;
        }

        $order = Order::query()
            ->where('stripe_payment_intent_id', $paymentIntentId)
            ->first();

        if (! $order) {
            return;
        }

        $order->update([
            'status' => OrderStatus::Refunded,
            'payment_status' => PaymentStatus::Refunded,
            'refunded_at' => now(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $object
     */
    private function resolveOrderFromMetadata(array $object): ?Order
    {
        $orderId = $object['metadata']['order_id'] ?? null;

        if (! $orderId) {
            return null;
        }

        return Order::query()->find($orderId);
    }
}
