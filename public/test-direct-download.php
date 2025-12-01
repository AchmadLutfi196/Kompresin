<?php
/**
 * Direct file download test - bypassing auth
 * Access via: http://localhost/Kompresin/public/test-direct-download.php?id=115
 */

require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CompressionHistory;
use Illuminate\Support\Facades\Storage;

$id = $_GET['id'] ?? 115;

try {
    $history = CompressionHistory::findOrFail($id);
    
    // Get full path
    $path = $history->compressed_path;
    if (str_starts_with($path, 'public/')) {
        $actualPath = substr($path, 7);
        $fullPath = Storage::disk('public')->path($actualPath);
    } else {
        $fullPath = Storage::path($path);
    }
    
    if (!file_exists($fullPath)) {
        http_response_code(404);
        die("File not found: $fullPath");
    }
    
    $fileSize = filesize($fullPath);
    $filename = pathinfo($path, PATHINFO_BASENAME);
    $mimeType = mime_content_type($fullPath);
    
    // Send headers
    header('Content-Type: ' . $mimeType);
    header('Content-Length: ' . $fileSize);
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    // Output file
    readfile($fullPath);
    exit;
    
} catch (Exception $e) {
    http_response_code(500);
    die("Error: " . $e->getMessage());
}
