<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentFormat;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ContentPageRequest;
use App\Models\ContentPage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ContentPageController extends Controller
{
    public function index(): Response
    {
        $pages = ContentPage::query()
            ->orderBy('sort_order')
            ->get()
            ->map(fn (ContentPage $page) => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'footer_section' => $page->footer_section?->value,
                'footer_section_label' => $page->footer_section?->label(),
                'show_in_footer' => $page->show_in_footer,
                'is_published' => $page->is_published,
                'sort_order' => $page->sort_order,
            ]);

        return Inertia::render('Admin/Pages/Index', ['pages' => $pages]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Pages/Form', [
            'page' => null,
            'footerSections' => $this->footerSections(),
            'contentFormats' => $this->contentFormats(),
        ]);
    }

    public function store(ContentPageRequest $request): RedirectResponse
    {
        $data = $this->pageData($request);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['title']);

        ContentPage::query()->create($data);

        return Redirect::route('admin.pages.index')
            ->with('success', 'Página criada.');
    }

    public function edit(ContentPage $page): Response
    {
        return Inertia::render('Admin/Pages/Form', [
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'content' => $page->content,
                'content_format' => $page->content_format?->value ?? ContentFormat::Html->value,
                'footer_section' => $page->footer_section?->value,
                'show_in_footer' => $page->show_in_footer,
                'sort_order' => $page->sort_order,
                'is_published' => $page->is_published,
            ],
            'footerSections' => $this->footerSections(),
            'contentFormats' => $this->contentFormats(),
        ]);
    }

    public function update(ContentPageRequest $request, ContentPage $page): RedirectResponse
    {
        $data = $this->pageData($request);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['title'], $page->id);

        $page->update($data);

        return Redirect::route('admin.pages.index')
            ->with('success', 'Página atualizada.');
    }

    public function destroy(ContentPage $page): RedirectResponse
    {
        $page->delete();

        return Redirect::route('admin.pages.index')
            ->with('success', 'Página eliminada.');
    }

    /**
     * @return array<string, mixed>
     */
    private function pageData(ContentPageRequest $request): array
    {
        $data = $request->validated();
        $data['show_in_footer'] = $request->boolean('show_in_footer');
        $data['is_published'] = $request->boolean('is_published');
        $data['footer_section'] = $data['footer_section'] ?? null;

        return $data;
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function footerSections(): array
    {
        return collect(\App\Enums\ContentPageFooterSection::cases())
            ->map(fn ($s) => ['value' => $s->value, 'label' => $s->label()])
            ->all();
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function contentFormats(): array
    {
        return collect(ContentFormat::cases())
            ->map(fn ($format) => ['value' => $format->value, 'label' => $format->label()])
            ->all();
    }

    private function uniqueSlug(string $nameOrSlug, ?int $ignoreId = null): string
    {
        $slug = Str::slug($nameOrSlug);
        $original = $slug;
        $i = 1;

        while (
            ContentPage::query()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $original.'-'.$i++;
        }

        return $slug;
    }
}
