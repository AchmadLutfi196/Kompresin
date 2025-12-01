<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Get latest history
$history = App\Models\CompressionHistory::latest()->first();
echo 'History ID: ' . $history->id . PHP_EOL;
echo 'Compressed Path: ' . $history->compressed_path . PHP_EOL;

// Simulating controller logic
$path = $history->compressed_path;
if (str_starts_with($path, 'public/')) {
    $actualPath = substr($path, 7);
    $fullPath = storage_path('app/public/' . $actualPath);
} else {
    $fullPath = storage_path('app/' . $path);
}

echo 'Full path: ' . $fullPath . PHP_EOL;
echo 'Exists: ' . (file_exists($fullPath) ? 'YES' : 'NO') . PHP_EOL;
if (file_exists($fullPath)) {
    echo 'Size: ' . number_format(filesize($fullPath)) . ' bytes' . PHP_EOL;
    echo 'Header: ' . bin2hex(file_get_contents($fullPath, false, null, 0, 4)) . PHP_EOL;
}

// Test via route URL
echo PHP_EOL . "Download URL: /download/compressed/{$history->id}" . PHP_EOL;
