<?php
// test-file-status.php - Simple file check without Laravel bootstrap

$historyId = 116;
$compressedPath = 'compressed/1749910831_IMG-20250220-WA0010.jpg';

// Storage path
$storagePath = __DIR__ . '/storage/app/public/' . $compressedPath;

echo "=== FILE STATUS CHECK ===\n";
echo "History ID: $historyId\n";
echo "Compressed Path: $compressedPath\n";
echo "Full Path: $storagePath\n\n";

if (file_exists($storagePath)) {
    echo "✅ File EXISTS!\n";
    echo "Size: " . number_format(filesize($storagePath)) . " bytes\n";
    
    // Read first bytes
    $handle = fopen($storagePath, 'rb');
    $header = fread($handle, 4);
    fclose($handle);
    
    echo "First 4 bytes (hex): " . bin2hex($header) . "\n";
    
    if (substr($header, 0, 2) === "\xFF\xD8") {
        echo "✅ Valid JPEG header!\n";
    }
} else {
    echo "❌ File NOT FOUND!\n";
}

echo "\n=== EXPECTED DOWNLOAD URL ===\n";
echo "URL: http://kompresin.test/download/compressed/$historyId\n";
echo "Expected: File download with " . (file_exists($storagePath) ? filesize($storagePath) : 0) . " bytes\n";
