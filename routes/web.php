<?php

use App\Http\Controllers\LuckyDrawController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [LuckyDrawController::class, 'index'])->name('lucky-draw.index');
Route::post('/lucky-draw/spin', [LuckyDrawController::class, 'spin'])->name('lucky-draw.spin');
