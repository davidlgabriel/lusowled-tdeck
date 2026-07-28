<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today = Carbon::today();
        $monthStart = Carbon::now()->startOfMonth();

        $ordersToday = Order::query()
            ->where('payment_status', PaymentStatus::Paid)
            ->whereDate('paid_at', $today)
            ->count();

        $revenueToday = (float) Order::query()
            ->where('payment_status', PaymentStatus::Paid)
            ->whereDate('paid_at', $today)
            ->sum('total');

        $revenueMonth = (float) Order::query()
            ->where('payment_status', PaymentStatus::Paid)
            ->where('paid_at', '>=', $monthStart)
            ->sum('total');

        $recentOrders = Order::query()
            ->with('user')
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (Order $order) => $this->formatOrder($order));

        $lowStock = Product::query()
            ->active()
            ->lowStock()
            ->orderBy('stock_quantity')
            ->limit(8)
            ->get(['id', 'name', 'sku', 'stock_quantity', 'low_stock_threshold']);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'orders_today' => $ordersToday,
                'revenue_today' => $revenueToday,
                'revenue_month' => $revenueMonth,
                'customers_count' => User::query()->where('role', 'customer')->count(),
                'products_active' => Product::query()->active()->count(),
                'low_stock_count' => Product::query()->active()->lowStock()->count(),
            ],
            'recentOrders' => $recentOrders,
            'lowStock' => $lowStock,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatOrder(Order $order): array
    {
        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'customer' => $order->user?->name ?? $order->billing_name,
            'status' => $order->status->value,
            'status_label' => $order->status->label(),
            'payment_status' => $order->payment_status->value,
            'payment_status_label' => $order->payment_status->label(),
            'total' => (float) $order->total,
            'currency' => $order->currency,
            'created_at' => $order->created_at?->toIso8601String(),
        ];
    }
}
