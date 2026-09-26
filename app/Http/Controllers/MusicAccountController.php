<?php

namespace App\Http\Controllers;

use App\Facades\Music;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;

class MusicAccountController extends Controller
{
    /**
     * Send the user to the music provider to authorize the app.
     */
    public function redirect(): SymfonyRedirectResponse
    {
        return Music::redirect();
    }

    /**
     * Handle the provider's authorization callback.
     */
    public function callback(Request $request): RedirectResponse
    {
        if ($request->missing('code')) {
            return to_route('wallet')->withErrors([
                'music' => 'Spotify authorization failed: '.$request->string('error', 'no authorization code returned'),
            ]);
        }

        Music::connect($request->user());

        return to_route('wallet');
    }

    /**
     * Return a fresh access token for the in-browser player.
     */
    public function token(Request $request): JsonResponse
    {
        return response()->json(['access_token' => Music::accessToken($request->user())]);
    }
}
