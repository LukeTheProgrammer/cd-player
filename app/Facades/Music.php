<?php

namespace App\Facades;

use App\Services\Music\MusicServiceInterface;
use Illuminate\Support\Facades\Facade;

/**
 * @method static \Symfony\Component\HttpFoundation\RedirectResponse redirect()
 * @method static void connect(\App\Models\User $user)
 * @method static string accessToken(\App\Models\User $user)
 * @method static array<int, \App\Services\Music\Album> savedAlbums(\App\Models\User $user, int $limit)
 *
 * @see MusicServiceInterface
 */
class Music extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return MusicServiceInterface::class;
    }
}
