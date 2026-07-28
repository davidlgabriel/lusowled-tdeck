<?php

namespace App\Models;

use App\Enums\InvoiceMode;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'order_number',
    'user_id',
    'status',
    'payment_status',
    'stripe_payment_intent_id',
    'stripe_checkout_session_id',
    'stripe_charge_id',
    'subtotal',
    'discount_total',
    'shipping_total',
    'tax_total',
    'total',
    'currency',
    'promotion_id',
    'billing_name',
    'billing_tax_id',
    'billing_email',
    'billing_phone',
    'billing_address_line_1',
    'billing_address_line_2',
    'billing_city',
    'billing_state',
    'billing_postal_code',
    'billing_country',
    'shipping_name',
    'shipping_phone',
    'shipping_address_line_1',
    'shipping_address_line_2',
    'shipping_city',
    'shipping_state',
    'shipping_postal_code',
    'shipping_country',
    'invoice_mode',
    'invoice_path',
    'invoice_number',
    'invoice_sent_at',
    'guest_token',
    'idempotency_key',
    'paid_at',
    'shipped_at',
    'completed_at',
    'cancelled_at',
    'refunded_at',
])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'payment_status' => PaymentStatus::class,
            'subtotal' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'shipping_total' => 'decimal:2',
            'tax_total' => 'decimal:2',
            'total' => 'decimal:2',
            'invoice_mode' => InvoiceMode::class,
            'invoice_sent_at' => 'datetime',
            'paid_at' => 'datetime',
            'shipped_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'refunded_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(OrderNote::class)->latest();
    }

    public function isPaid(): bool
    {
        return $this->payment_status === PaymentStatus::Paid;
    }

    public function isCancellable(): bool
    {
        return in_array($this->status, [
            OrderStatus::Pending,
            OrderStatus::Paid,
            OrderStatus::Processing,
        ], true);
    }
}
