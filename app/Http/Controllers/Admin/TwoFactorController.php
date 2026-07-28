<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\TwoFactorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorController extends Controller
{
    public function show(Request $request, TwoFactorService $twoFactor): Response
    {
        $user = $request->user();

        if ($user->hasTwoFactorEnabled()) {
            return Inertia::render('Admin/TwoFactor/Index', [
                'enabled' => true,
                'recoveryCodes' => $request->session()->get('two_factor_recovery_codes'),
            ]);
        }

        $secret = $request->session()->get('two_factor.setup_secret');

        if (! $secret) {
            $secret = $twoFactor->generateSecret();
            $request->session()->put('two_factor.setup_secret', $secret);
        }

        return Inertia::render('Admin/TwoFactor/Index', [
            'enabled' => false,
            'qrCode' => $twoFactor->qrCodeSvg($user, $secret),
            'secret' => $secret,
        ]);
    }

    public function enable(Request $request, TwoFactorService $twoFactor): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasTwoFactorEnabled()) {
            return redirect()->route('admin.two-factor.show');
        }

        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $secret = $request->session()->get('two_factor.setup_secret');

        if (! $secret || ! $twoFactor->verifySecret($secret, $request->string('code')->toString())) {
            throw ValidationException::withMessages([
                'code' => __('auth.two_factor_invalid'),
            ]);
        }

        $recoveryCodes = $twoFactor->generateRecoveryCodes();

        $user->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_confirmed_at' => now(),
            'two_factor_recovery_codes' => $recoveryCodes,
        ])->save();

        $request->session()->forget('two_factor.setup_secret');
        $request->session()->put('auth.two_factor_verified', true);
        $request->session()->flash('two_factor_recovery_codes', $recoveryCodes);

        return redirect()
            ->route('admin.two-factor.show')
            ->with('success', 'Autenticação de dois fatores ativada com sucesso.');
    }

    public function disable(Request $request, TwoFactorService $twoFactor): RedirectResponse
    {
        $user = $request->user();

        if (! $user->hasTwoFactorEnabled()) {
            return redirect()->route('admin.two-factor.show');
        }

        $request->validate([
            'password' => ['required', 'string'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        if (! Hash::check($request->string('password')->toString(), $user->password)) {
            throw ValidationException::withMessages([
                'password' => __('auth.password'),
            ]);
        }

        if (! $twoFactor->verify($user, $request->string('code')->toString())) {
            throw ValidationException::withMessages([
                'code' => __('auth.two_factor_invalid'),
            ]);
        }

        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_confirmed_at' => null,
            'two_factor_recovery_codes' => null,
        ])->save();

        $request->session()->forget('auth.two_factor_verified');

        return redirect()
            ->route('admin.two-factor.show')
            ->with('success', 'Autenticação de dois fatores desativada.');
    }
}
