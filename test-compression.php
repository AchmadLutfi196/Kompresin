<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Create a simple 10x10 test image
$testImage = imagecreatetruecolor(10, 10);
$white = imagecolorallocate($testImage, 255, 255, 255);
imagefill($testImage, 0, 0, $white);

$testPath = storage_path('app/test_image.png');
imagepng($testImage, $testPath);
imagedestroy($testImage);

echo "Test image created: $testPath\n";

// Test compression service
try {
    $service = app(\App\Services\HuffmanCompressionService::class);
    echo "Service instantiated OK\n";
    
    $result = $service->compress($testPath);
    echo "Compression OK!\n";
    echo "Original: " . $result['original_size'] . " bytes\n";
    echo "Compressed: " . $result['compressed_size'] . " bytes\n";
    echo "Ratio: " . $result['compression_ratio'] . "%\n";
    echo "Algorithm: " . $result['algorithm'] . "\n";
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "\nTrace:\n" . $e->getTraceAsString() . "\n";
}

// Cleanup
if (file_exists($testPath)) {
    unlink($testPath);
}
