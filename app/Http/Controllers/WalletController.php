<?php

namespace App\Http\Controllers;

use App\Facades\Music;
use App\Services\Music\Album;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    private const int SLOTS = 72;

    /**
     * Show the wallet, filling it from the user's saved albums on first visit.
     */
    public function show(Request $request): Response
    {
        $user = $request->user();
        $connected = $user->spotify_refresh_token !== null;

        if ($connected && $user->wallet === null) {
            $albums = array_map(fn (Album $album): array => $album->toArray(), Music::savedAlbums($user, self::SLOTS));
            $user->update(['wallet' => array_pad($albums, self::SLOTS, null)]);
        }

        return Inertia::render('wallet/WalletPage', [
            'connected' => $connected,
            'slots' => $user->wallet ?? array_fill(0, self::SLOTS, null),
        ]);
    }

    /**
     * Save a new slot arrangement. Only albums already in the wallet can be placed.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'slots' => ['required', 'array', 'size:'.self::SLOTS],
            'slots.*' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        $albums = collect($user->wallet ?? [])->filter()->keyBy('id');

        $user->update([
            'wallet' => array_map(fn (?string $id): ?array => $id === null ? null : $albums->get($id), $validated['slots']),
        ]);

        return back();
    }
}
