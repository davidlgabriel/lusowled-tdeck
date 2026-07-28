<?php

namespace App\Http\Middleware;

use App\Services\CartService;
use App\Services\SettingsService;
use App\Services\StorefrontContentService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $cart = app(CartService::class)->resolve($request);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'tax_id' => $user->tax_id,
                    'role' => $user->role->value,
                    'is_admin' => $user->isAdmin(),
                    'two_factor_enabled' => $user->hasTwoFactorEnabled(),
                    'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                ] : null,
            ],
            'store' => app(SettingsService::class)->branding(),
            'cms' => fn () => app(StorefrontContentService::class)->shared(),
            'cart' => fn () => [
                'item_count' => $cart->itemCount(),
                'lines' => app(CartService::class)->storefrontLines($cart),
                'drawer' => app(CartService::class)->summary($cart),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'cart_toast' => fn () => $request->session()->get('cart_toast'),
            ],
        ];
    }
}
