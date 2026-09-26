<?php

namespace App\Services\Music;

use App\Models\User;
use Symfony\Component\HttpFoundation\RedirectResponse;

interface MusicServiceInterface
{
    /**
     * Redirect the user to the provider to authorize this app.
     */
    public function redirect(): RedirectResponse;

    /**
     * Complete the authorization callback and store the user's tokens.
     */
    public function connect(User $user): void;

    /**
     * Get a valid access token for the user, refreshing it if expired.
     */
    public function accessToken(User $user): string;

    /**
     * Get the user's most recently saved albums.
     *
     * @return array<int, Album>
     */
    public function savedAlbums(User $user, int $limit): array;
}
