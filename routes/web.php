<?php

use App\Http\Controllers\MusicAccountController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => to_route(auth()->check() ? 'wallet' : 'login'))->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('wallet', [WalletController::class, 'show'])->name('wallet');
    Route::put('wallet', [WalletController::class, 'update'])->name('wallet.update');

    Route::get('music/connect', [MusicAccountController::class, 'redirect'])->name('music.connect');
    Route::get('spotify/callback', [MusicAccountController::class, 'callback'])->name('music.callback');
    Route::get('music/token', [MusicAccountController::class, 'token'])->name('music.token');
});

require __DIR__.'/settings.php';
