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

class AppearanceController extends Controller
{
    public function __construct(
        private readonly SettingsService $settings,
    ) {}

    public function index(): Response
    {
        $settings = $this->settings->group('appearance')
            ->sortBy('key')
            ->values()
            ->map(fn (Setting $setting) => [
                'key' => $setting->key,
                'label' => $setting->label,
                'description' => $setting->description,
                'type' => $setting->type->value,
                'value' => $setting->getDecryptedValue() ?? '',
                'asset_url' => $setting->key === 'store.home_hero_image'
                    ? $this->settings->assetUrl($setting->getDecryptedValue())
                    : null,
            ]);

        return Inertia::render('Admin/Appearance/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(SettingsRequest $request): RedirectResponse
    {
        foreach ($request->input('settings', []) as $key => $value) {
            if (! str_starts_with($key, 'store.')) {
                continue;
            }

            if ($value === null || $value === '') {
                continue;
            }

            $this->settings->set($key, $value);
        }

        return Redirect::back()->with('success', 'Aparência atualizada.');
    }

    public function uploadHero(Request $request): RedirectResponse
    {
        $request->validate(['image' => ['required', 'image', 'max:5120']]);

        $path = $request->file('image')->store('appearance', 'public');
        $this->settings->set('store.home_hero_image', $path);

        return Redirect::back()->with('success', 'Imagem hero atualizada.');
    }
}
