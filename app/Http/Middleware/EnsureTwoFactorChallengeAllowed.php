<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTwoFactorChallengeAllowed
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->session()->has('login.id')) {
            return $next($request);
        }

        $user = $request->user();

        if (
            $user?->requiresTwoFactorChallenge()
            && $request->session()->get('auth.two_factor_verified') !== true
        ) {
            return $next($request);
        }

        if ($user) {
            return redirect()->intended(
                $user->isAdmin()
                    ? route('admin.dashboard', absolute: false)
                    : route('account.dashboard', absolute: false),
            );
        }

        return redirect()->route('login');
    }
}
