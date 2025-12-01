<?php
/**
 * Debug file serving
 */

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CompressionHistory;
use App\Services\FileEncryptionService;
use Illuminate\Support\Facades\Storage;

$history = CompressionHistory::latest()->first();

if (!$history) {
    echo "No compression history found\n";
    exit;
}

echo "=== Debug File Serving ===\n\n";
echo "History ID: {$history->id}\n";
echo "Compressed Path: {$history->compressed_path}\n";
echo "Compressed Size in DB: {$history->compressed_size} bytes\n\n";

// Check isEncrypted
$encService = new FileEncryptionService();
$isEncrypted = $encService->isEncrypted($history->compressed_path);
echo "Is Encrypted (ends with .enc): " . ($isEncrypted ? 'YES' : 'NO') . "\n\n";

// Get full path using the same logic as controller
if (str_starts_with($history->compressed_path, 'public/')) {
    $disk = 'public';
    $actualPath = substr($history->compressed_path, 7);
} else {
    $disk = 'local';
    $actualPath = $history->compressed_path;
}

echo "Disk: $disk\n";
echo "Actual Path: $actualPath\n";

$fullPath = Storage::disk($disk)->path($actualPath);
echo "Full Path: $fullPath\n";
echo "File Exists: " . (file_exists($fullPath) ? 'YES' : 'NO') . "\n";

if (file_exists($fullPath)) {
    $actualSize = filesize($fullPath);
    echo "Actual File Size: " . number_format($actualSize) . " bytes\n";
    
    $header = bin2hex(file_get_contents($fullPath, false, null, 0, 4));
    echo "Header (hex): $header\n";
    
    $isValidJpg = str_starts_with($header, 'ffd8');
    echo "Is Valid JPEG: " . ($isValidJpg ? 'YES' : 'NO') . "\n";
}

// Now test decryptFileForServing
echo "\n=== Testing decryptFileForServing ===\n";
try {
    $result = $encService->decryptFileForServing($history->compressed_path, $history->user_id);
    echo "Result: " . ($result ? $result : "NULL") . "\n";
    
    if ($result && file_exists($result)) {
        echo "Decrypted file exists: YES\n";
        echo "Decrypted file size: " . filesize($result) . " bytes\n";
        echo "Decrypted header: " . bin2hex(file_get_contents($result, false, null, 0, 4)) . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== Check what controller would do ===\n";
if ($isEncrypted) {
    echo "Controller would call decryptFileForServing() and serve temp file\n";
} else {
    echo "Controller would serve file directly from: $fullPath\n";
}
