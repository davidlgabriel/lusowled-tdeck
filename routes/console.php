<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('settings:sync-missing', function () {
    $created = app(\App\Services\SettingsService::class)->syncMissingFromDefinition();

    $this->info($created > 0
        ? "Foram criadas {$created} configurações em falta."
        : 'Todas as configurações já existiam — nada foi alterado.');
})->purpose('Criar configurações em falta sem alterar as existentes');
