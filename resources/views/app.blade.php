<!DOCTYPE html>
<html lang="pt">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php
            $branding = app(\App\Services\SettingsService::class)->branding();
        @endphp

        <title inertia>{{ $branding['name'] }}</title>

        @if ($branding['favicon_url'])
            <link rel="icon" href="{{ $branding['favicon_url'] }}">
        @endif

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-white text-brand-900">
        @inertia
    </body>
</html>
