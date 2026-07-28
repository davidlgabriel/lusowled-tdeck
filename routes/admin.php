<?php

use App\Http\Controllers\Admin\AppearanceController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ContentPageController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\NavigationController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PaymentMethodController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\PromotionController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\StockController;
use App\Http\Controllers\Admin\TwoFactorController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/seguranca', [TwoFactorController::class, 'show'])->name('two-factor.show');
        Route::post('/seguranca', [TwoFactorController::class, 'enable'])->name('two-factor.enable');
        Route::delete('/seguranca', [TwoFactorController::class, 'disable'])->name('two-factor.disable');
    });

Route::middleware(['auth', 'verified', 'admin', 'two-factor'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('/produtos', [ProductController::class, 'index'])->name('products.index');
        Route::get('/produtos/criar', [ProductController::class, 'create'])->name('products.create');
        Route::post('/produtos', [ProductController::class, 'store'])->name('products.store');
        Route::get('/produtos/{product}/editar', [ProductController::class, 'edit'])->name('products.edit');
        Route::patch('/produtos/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/produtos/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
        Route::post('/produtos/{product}/imagens', [ProductController::class, 'storeImage'])->name('products.images.store');
        Route::delete('/produtos/{product}/imagens/{image}', [ProductController::class, 'destroyImage'])->name('products.images.destroy');
        Route::patch('/produtos/{product}/imagens/{image}/principal', [ProductController::class, 'setPrimaryImage'])->name('products.images.primary');

        Route::get('/categorias', [CategoryController::class, 'index'])->name('categories.index');
        Route::get('/categorias/criar', [CategoryController::class, 'create'])->name('categories.create');
        Route::post('/categorias', [CategoryController::class, 'store'])->name('categories.store');
        Route::get('/categorias/{category}/editar', [CategoryController::class, 'edit'])->name('categories.edit');
        Route::patch('/categorias/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categorias/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
        Route::post('/categorias/{category}/imagem', [CategoryController::class, 'storeImage'])->name('categories.image.store');
        Route::delete('/categorias/{category}/imagem', [CategoryController::class, 'destroyImage'])->name('categories.image.destroy');

        Route::get('/promocoes', [PromotionController::class, 'index'])->name('promotions.index');
        Route::get('/promocoes/criar', [PromotionController::class, 'create'])->name('promotions.create');
        Route::post('/promocoes', [PromotionController::class, 'store'])->name('promotions.store');
        Route::get('/promocoes/{promotion}/editar', [PromotionController::class, 'edit'])->name('promotions.edit');
        Route::patch('/promocoes/{promotion}', [PromotionController::class, 'update'])->name('promotions.update');
        Route::delete('/promocoes/{promotion}', [PromotionController::class, 'destroy'])->name('promotions.destroy');

        Route::get('/stock', [StockController::class, 'index'])->name('stock.index');
        Route::patch('/stock/{product}', [StockController::class, 'update'])->name('stock.update');

        Route::get('/configuracoes', [SettingsController::class, 'index'])->name('settings.index');
        Route::patch('/configuracoes', [SettingsController::class, 'update'])->name('settings.update');
        Route::post('/configuracoes/upload', [SettingsController::class, 'uploadAsset'])->name('settings.upload');

        Route::get('/paginas', [ContentPageController::class, 'index'])->name('pages.index');
        Route::get('/paginas/criar', [ContentPageController::class, 'create'])->name('pages.create');
        Route::post('/paginas', [ContentPageController::class, 'store'])->name('pages.store');
        Route::get('/paginas/{page}/editar', [ContentPageController::class, 'edit'])->name('pages.edit');
        Route::patch('/paginas/{page}', [ContentPageController::class, 'update'])->name('pages.update');
        Route::delete('/paginas/{page}', [ContentPageController::class, 'destroy'])->name('pages.destroy');

        Route::get('/navegacao', [NavigationController::class, 'index'])->name('navigation.index');
        Route::get('/navegacao/criar', [NavigationController::class, 'create'])->name('navigation.create');
        Route::post('/navegacao', [NavigationController::class, 'store'])->name('navigation.store');
        Route::get('/navegacao/{navigationItem}/editar', [NavigationController::class, 'edit'])->name('navigation.edit');
        Route::patch('/navegacao/{navigationItem}', [NavigationController::class, 'update'])->name('navigation.update');
        Route::delete('/navegacao/{navigationItem}', [NavigationController::class, 'destroy'])->name('navigation.destroy');

        Route::get('/metodos-pagamento', [PaymentMethodController::class, 'index'])->name('payment-methods.index');
        Route::get('/metodos-pagamento/criar', [PaymentMethodController::class, 'create'])->name('payment-methods.create');
        Route::post('/metodos-pagamento', [PaymentMethodController::class, 'store'])->name('payment-methods.store');
        Route::get('/metodos-pagamento/{paymentMethod}/editar', [PaymentMethodController::class, 'edit'])->name('payment-methods.edit');
        Route::patch('/metodos-pagamento/{paymentMethod}', [PaymentMethodController::class, 'update'])->name('payment-methods.update');
        Route::delete('/metodos-pagamento/{paymentMethod}', [PaymentMethodController::class, 'destroy'])->name('payment-methods.destroy');

        Route::get('/aparencia', [AppearanceController::class, 'index'])->name('appearance.index');
        Route::patch('/aparencia', [AppearanceController::class, 'update'])->name('appearance.update');
        Route::post('/aparencia/hero', [AppearanceController::class, 'uploadHero'])->name('appearance.hero');

        Route::get('/encomendas', [OrderController::class, 'index'])->name('orders.index');
        Route::get('/encomendas/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::patch('/encomendas/{order}/estado', [OrderController::class, 'updateStatus'])->name('orders.status');
    });
