<?php

namespace App\Services;

use Illuminate\Validation\ValidationException;

class StoreSalesService
{
    public function __construct(
        private readonly SettingsService $settings,
    ) {}

    public function enabled(): bool
    {
        return filter_var(
            $this->settings->get('store.sales_enabled', true),
            FILTER_VALIDATE_BOOLEAN,
        );
    }

    public function disabledMessage(): string
    {
        $message = trim((string) $this->settings->get(
            'store.sales_disabled_message',
            'As vendas online estão temporariamente indisponíveis. Pode consultar o nosso catálogo.',
        ));

        return $message !== ''
            ? $message
            : 'As vendas online estão temporariamente indisponíveis. Pode consultar o nosso catálogo.';
    }

    public function ensureEnabled(): void
    {
        if ($this->enabled()) {
            return;
        }

        throw ValidationException::withMessages([
            'sales' => $this->disabledMessage(),
        ]);
    }
}
