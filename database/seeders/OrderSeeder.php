<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $customer = User::query()->where('email', 'cliente@lusoweld.pt')->first();

        if (! $customer) {
            return;
        }

        $products = Product::query()->active()->limit(4)->get();

        if ($products->isEmpty()) {
            return;
        }

        $this->createOrder($customer, $products->take(2), OrderStatus::Completed, PaymentStatus::Paid, true);
        $this->createOrder($customer, $products->skip(1)->take(2), OrderStatus::Shipped, PaymentStatus::Paid, false);
        $this->createOrder($customer, $products->take(1), OrderStatus::Pending, PaymentStatus::Pending, false);
    }

    private function createOrder(
        User $customer,
        $products,
        OrderStatus $status,
        PaymentStatus $paymentStatus,
        bool $withInvoice,
    ): void {
        $subtotal = 0;
        $itemsData = [];

        foreach ($products as $product) {
            $quantity = random_int(1, 2);
            $unitPrice = $product->currentPrice();
            $lineSubtotal = round($unitPrice * $quantity, 2);
            $tax = round($lineSubtotal * 0.23 / 1.23, 2);
            $subtotal += $lineSubtotal;

            $itemsData[] = [
                'product' => $product,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'subtotal' => $lineSubtotal,
                'tax' => $tax,
                'total' => $lineSubtotal,
            ];
        }

        $shipping = 5.99;
        $taxTotal = round($subtotal * 0.23 / 1.23, 2);
        $total = round($subtotal + $shipping, 2);

        $order = Order::query()->create([
            'order_number' => 'LW-'.now()->format('Ymd').'-'.strtoupper(Str::random(6)),
            'user_id' => $customer->id,
            'status' => $status,
            'payment_status' => $paymentStatus,
            'stripe_payment_intent_id' => $paymentStatus === PaymentStatus::Paid
                ? 'pi_'.Str::random(24)
                : null,
            'stripe_checkout_session_id' => in_array($paymentStatus, [PaymentStatus::Paid, PaymentStatus::Pending], true)
                ? 'cs_test_'.Str::random(24)
                : null,
            'subtotal' => $subtotal,
            'discount_total' => 0,
            'shipping_total' => $shipping,
            'tax_total' => $taxTotal,
            'total' => $total,
            'currency' => 'EUR',
            'billing_name' => $customer->name,
            'billing_tax_id' => $customer->tax_id,
            'billing_email' => $customer->email,
            'billing_phone' => $customer->phone,
            'billing_address_line_1' => 'Av. da República, 45',
            'billing_city' => 'Lisboa',
            'billing_state' => 'Lisboa',
            'billing_postal_code' => '1050-187',
            'billing_country' => 'PT',
            'shipping_name' => $customer->name,
            'shipping_phone' => $customer->phone,
            'shipping_address_line_1' => 'Rua das Oficinas, 12',
            'shipping_city' => 'Amadora',
            'shipping_state' => 'Lisboa',
            'shipping_postal_code' => '2700-123',
            'shipping_country' => 'PT',
            'guest_token' => $paymentStatus === PaymentStatus::Pending ? Str::random(32) : null,
            'invoice_path' => $withInvoice ? 'invoices/demo-fatura.pdf' : null,
            'invoice_number' => $withInvoice ? 'FT Lusoweld/1' : null,
            'paid_at' => $paymentStatus === PaymentStatus::Paid ? now()->subDays(3) : null,
            'shipped_at' => in_array($status, [OrderStatus::Shipped, OrderStatus::Completed], true) ? now()->subDay() : null,
            'completed_at' => $status === OrderStatus::Completed ? now() : null,
            'idempotency_key' => Str::uuid()->toString(),
        ]);

        foreach ($itemsData as $item) {
            OrderItem::query()->create([
                'order_id' => $order->id,
                'product_id' => $item['product']->id,
                'product_name' => $item['product']->name,
                'product_sku' => $item['product']->sku,
                'unit_price' => $item['unit_price'],
                'quantity' => $item['quantity'],
                'subtotal' => $item['subtotal'],
                'tax_amount' => $item['tax'],
                'total' => $item['total'],
            ]);
        }
    }
}
