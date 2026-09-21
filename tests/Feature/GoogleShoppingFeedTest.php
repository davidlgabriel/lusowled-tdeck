<?php

namespace Tests\Feature;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\User;
use App\Services\GoogleShoppingFeedService;
use App\Services\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GoogleShoppingFeedTest extends TestCase
{
    use RefreshDatabase;

    public function test_feed_is_hidden_when_disabled(): void
    {
        $this->seed();

        app(SettingsService::class)->syncMissingFromDefinition();
        $feed = app(GoogleShoppingFeedService::class);
        if ($feed->feedToken() === '') {
            $feed->regenerateToken();
        }
        $token = $feed->feedToken();

        $this->get("/feeds/google-shopping/{$token}.xml")
            ->assertNotFound();
    }

    public function test_feed_returns_xml_for_active_products_when_enabled(): void
    {
        $this->seed();

        app(SettingsService::class)->syncMissingFromDefinition();
        $settings = app(SettingsService::class);
        $settings->set('google_shopping.enabled', true);
        $token = app(GoogleShoppingFeedService::class)->feedToken();

        $product = Product::query()->active()->first();
        $this->assertNotNull($product);

        $response = $this->get("/feeds/google-shopping/{$token}.xml");

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
        $response->assertSee('<rss version="2.0"', false);
        $response->assertSee($product->sku, false);
        $response->assertSee('<g:title>', false);
    }

    public function test_feed_rejects_invalid_token(): void
    {
        $this->seed();

        app(SettingsService::class)->syncMissingFromDefinition();
        app(SettingsService::class)->set('google_shopping.enabled', true);

        $this->get('/feeds/google-shopping/invalid-token.xml')
            ->assertNotFound();
    }

    public function test_draft_products_are_excluded_from_feed(): void
    {
        $this->seed();

        app(SettingsService::class)->syncMissingFromDefinition();
        $settings = app(SettingsService::class);
        $settings->set('google_shopping.enabled', true);
        $token = app(GoogleShoppingFeedService::class)->feedToken();

        $draft = Product::factory()->create([
            'name' => 'Produto Rascunho Feed Teste XYZ',
            'sku' => 'DRAFT-FEED-XYZ-999',
            'status' => ProductStatus::Draft,
        ]);

        $response = $this->get("/feeds/google-shopping/{$token}.xml");

        $response->assertOk();
        $response->assertDontSee($draft->sku, false);
    }

    public function test_admin_can_open_google_shopping_settings(): void
    {
        $this->seed();

        $admin = User::query()->where('email', 'info@lusoweld.com')->first();
        $this->assertNotNull($admin);

        $this->actingAs($admin)
            ->get(route('admin.settings.index', ['group' => 'google_shopping']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Settings/Index')
                ->has('googleShopping'));
    }
}
