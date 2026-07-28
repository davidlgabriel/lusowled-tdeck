<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderPresentationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function __construct(
        private readonly OrderPresentationService $orders,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $recentOrders = $user->orders()
            ->with(['items.product.images'])
            ->latest()
            ->limit(3)
            ->get()
            ->map(fn (Order $order) => $this->orders->summary($order));

        return Inertia::render('Account/Dashboard', [
            'stats' => [
                'orders_count' => $user->orders()->count(),
                'addresses_count' => $user->addresses()->count(),
            ],
            'recentOrders' => $recentOrders,
        ]);
    }
}
