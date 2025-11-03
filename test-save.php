<?php

use Illuminate\Support\Facades\Storage;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test save file dengan format berbeda
$testData = "This is test compressed data";
$metadata = [
    'width' => 100,
    'height' => 100,
    'type' => 'png',
];

echo "Testing file save functions...\n\n";

// Test TXT format
try {
    $filename = 'test_' . time() . '.txt';
    $path = 'public/compressed/' . $filename;
    
    $content = "KOMPRESIN TEST FILE\n";
    $content .= "==================\n";
    $content .= "Width: 100\n";
    $content .= "Height: 100\n";
    $content .= "Type: png\n";
    $content .= "==================\n";
    $content .= "DATA: " . base64_encode($testData);
    
    Storage::put($path, $content);
    
    echo "✅ TXT file saved: $filename\n";
    echo "   Path: " . Storage::path($path) . "\n";
    echo "   URL: " . Storage::url($path) . "\n";
    echo "   Size: " . strlen($content) . " bytes\n\n";
    
} catch (Exception $e) {
    echo "❌ TXT save failed: " . $e->getMessage() . "\n\n";
}

// Test JSON format
try {
    $filename = 'test_' . time() . '.json';
    $path = 'public/compressed/' . $filename;
    
    $jsonData = [
        'version' => '1.0',
        'algorithm' => 'TEST',
        'metadata' => $metadata,
        'data' => base64_encode($testData),
    ];
    
    $content = json_encode($jsonData, JSON_PRETTY_PRINT);
    Storage::put($path, $content);
    
    echo "✅ JSON file saved: $filename\n";
    echo "   Path: " . Storage::path($path) . "\n";
    echo "   URL: " . Storage::url($path) . "\n";
    echo "   Size: " . strlen($content) . " bytes\n\n";
    
} catch (Exception $e) {
    echo "❌ JSON save failed: " . $e->getMessage() . "\n\n";
}

// Check if files are accessible via URL
echo "Checking file accessibility...\n";
$files = Storage::files('public/compressed');
foreach ($files as $file) {
    if (strpos($file, 'test_') !== false) {
        echo "Found: $file\n";
        echo "URL: " . Storage::url($file) . "\n";
    }
}