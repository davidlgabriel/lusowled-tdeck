<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use App\Services\TwoFactorService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class TwoFactorLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'code' => ['required_without:recovery_code', 'nullable', 'string', 'size:6'],
            'recovery_code' => ['required_without:code', 'nullable', 'string'],
        ];
    }

    public function validateCode(User $user, TwoFactorService $twoFactor): void
    {
        $this->ensureIsNotRateLimited();

        $valid = false;

        if ($this->filled('code')) {
            $valid = $twoFactor->verify($user, $this->string('code')->toString());
        } elseif ($this->filled('recovery_code')) {
            $valid = $twoFactor->verifyRecoveryCode($user, $this->string('recovery_code')->toString());
        }

        if (! $valid) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'code' => __('auth.two_factor_invalid'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    protected function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'code' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    protected function throttleKey(): string
    {
        $userId = $this->session()->get('login.id') ?? $this->user()?->id ?? 'guest';

        return 'two-factor|'.$userId.'|'.$this->ip();
    }
}
