<?php

use App\Http\Controllers\Customer\AccountController;
use App\Http\Controllers\Customer\AddressController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Customer\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->prefix('conta')->name('account.')->group(function () {
    Route::get('/', [AccountController::class, 'index'])->name('dashboard');
    Route::get('/perfil', [ProfileController::class, 'edit'])->name('profile');
    Route::patch('/perfil', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('/moradas', [AddressController::class, 'index'])->name('addresses.index');
    Route::post('/moradas', [AddressController::class, 'store'])->name('addresses.store');
    Route::patch('/moradas/{address}', [AddressController::class, 'update'])->name('addresses.update');
    Route::delete('/moradas/{address}', [AddressController::class, 'destroy'])->name('addresses.destroy');

    Route::get('/encomendas', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/encomendas/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::get('/encomendas/{order}/fatura', [OrderController::class, 'downloadInvoice'])->name('orders.invoice');
});

Route::redirect('/dashboard', '/conta');
Route::redirect('/profile', '/conta/perfil');
