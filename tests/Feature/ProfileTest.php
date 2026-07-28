<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('account.profile'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Account/Profile'));
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch(route('account.profile.update'), [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'phone' => '912000000',
                'tax_id' => '123456789',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('account.profile'));

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch(route('account.profile.update'), [
                'name' => 'Test User',
                'email' => $user->email,
                'phone' => null,
                'tax_id' => null,
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('account.profile'));

        $this->assertNotNull($user->refresh()->email_verified_at);
    }
}
