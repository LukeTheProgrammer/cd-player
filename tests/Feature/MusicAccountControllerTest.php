<?php

namespace Tests\Feature;

use App\Facades\Music;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MusicAccountControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_connect_forces_spotify_account_dialog(): void
    {
        $response = $this->actingAs(User::factory()->create())->get(route('music.connect'));

        $this->assertStringContainsString('show_dialog=true', $response->headers->get('Location'));
    }

    public function test_callback_without_code_redirects_to_wallet_with_error(): void
    {
        Music::shouldReceive('connect')->never();

        $response = $this->actingAs(User::factory()->create())
            ->get(route('music.callback', ['error' => 'access_denied', 'state' => 'abc']));

        $response->assertRedirect(route('wallet'));
        $response->assertSessionHasErrors(['music' => 'Spotify authorization failed: access_denied']);
    }
}
