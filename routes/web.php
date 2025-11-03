<?php

use App\Http\Controllers\CompressionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

// Compression routes
Route::get('/compress', [CompressionController::class, 'index'])->name('compress');
Route::post('/compress', [CompressionController::class, 'compress'])->name('compress.process');
Route::post('/compress/compare', [CompressionController::class, 'getComparison'])->name('compress.compare');

// Decompression routes
Route::get('/decompress', [CompressionController::class, 'decompressPage'])->name('decompress');
Route::post('/decompress', [CompressionController::class, 'decompress'])->name('decompress.process');

// History routes
Route::get('/history', [CompressionController::class, 'history'])->name('history');
Route::delete('/history/{id}', [CompressionController::class, 'deleteHistory'])->name('history.delete');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
