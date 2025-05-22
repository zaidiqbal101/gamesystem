<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\LuckyDrawController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/wallet-amount', [WalletController::class, 'getWalletAmount']);
Route::post('/lucky-draw/spin', [LuckyDrawController::class, 'spin']);