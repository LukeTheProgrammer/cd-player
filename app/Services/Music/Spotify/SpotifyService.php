<?php

namespace App\Services\Music\Spotify;

use App\Models\User;
use App\Services\Music\Album;
use App\Services\Music\MusicServiceInterface;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;
use Laravel\Socialite\Two\User as OAuthUser;
use RuntimeException;
use Symfony\Component\HttpFoundation\RedirectResponse;

class SpotifyService implements MusicServiceInterface
{
    /**
     * @var array<int, string>
     */
    private const array SCOPES = [
        'streaming',
        'user-read-email',
        'user-read-private',
        'user-library-read',
        'user-read-playback-state',
        'user-modify-playback-state',
    ];

    public function redirect(): RedirectResponse
    {
        return $this->provider()
            ->scopes(self::SCOPES)
            ->with(['show_dialog' => 'true'])
            ->redirect();
    }

    public function connect(User $user): void
    {
        $account = $this->provider()->user();

        if (! $account instanceof OAuthUser) {
            throw new RuntimeException('Music provider did not return an OAuth2 user.');
        }

        $user->update([
            'spotify_id' => $account->getId(),
            'spotify_access_token' => $account->token,
            'spotify_refresh_token' => $account->refreshToken,
            'spotify_token_expires_at' => now()->addSeconds($account->expiresIn - 60),
            'wallet' => null,
        ]);
    }

    public function accessToken(User $user): string
    {
        if ($user->spotify_token_expires_at?->isFuture()) {
            return (string) $user->spotify_access_token;
        }

        $response = Http::asForm()
            ->withBasicAuth(config('services.spotify.client_id'), config('services.spotify.client_secret'))
            ->post('https://accounts.spotify.com/api/token', [
                'grant_type' => 'refresh_token',
                'refresh_token' => $user->spotify_refresh_token,
            ])
            ->throw()
            ->json();

        $user->update([
            'spotify_access_token' => $response['access_token'],
            'spotify_refresh_token' => $response['refresh_token'] ?? $user->spotify_refresh_token,
            'spotify_token_expires_at' => now()->addSeconds($response['expires_in'] - 60),
        ]);

        return $response['access_token'];
    }

    public function savedAlbums(User $user, int $limit): array
    {
        $token = $this->accessToken($user);
        $albums = [];

        for ($offset = 0; $offset < $limit; $offset += 50) {
            $items = Http::withToken($token)
                ->get('https://api.spotify.com/v1/me/albums', ['limit' => min(50, $limit - $offset), 'offset' => $offset])
                ->throw()
                ->json('items', []);

            foreach ($items as $item) {
                $album = $item['album'];
                $albums[] = new Album(
                    id: $album['id'],
                    uri: $album['uri'],
                    title: $album['name'],
                    artist: Arr::get($album, 'artists.0.name', ''),
                    year: substr($album['release_date'] ?? '', 0, 4),
                    image: Arr::get($album, 'images.0.url'),
                    trackIds: Arr::pluck($album['tracks']['items'] ?? [], 'id'),
                );
            }

            if (count($items) < 50) {
                break;
            }
        }

        return $albums;
    }

    private function provider(): AbstractProvider
    {
        $provider = Socialite::driver('spotify');

        if (! $provider instanceof AbstractProvider) {
            throw new RuntimeException('Music provider driver is not an OAuth2 provider.');
        }

        return $provider;
    }
}
