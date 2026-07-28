<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class RecaptchaService
{
    public function isEnabled(): bool
    {
        return (bool) $this->settings()->get('security.recaptcha_site_key')
            && (bool) $this->settings()->get('security.recaptcha_secret_key');
    }

    public function siteKey(): ?string
    {
        $key = $this->settings()->get('security.recaptcha_site_key');

        return $key ? (string) $key : null;
    }

    public function verify(?string $token, ?string $remoteIp = null): void
    {
        if (! $this->isEnabled()) {
            return;
        }

        if (! $token) {
            throw ValidationException::withMessages([
                'recaptcha' => 'Confirme que não é um robô.',
            ]);
        }

        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $this->settings()->get('security.recaptcha_secret_key'),
            'response' => $token,
            'remoteip' => $remoteIp,
        ]);

        if (! $response->ok()) {
            throw ValidationException::withMessages([
                'recaptcha' => 'Não foi possível validar o reCAPTCHA. Tente novamente.',
            ]);
        }

        $body = $response->json();

        if (! ($body['success'] ?? false)) {
            throw ValidationException::withMessages([
                'recaptcha' => 'Validação reCAPTCHA falhou. Tente novamente.',
            ]);
        }
    }

    private function settings(): SettingsService
    {
        return app(SettingsService::class);
    }
}
