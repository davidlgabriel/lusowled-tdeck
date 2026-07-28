<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTwoFactorVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user?->requiresTwoFactorChallenge()) {
            return $next($request);
        }

        if ($request->session()->get('auth.two_factor_verified') === true) {
            return $next($request);
        }

        return redirect()->route('two-factor.login');
    }
}
