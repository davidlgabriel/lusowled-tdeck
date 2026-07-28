<?php

namespace App\Services;

class MailConfigService
{
    public function __construct(
        private readonly SettingsService $settings,
    ) {}

    public function configure(): void
    {
        $host = $this->settings->get('email.smtp_host');

        if ($host) {
            config([
                'mail.default' => 'smtp',
                'mail.mailers.smtp.host' => $host,
                'mail.mailers.smtp.port' => (int) $this->settings->get('email.smtp_port', 587),
                'mail.mailers.smtp.username' => $this->settings->get('email.smtp_username'),
                'mail.mailers.smtp.password' => $this->settings->get('email.smtp_password'),
                'mail.mailers.smtp.encryption' => $this->encryption(),
            ]);
        }

        $fromAddress = $this->settings->get('email.from_address');

        if ($fromAddress) {
            config([
                'mail.from.address' => $fromAddress,
                'mail.from.name' => (string) $this->settings->get(
                    'email.from_name',
                    config('app.name'),
                ),
            ]);
        }
    }

    private function encryption(): ?string
    {
        $port = (int) $this->settings->get('email.smtp_port', 587);

        return match ($port) {
            465 => 'ssl',
            587, 2525 => 'tls',
            default => null,
        };
    }
}
