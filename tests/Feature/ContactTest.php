<?php

namespace Tests\Feature;

use App\Mail\ContactMessageMail;
use App\Models\Setting;
use App\Services\SettingsService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_page_renders(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->get(route('contact.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Store/Contact/Index')
                ->has('defaults'));
    }

    public function test_contact_form_sends_email_to_configured_recipient(): void
    {
        $this->seed(DatabaseSeeder::class);
        Mail::fake();

        $this->post(route('contact.store'), [
            'name' => 'João Silva',
            'email' => 'joao@example.com',
            'phone' => '912345678',
            'subject' => 'Orçamento decking',
            'message' => 'Gostaria de um orçamento para 20m2.',
        ])
            ->assertRedirect(route('contact.index'))
            ->assertSessionHas('success');

        Mail::assertSent(ContactMessageMail::class, function (ContactMessageMail $mail) {
            return $mail->hasTo('loja.tdeck@lusoweld.com')
                && $mail->contact['name'] === 'João Silva'
                && $mail->contact['email'] === 'joao@example.com';
        });
    }

    public function test_contact_form_fails_without_recipient_configured(): void
    {
        $this->seed(DatabaseSeeder::class);

        Setting::query()
            ->where('key', 'email.contact_recipient')
            ->update(['value' => '']);

        app(SettingsService::class)->clearCache();

        $this->post(route('contact.store'), [
            'name' => 'João Silva',
            'email' => 'joao@example.com',
            'subject' => 'Teste',
            'message' => 'Mensagem de teste.',
        ])
            ->assertSessionHasErrors('contact');
    }

    public function test_contact_form_validates_required_fields(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->post(route('contact.store'), [])
            ->assertSessionHasErrors(['name', 'email', 'subject', 'message']);
    }
}
