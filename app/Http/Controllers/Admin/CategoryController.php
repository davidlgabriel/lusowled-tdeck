<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use App\Support\PublicAsset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::query()
            ->with('parent')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Category $category) => $this->formatCategory($category));

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Categories/Form', [
            'category' => null,
            'parents' => $this->parentOptions(),
        ]);
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['parent_id'] = $data['parent_id'] ?? null;
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name']);
        $data['is_active'] = $request->boolean('is_active', true);

        Category::query()->create($data);

        return Redirect::route('admin.categories.index')
            ->with('success', 'Categoria criada.');
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('Admin/Categories/Form', [
            'category' => $this->formatCategory($category, full: true),
            'parents' => $this->parentOptions($category->id),
        ]);
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->validated();
        $data['parent_id'] = $data['parent_id'] ?? null;
        $data['slug'] = $this->uniqueSlug(
            $data['slug'] ?? $data['name'],
            $category->id,
        );
        $data['is_active'] = $request->boolean('is_active');

        $category->update($data);

        return Redirect::route('admin.categories.index')
            ->with('success', 'Categoria atualizada.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->children()->exists()) {
            return Redirect::back()->with('error', 'Remova as subcategorias primeiro.');
        }

        if ($category->products()->exists()) {
            return Redirect::back()->with('error', 'A categoria tem produtos associados.');
        }

        $category->delete();

        return Redirect::route('admin.categories.index')
            ->with('success', 'Categoria eliminada.');
    }

    public function storeImage(Request $request, Category $category): RedirectResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:5120'],
        ]);

        $this->deleteImageFile($category->image_path);

        $path = $request->file('image')->store('categories/'.$category->id, 'public');
        $category->update(['image_path' => $path]);

        return Redirect::back()->with('success', 'Imagem da categoria atualizada.');
    }

    public function destroyImage(Category $category): RedirectResponse
    {
        $this->deleteImageFile($category->image_path);
        $category->update(['image_path' => null]);

        return Redirect::back()->with('success', 'Imagem da categoria removida.');
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function parentOptions(?int $excludeId = null): array
    {
        return Category::query()
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Category $c) => ['id' => $c->id, 'name' => $c->name])
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function formatCategory(Category $category, bool $full = false): array
    {
        $base = [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'parent' => $category->parent?->name,
            'parent_id' => $category->parent_id,
            'is_active' => $category->is_active,
            'sort_order' => $category->sort_order,
            'products_count' => $category->products()->count(),
        ];

        if ($full) {
            $base['description'] = $category->description;
            $base['image_path'] = $category->image_path;
            $base['image_url'] = PublicAsset::url($category->image_path);
        }

        return $base;
    }

    private function deleteImageFile(?string $path): void
    {
        if ($path === null || $path === '') {
            return;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return;
        }

        Storage::disk('public')->delete($path);
    }

    private function uniqueSlug(string $nameOrSlug, ?int $ignoreId = null): string
    {
        $slug = Str::slug($nameOrSlug);
        $original = $slug;
        $i = 1;

        while (
            Category::query()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $original.'-'.$i++;
        }

        return $slug;
    }
}
