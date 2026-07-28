<?php

use App\Http\Controllers\Store\CartController;
use App\Http\Controllers\Store\CategoryController;
use App\Http\Controllers\Store\CheckoutController;
use App\Http\Controllers\Store\ContactController;
use App\Http\Controllers\Store\ContentPageController;
use App\Http\Controllers\Store\HomeController;
use App\Http\Controllers\Store\ProductController;
use App\Http\Controllers\StripeWebhookController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/produtos/pesquisar', [ProductController::class, 'search'])->name('products.search');
Route::get('/produtos', [ProductController::class, 'index'])->name('products.index');
Route::get('/produtos/{product:slug}', [ProductController::class, 'show'])->name('products.show');
Route::get('/categorias/{category:slug}', [CategoryController::class, 'show'])->name('categories.show');
Route::get('/paginas/{page:slug}', [ContentPageController::class, 'show'])->name('pages.show');

Route::get('/contacte-nos', [ContactController::class, 'index'])->name('contact.index');
Route::post('/contacte-nos', [ContactController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('contact.store');

Route::get('/carrinho', [CartController::class, 'index'])->name('cart.index');
Route::post('/carrinho', [CartController::class, 'store'])->name('cart.store');
Route::patch('/carrinho/{cartItem}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/carrinho/{cartItem}', [CartController::class, 'destroy'])->name('cart.destroy');

Route::get('/checkout/pagamento/{order}', [CheckoutController::class, 'payment'])->name('checkout.payment');
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout', [CheckoutController::class, 'store'])->middleware('throttle:10,1')->name('checkout.store');
Route::get('/checkout/sucesso/{order}', [CheckoutController::class, 'success'])->name('checkout.success');

Route::post('/webhooks/stripe', StripeWebhookController::class)->name('webhooks.stripe');
