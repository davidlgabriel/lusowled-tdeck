<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\AddToCartRequest;
use App\Http\Requests\Store\UpdateCartItemRequest;
use App\Models\CartItem;
use App\Models\Product;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(
        private readonly CartService $cartService,
    ) {}

    public function index(Request $request): Response
    {
        $cart = $this->cartService->resolve($request);

        return Inertia::render('Store/Cart/Index', [
            'cart' => $this->cartService->summary($cart),
        ]);
    }

    public function store(AddToCartRequest $request): RedirectResponse
    {
        $cart = $this->cartService->resolve($request);
        $product = Product::query()->active()->findOrFail($request->integer('product_id'));

        $this->cartService->addItem(
            $cart,
            $product,
            $request->input('product_variant_id'),
            $request->integer('quantity'),
        );

        return redirect()
            ->back()
            ->with('cart_toast', [
                'type' => 'added',
                'product_name' => $product->name,
                'quantity' => $request->integer('quantity'),
            ]);
    }

    public function update(UpdateCartItemRequest $request, CartItem $cartItem): RedirectResponse
    {
        $cart = $this->cartService->resolve($request);
        $cartItem->load('product');

        $this->cartService->updateQuantity(
            $cart,
            $cartItem,
            $request->integer('quantity'),
        );

        $quantity = $request->integer('quantity');

        if ($quantity < 1) {
            return redirect()
                ->back()
                ->with('cart_toast', [
                    'type' => 'removed',
                    'product_name' => $cartItem->product->name,
                ]);
        }

        return redirect()
            ->back()
            ->with('cart_toast', [
                'type' => 'updated',
                'product_name' => $cartItem->product->name,
                'quantity' => $quantity,
            ]);
    }

    public function destroy(Request $request, CartItem $cartItem): RedirectResponse
    {
        $cart = $this->cartService->resolve($request);
        $cartItem->load('product');
        $productName = $cartItem->product->name;

        $this->cartService->removeItem($cart, $cartItem);

        return redirect()
            ->back()
            ->with('cart_toast', [
                'type' => 'removed',
                'product_name' => $productName,
            ]);
    }
}
