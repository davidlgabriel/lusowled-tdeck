<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SettingType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SettingsRequest;
use App\Models\Setting;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    private const GROUPS = [
        'store' => 'Loja',
        'appearance' => 'Aparência',
        'stripe' => 'Stripe',
        'email' => 'Email',
        'security' => 'Segurança',
        'invoicing' => 'Faturação',
    ];

    public function __construct(
        private readonly SettingsService $settings,
    ) {}

    public function index(Request $request): Response
    {
        $group = $request->string('group', 'store')->toString();

        if (! array_key_exists($group, self::GROUPS)) {
            $group = 'store';
        }

        $settings = $this->settings->group($group)
            ->sortBy('key')
            ->values()
            ->map(fn (Setting $setting) => [
                'key' => $setting->key,
                'label' => $setting->label,
                'description' => $setting->description,
                'type' => $setting->type->value,
                'value' => $setting->type === SettingType::Encrypted
                    ? ''
                    : ($setting->type === SettingType::Boolean
                        ? ($setting->getDecryptedValue() ? '1' : '0')
                        : ($setting->getDecryptedValue() ?? '')),
                'masked' => $setting->type === SettingType::Encrypted
                    ? $setting->maskedValue()
                    : null,
                'is_public' => $setting->is_public,
                'asset_url' => in_array($setting->key, ['store.logo_path', 'store.favicon_path'], true)
                    ? $this->settings->assetUrl($setting->getDecryptedValue())
                    : null,
            ]);

        return Inertia::render('Admin/Settings/Index', [
            'group' => $group,
            'groups' => collect(self::GROUPS)->map(fn ($label, $key) => [
                'key' => $key,
                'label' => $label,
            ])->values(),
            'settings' => $settings,
            'stripeWebhookUrl' => route('webhooks.stripe', absolute: true),
            'stripeGuide' => $this->stripeGuide(),
            'contactFormUrl' => route('contact.index', absolute: true),
        ]);
    }

    /**
     * @return array{configured: bool, testMode: bool, apiKeysUrl: string, paymentMethodsUrl: string, webhooksUrl: string}
     */
    private function stripeGuide(): array
    {
        $secret = (string) $this->settings->get('stripe.secret_key', '');
        $testMode = str_starts_with($secret, 'sk_test_');
        $prefix = $testMode ? '/test' : '';

        return [
            'configured' => $this->settings->get('stripe.publishable_key') && $secret !== '',
            'testMode' => $testMode,
            'apiKeysUrl' => "https://dashboard.stripe.com{$prefix}/apikeys",
            'paymentMethodsUrl' => 'https://dashboard.stripe.com/settings/payment_methods',
            'webhooksUrl' => "https://dashboard.stripe.com{$prefix}/webhooks",
        ];
    }

    public function update(SettingsRequest $request): RedirectResponse
    {
        $group = $request->string('group')->toString();
        $allowedKeys = $this->settings->group($group)->pluck('key')->all();

        foreach ($request->input('settings', []) as $key => $value) {
            if (! in_array($key, $allowedKeys, true)) {
                continue;
            }

            if ($value === null || $value === '' || $value === '__UNCHANGED__') {
                continue;
            }

            $setting = Setting::query()->where('key', $key)->first();

            if (! $setting) {
                continue;
            }

            if ($setting->type === SettingType::Boolean) {
                $this->settings->set($key, filter_var($value, FILTER_VALIDATE_BOOLEAN));

                continue;
            }

            if ($setting->type === SettingType::Encrypted && str_contains((string) $value, '****')) {
                continue;
            }

            $this->settings->set($key, $value);
        }

        return Redirect::back()->with('success', 'Configurações guardadas.');
    }

    public function uploadAsset(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'image', 'max:4096'],
            'key' => ['required', 'in:store.logo_path,store.favicon_path'],
        ]);

        $path = $request->file('file')->store('branding', 'public');
        $this->settings->set($request->string('key')->toString(), $path);

        return Redirect::back()->with('success', 'Ficheiro carregado com sucesso.');
    }
}
