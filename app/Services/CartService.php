<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Support\StorefrontData;
use App\Support\VariantPresentation;
use App\Support\VatCalculator;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function __construct(
        private readonly SettingsService $settings,
    ) {}

    public function resolve(Request $request): Cart
    {
        if ($user = $request->user()) {
            return Cart::query()->firstOrCreate(
                ['user_id' => $user->id],
                ['expires_at' => now()->addDays(30)],
            );
        }

        $sessionId = $request->session()->get('cart_session_id');

        if (! $sessionId) {
            $sessionId = (string) Str::uuid();
            $request->session()->put('cart_session_id', $sessionId);
        }

        return Cart::query()->firstOrCreate(
            ['session_id' => $sessionId],
            ['expires_at' => now()->addDays(7)],
        );
    }

    public function mergeGuestCartIntoUser(Request $request, User $user): void
    {
        $sessionId = $request->session()->get('cart_session_id');

        if (! $sessionId) {
            return;
        }

        $guestCart = Cart::query()->where('session_id', $sessionId)->first();

        if (! $guestCart || $guestCart->items->isEmpty()) {
            return;
        }

        $userCart = Cart::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['expires_at' => now()->addDays(30)],
        );

        foreach ($guestCart->items as $item) {
            $this->addItem($userCart, $item->product, $item->product_variant_id, $item->quantity);
        }

        $guestCart->items()->delete();
        $guestCart->delete();
        $request->session()->forget('cart_session_id');
    }

    public function addItem(Cart $cart, Product $product, ?int $variantId, int $quantity): CartItem
    {
        $product->loadMissing('variants');
        $activeVariants = $product->variants->where('is_active', true);
        $variant = $variantId ? $product->variants->firstWhere('id', $variantId) : null;

        if ($activeVariants->isNotEmpty() && ! $variant) {
            throw ValidationException::withMessages([
                'product_variant_id' => 'Selecione uma variante (cor, pack, etc.).',
            ]);
        }

        if ($variantId && ! $variant) {
            throw ValidationException::withMessages([
                'product_variant_id' => 'Variante inválida.',
            ]);
        }

        if ($variant && ! $variant->is_active) {
            throw ValidationException::withMessages([
                'product_variant_id' => 'Esta variante não está disponível.',
            ]);
        }

        $availableStock = $variant ? $variant->stock_quantity : $product->stock_quantity;

        if ($availableStock < 1) {
            throw ValidationException::withMessages([
                'quantity' => 'Produto sem stock disponível.',
            ]);
        }

        if ($quantity > $availableStock) {
            throw ValidationException::withMessages([
                'quantity' => "Apenas {$availableStock} unidades disponíveis.",
            ]);
        }

        $unitPrice = $variant ? $variant->currentPrice() : $product->currentPrice();

        $existing = $cart->items()
            ->where('product_id', $product->id)
            ->where('product_variant_id', $variantId)
            ->first();

        if ($existing) {
            $newQty = $existing->quantity + $quantity;

            if ($newQty > $availableStock) {
                throw ValidationException::withMessages([
                    'quantity' => "Apenas {$availableStock} unidades disponíveis.",
                ]);
            }

            $existing->update([
                'quantity' => $newQty,
                'unit_price' => $unitPrice,
            ]);

            return $existing->fresh();
        }

        return $cart->items()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variantId,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
        ]);
    }

    public function updateQuantity(Cart $cart, CartItem $item, int $quantity): CartItem
    {
        $this->assertItemBelongsToCart($cart, $item);

        if ($quantity < 1) {
            $item->delete();

            return $item;
        }

        $item->load('product.variants', 'variant');
        $availableStock = $item->variant
            ? $item->variant->stock_quantity
            : $item->product->stock_quantity;

        if ($quantity > $availableStock) {
            throw ValidationException::withMessages([
                'quantity' => "Apenas {$availableStock} unidades disponíveis.",
            ]);
        }

        $item->update(['quantity' => $quantity]);

        return $item->fresh();
    }

    public function removeItem(Cart $cart, CartItem $item): void
    {
        $this->assertItemBelongsToCart($cart, $item);
        $item->delete();
    }

    public function clear(Cart $cart): void
    {
        $cart->items()->delete();
    }

    /**
     * @return array<int, array{cart_item_id: int, product_id: int, product_variant_id: int|null, quantity: int}>
     */
    public function storefrontLines(Cart $cart): array
    {
        return $cart->items()
            ->get(['id', 'product_id', 'product_variant_id', 'quantity'])
            ->map(fn (CartItem $item) => [
                'cart_item_id' => $item->id,
                'product_id' => $item->product_id,
                'product_variant_id' => $item->product_variant_id,
                'quantity' => $item->quantity,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function summary(Cart $cart): array
    {
        $cart->load([
            'items.product.images',
            'items.variant',
        ]);

        $vatRate = (float) $this->settings->get('store.default_vat_rate', 23);
        $subtotal = round($cart->subtotal(), 2);
        $taxTotal = VatCalculator::taxFromNet($subtotal, $vatRate);
        $shipping = (float) $this->settings->get('store.shipping_cost', 5.99);
        $currency = (string) $this->settings->get('store.currency', 'EUR');

        return [
            'item_count' => $cart->itemCount(),
            'items' => $cart->items->map(fn (CartItem $item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product->name,
                'product_slug' => $item->product->slug,
                'variant_name' => $item->variant?->name,
                'variant_label' => VariantPresentation::cartLabel($item->variant),
                'variant_options' => $item->variant?->options ?? [],
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'line_total' => $item->lineTotal(),
                'image_url' => StorefrontData::imageUrl(
                    $item->product->images->firstWhere('is_primary', true)
                        ?? $item->product->images->first()
                ),
                'max_quantity' => $item->variant
                    ? $item->variant->stock_quantity
                    : $item->product->stock_quantity,
            ])->values(),
            'subtotal' => $subtotal,
            'tax_total' => $taxTotal,
            'shipping' => $shipping,
            'total' => round($subtotal + $taxTotal + $shipping, 2),
            'currency' => $currency,
            'vat_rate' => $vatRate,
        ];
    }

    private function assertItemBelongsToCart(Cart $cart, CartItem $item): void
    {
        if ($item->cart_id !== $cart->id) {
            abort(403);
        }
    }
}
