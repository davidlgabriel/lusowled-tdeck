<?php

namespace Tests\Feature;

use App\Models\ContentPage;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CmsTest extends TestCase
{
    use RefreshDatabase;

    public function test_cms_page_is_publicly_visible(): void
    {
        $this->seed(DatabaseSeeder::class);

        $page = ContentPage::query()->where('slug', 'termos-e-condicoes')->first();
        $this->assertNotNull($page);

        $this->get(route('pages.show', $page->slug))
            ->assertOk()
            ->assertInertia(fn ($inertia) => $inertia
                ->component('Store/Pages/Show')
                ->where('page.slug', 'termos-e-condicoes'));
    }

    public function test_admin_can_manage_cms_pages(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'admin@lusoweld.pt')->first();

        $this->actingAs($admin)
            ->get(route('admin.pages.index'))
            ->assertOk()
            ->assertInertia(fn ($inertia) => $inertia
                ->component('Admin/Pages/Index')
                ->has('pages'));

        $this->actingAs($admin)
            ->get(route('admin.navigation.index'))
            ->assertOk();

        $this->actingAs($admin)
            ->get(route('admin.appearance.index'))
            ->assertOk();
    }

    public function test_admin_can_create_plain_text_page(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'admin@lusoweld.pt')->first();

        $this->actingAs($admin)
            ->post(route('admin.pages.store'), [
                'title' => 'Contactos',
                'slug' => 'contactos',
                'content' => "Linha 1\n\nLinha 2",
                'content_format' => 'plain',
                'footer_section' => 'customer_support',
                'show_in_footer' => true,
                'sort_order' => 10,
                'is_published' => true,
            ])
            ->assertRedirect(route('admin.pages.index'));

        $page = ContentPage::query()->where('slug', 'contactos')->first();
        $this->assertNotNull($page);
        $this->assertEquals('plain', $page->content_format->value);

        $this->get(route('pages.show', 'contactos'))
            ->assertOk()
            ->assertInertia(fn ($inertia) => $inertia
                ->component('Store/Pages/Show')
                ->where('page.content_format', 'plain')
                ->where('page.content', "Linha 1\n\nLinha 2"));
    }
}
