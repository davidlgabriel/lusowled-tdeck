<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\TwoFactorLoginRequest;
use App\Models\User;
use App\Services\CartService;
use App\Services\TwoFactorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorChallengeController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        if (! $this->resolvePendingUser($request)) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    public function store(TwoFactorLoginRequest $request, TwoFactorService $twoFactor): RedirectResponse
    {
        $user = $this->resolvePendingUser($request);

        if (! $user) {
            return redirect()->route('login');
        }

        $request->validateCode($user, $twoFactor);

        if ($request->session()->has('login.id')) {
            Auth::login($user, $request->session()->pull('login.remember', false));
            $request->session()->forget('login.id');
            $request->session()->regenerate();
            app(CartService::class)->mergeGuestCartIntoUser($request, $user);
        }

        $request->session()->put('auth.two_factor_verified', true);

        $intended = $user->isAdmin()
            ? route('admin.dashboard', absolute: false)
            : route('account.dashboard', absolute: false);

        return redirect()->intended($intended);
    }

    protected function resolvePendingUser(Request $request): ?User
    {
        if ($request->session()->has('login.id')) {
            return User::query()->find($request->session()->get('login.id'));
        }

        $user = $request->user();

        if ($user?->requiresTwoFactorChallenge()) {
            return $user;
        }

        return null;
    }
}
