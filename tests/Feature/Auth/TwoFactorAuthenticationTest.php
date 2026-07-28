<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Services\TwoFactorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class TwoFactorAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_with_two_factor_is_redirected_to_challenge_on_login(): void
    {
        $secret = app(TwoFactorService::class)->generateSecret();

        $admin = User::factory()->admin()->withTwoFactor($secret)->create();

        $response = $this->post('/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $this->assertGuest();
        $response->assertRedirect(route('two-factor.login'));
        $this->assertEquals($admin->id, session('login.id'));
    }

    public function test_admin_can_complete_login_with_valid_totp_code(): void
    {
        $secret = app(TwoFactorService::class)->generateSecret();
        $admin = User::factory()->admin()->withTwoFactor($secret)->create();
        $code = (new Google2FA)->getCurrentOtp($secret);

        $this->post('/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $response = $this->post('/two-factor-challenge', [
            'code' => $code,
        ]);

        $this->assertAuthenticatedAs($admin);
        $response->assertRedirect(route('admin.dashboard', absolute: false));
        $this->assertTrue(session('auth.two_factor_verified'));
    }

    public function test_admin_with_two_factor_cannot_access_admin_without_verification(): void
    {
        $admin = User::factory()->admin()->withTwoFactor()->create();

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertRedirect(route('two-factor.login'));
    }

    public function test_admin_can_access_security_setup_without_two_factor_verification(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.two-factor.show'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/TwoFactor/Index')
                ->where('enabled', false)
                ->has('qrCode')
                ->has('secret'));
    }

    public function test_admin_can_enable_two_factor(): void
    {
        $twoFactor = app(TwoFactorService::class);
        $secret = $twoFactor->generateSecret();
        $admin = User::factory()->admin()->create();
        $code = (new Google2FA)->getCurrentOtp($secret);

        $this->actingAs($admin)
            ->withSession(['two_factor.setup_secret' => $secret])
            ->post(route('admin.two-factor.enable'), ['code' => $code])
            ->assertRedirect(route('admin.two-factor.show'));

        $admin->refresh();

        $this->assertTrue($admin->hasTwoFactorEnabled());
        $this->assertNotEmpty($admin->two_factor_recovery_codes);
    }

    public function test_admin_can_login_with_recovery_code(): void
    {
        $admin = User::factory()->admin()->withTwoFactor()->create();

        $this->post('/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $response = $this->post('/two-factor-challenge', [
            'recovery_code' => 'RECOVERY01',
        ]);

        $this->assertAuthenticatedAs($admin);
        $response->assertRedirect(route('admin.dashboard', absolute: false));

        $admin->refresh();
        $this->assertNotContains('RECOVERY01', $admin->two_factor_recovery_codes);
    }
}
