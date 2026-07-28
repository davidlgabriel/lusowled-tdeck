<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PromotionAppliesTo;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PromotionRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class PromotionController extends Controller
{
    public function index(): Response
    {
        $promotions = Promotion::query()
            ->latest()
            ->get()
            ->map(fn (Promotion $promo) => [
                'id' => $promo->id,
                'name' => $promo->name,
                'code' => $promo->code,
                'type' => $promo->type->value,
                'type_label' => $promo->type->label(),
                'value' => (float) $promo->value,
                'applies_to' => $promo->applies_to->value,
                'applies_to_label' => $promo->applies_to->label(),
                'is_active' => $promo->is_active,
                'is_currently_active' => $promo->isCurrentlyActive(),
                'usage_count' => $promo->usage_count,
                'usage_limit' => $promo->usage_limit,
                'starts_at' => $promo->starts_at?->format('Y-m-d\TH:i'),
                'ends_at' => $promo->ends_at?->format('Y-m-d\TH:i'),
            ]);

        return Inertia::render('Admin/Promotions/Index', ['promotions' => $promotions]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Promotions/Form', [
            'promotion' => null,
            'products' => $this->productOptions(),
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function store(PromotionRequest $request): RedirectResponse
    {
        $promotion = Promotion::query()->create($this->promotionData($request));
        $this->syncRelations($promotion, $request);

        return Redirect::route('admin.promotions.index')
            ->with('success', 'Promoção criada.');
    }

    public function edit(Promotion $promotion): Response
    {
        $promotion->load(['products', 'categories']);

        return Inertia::render('Admin/Promotions/Form', [
            'promotion' => [
                'id' => $promotion->id,
                'name' => $promotion->name,
                'code' => $promotion->code,
                'description' => $promotion->description,
                'type' => $promotion->type->value,
                'value' => (float) $promotion->value,
                'applies_to' => $promotion->applies_to->value,
                'starts_at' => $promotion->starts_at?->format('Y-m-d\TH:i'),
                'ends_at' => $promotion->ends_at?->format('Y-m-d\TH:i'),
                'usage_limit' => $promotion->usage_limit,
                'is_active' => $promotion->is_active,
                'product_ids' => $promotion->products->pluck('id'),
                'category_ids' => $promotion->categories->pluck('id'),
            ],
            'products' => $this->productOptions(),
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function update(PromotionRequest $request, Promotion $promotion): RedirectResponse
    {
        $promotion->update($this->promotionData($request));
        $this->syncRelations($promotion, $request);

        return Redirect::route('admin.promotions.index')
            ->with('success', 'Promoção atualizada.');
    }

    public function destroy(Promotion $promotion): RedirectResponse
    {
        $promotion->delete();

        return Redirect::route('admin.promotions.index')
            ->with('success', 'Promoção eliminada.');
    }

    /**
     * @return array<string, mixed>
     */
    private function promotionData(PromotionRequest $request): array
    {
        $data = $request->validated();
        unset($data['product_ids'], $data['category_ids']);
        $data['is_active'] = $request->boolean('is_active');
        $data['code'] = $data['code'] ? strtoupper(trim($data['code'])) : null;
        $data['usage_limit'] = $data['usage_limit'] ?? null;
        $data['starts_at'] = $data['starts_at'] ?: null;
        $data['ends_at'] = $data['ends_at'] ?: null;

        return $data;
    }

    private function syncRelations(Promotion $promotion, PromotionRequest $request): void
    {
        $appliesTo = PromotionAppliesTo::from($request->string('applies_to')->toString());

        if ($appliesTo === PromotionAppliesTo::Product) {
            $promotion->products()->sync($request->input('product_ids', []));
            $promotion->categories()->sync([]);
        } elseif ($appliesTo === PromotionAppliesTo::Category) {
            $promotion->categories()->sync($request->input('category_ids', []));
            $promotion->products()->sync([]);
        } else {
            $promotion->products()->sync([]);
            $promotion->categories()->sync([]);
        }
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function productOptions(): array
    {
        return Product::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Product $p) => ['id' => $p->id, 'name' => $p->name])
            ->all();
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function categoryOptions(): array
    {
        return Category::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Category $c) => ['id' => $c->id, 'name' => $c->name])
            ->all();
    }
}
