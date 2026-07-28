<?php

namespace App\Http\Controllers\Admin;

use App\Enums\NavigationItemType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\NavigationItemRequest;
use App\Models\Category;
use App\Models\ContentPage;
use App\Models\NavigationItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class NavigationController extends Controller
{
    public function index(): Response
    {
        $items = NavigationItem::query()
            ->orderBy('sort_order')
            ->get()
            ->map(fn (NavigationItem $item) => [
                'id' => $item->id,
                'label' => $item->label,
                'type' => $item->type->value,
                'type_label' => $item->type->label(),
                'target' => $item->target,
                'sort_order' => $item->sort_order,
                'is_active' => $item->is_active,
                'open_in_new_tab' => $item->open_in_new_tab,
            ]);

        return Inertia::render('Admin/Navigation/Index', ['items' => $items]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Navigation/Form', [
            'item' => null,
            'types' => $this->types(),
            'pages' => $this->pageOptions(),
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function store(NavigationItemRequest $request): RedirectResponse
    {
        NavigationItem::query()->create($this->itemData($request));

        return Redirect::route('admin.navigation.index')
            ->with('success', 'Item de navegação criado.');
    }

    public function edit(NavigationItem $navigationItem): Response
    {
        return Inertia::render('Admin/Navigation/Form', [
            'item' => [
                'id' => $navigationItem->id,
                'label' => $navigationItem->label,
                'type' => $navigationItem->type->value,
                'target' => $navigationItem->target,
                'sort_order' => $navigationItem->sort_order,
                'is_active' => $navigationItem->is_active,
                'open_in_new_tab' => $navigationItem->open_in_new_tab,
            ],
            'types' => $this->types(),
            'pages' => $this->pageOptions(),
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function update(NavigationItemRequest $request, NavigationItem $navigationItem): RedirectResponse
    {
        $navigationItem->update($this->itemData($request));

        return Redirect::route('admin.navigation.index')
            ->with('success', 'Item de navegação atualizado.');
    }

    public function destroy(NavigationItem $navigationItem): RedirectResponse
    {
        $navigationItem->delete();

        return Redirect::route('admin.navigation.index')
            ->with('success', 'Item de navegação eliminado.');
    }

    /**
     * @return array<string, mixed>
     */
    private function itemData(NavigationItemRequest $request): array
    {
        $data = $request->validated();
        $data['location'] = 'header';
        $data['is_active'] = $request->boolean('is_active');
        $data['open_in_new_tab'] = $request->boolean('open_in_new_tab');
        $data['target'] = in_array($data['type'], ['products', 'home'], true)
            ? null
            : ($data['target'] ?? null);

        return $data;
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function types(): array
    {
        return collect(NavigationItemType::cases())
            ->map(fn ($t) => ['value' => $t->value, 'label' => $t->label()])
            ->all();
    }

    /**
     * @return array<int, array{slug: string, title: string}>
     */
    private function pageOptions(): array
    {
        return ContentPage::query()
            ->published()
            ->orderBy('title')
            ->get(['slug', 'title'])
            ->map(fn (ContentPage $p) => ['slug' => $p->slug, 'title' => $p->title])
            ->all();
    }

    /**
     * @return array<int, array{slug: string, name: string}>
     */
    private function categoryOptions(): array
    {
        return Category::query()
            ->active()
            ->orderBy('name')
            ->get(['slug', 'name'])
            ->map(fn (Category $c) => ['slug' => $c->slug, 'name' => $c->name])
            ->all();
    }
}
