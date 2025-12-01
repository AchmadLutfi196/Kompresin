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

// Public download routes (no auth required)
Route::get('/download/compressed/{id}', [CompressionController::class, 'downloadCompressedFile'])->name('download.compressed');
Route::get('/download/decompressed/{id}', [CompressionController::class, 'downloadDecompressedFile'])->name('download.decompressed');

// Public preview routes (inline display, no auth required)
Route::get('/preview/original/{id}', [CompressionController::class, 'previewOriginalFile'])->name('preview.original');
Route::get('/preview/compressed/{id}', [CompressionController::class, 'previewCompressedFile'])->name('preview.compressed');
Route::get('/preview/decompressed/{id}', [CompressionController::class, 'previewDecompressedFile'])->name('preview.decompressed');

// Secure file serving routes (requires auth)
Route::middleware(['auth'])->group(function () {
    Route::get('/secure/original/{id}', [CompressionController::class, 'serveOriginalFile'])->name('secure.original');
    Route::get('/secure/compressed/{id}', [CompressionController::class, 'serveCompressedFile'])->name('secure.compressed');
    Route::get('/secure/decompressed/{id}', [CompressionController::class, 'serveDecompressedFile'])->name('secure.decompressed');
});

// Admin Auth routes
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/login', [App\Http\Controllers\Auth\AdminAuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [App\Http\Controllers\Auth\AdminAuthController::class, 'login'])->name('login.submit');
    Route::post('/logout', [App\Http\Controllers\Auth\AdminAuthController::class, 'logout'])->name('logout');
});

// Protected Admin routes
Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
    Route::get('/', [App\Http\Controllers\Admin\AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/history', [App\Http\Controllers\Admin\AdminController::class, 'compressionHistory'])->name('history');
    Route::get('/files', [App\Http\Controllers\Admin\AdminController::class, 'fileManagement'])->name('files');
    Route::get('/settings', [App\Http\Controllers\Admin\AdminController::class, 'settings'])->name('settings');
    Route::delete('/history/{id}', [App\Http\Controllers\Admin\AdminController::class, 'deleteHistory'])->name('history.delete');
    // POST route performs the cleanup action. Also provide a safe GET that redirects back
    // to the admin files page to avoid MethodNotAllowed errors when someone visits the URL.
    Route::post('/cleanup', [App\Http\Controllers\Admin\AdminController::class, 'cleanupFiles'])->name('cleanup');
    Route::get('/cleanup', function () {
        return redirect()->route('admin.files');
    })->name('cleanup.get');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
