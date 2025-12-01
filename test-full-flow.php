<?php
/**
 * Test complete compression flow
 * Run: php test-full-flow.php
 */

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\ImageCompressionService;
use Illuminate\Support\Facades\Storage;

echo "=== Testing Full Compression Flow ===\n\n";

$compressionService = new ImageCompressionService();

// Create a test image
$testDir = storage_path('app/test');
if (!is_dir($testDir)) {
    mkdir($testDir, 0755, true);
}

$testImage = $testDir . '/test_image.jpg';

// Create a colorful test image
$img = imagecreatetruecolor(400, 300);
$white = imagecolorallocate($img, 255, 255, 255);
$red = imagecolorallocate($img, 255, 0, 0);
$green = imagecolorallocate($img, 0, 255, 0);
$blue = imagecolorallocate($img, 0, 0, 255);

imagefill($img, 0, 0, $white);
imagefilledrectangle($img, 50, 50, 150, 150, $red);
imagefilledrectangle($img, 150, 100, 250, 200, $green);
imagefilledellipse($img, 300, 150, 100, 100, $blue);

imagejpeg($img, $testImage, 95);
imagedestroy($img);

echo "✓ Created test image: " . basename($testImage) . "\n";
echo "  Original size: " . number_format(filesize($testImage)) . " bytes\n\n";

// Test compression
echo "--- Testing Compression ---\n";

try {
    $result = $compressionService->compress($testImage, 60);
    echo "✓ Compression successful\n";
    echo "  Algorithm: {$result['algorithm']}\n";
    echo "  Quality: {$result['quality']}\n";
    echo "  Compressed size: {$result['compressed_size']} bytes\n";
    echo "  Compression ratio: " . round($result['compression_ratio'], 2) . "%\n\n";
    
    // Save as JPG
    echo "--- Saving as JPG ---\n";
    $jpgFile = $compressionService->saveCompressedFile(
        $result['encoded_data'],
        [
            'width' => $result['width'],
            'height' => $result['height'],
            'type' => $result['type'],
            'quality' => $result['quality'],
            'algorithm' => $result['algorithm'],
        ],
        'jpg'
    );
    
    echo "✓ Saved as JPG: {$jpgFile['filename']}\n";
    echo "  Path: {$jpgFile['path']}\n";
    echo "  Size: " . number_format($jpgFile['size']) . " bytes\n";
    
    // Verify JPG file
    $jpgPath = Storage::disk('public')->path('compressed/' . $jpgFile['filename']);
    echo "\n--- Verifying JPG File ---\n";
    echo "  Full path: $jpgPath\n";
    echo "  Exists: " . (file_exists($jpgPath) ? 'YES' : 'NO') . "\n";
    
    if (file_exists($jpgPath)) {
        $header = bin2hex(file_get_contents($jpgPath, false, null, 0, 4));
        echo "  Header (hex): $header\n";
        
        $isValidJpg = substr($header, 0, 4) === 'ffd8';
        echo "  Valid JPEG: " . ($isValidJpg ? 'YES ✓' : 'NO ✗') . "\n";
        
        // Try to load with GD
        $testLoad = @imagecreatefromjpeg($jpgPath);
        echo "  GD can load: " . ($testLoad !== false ? 'YES ✓' : 'NO ✗') . "\n";
        if ($testLoad) imagedestroy($testLoad);
        
        // Get image info
        $info = @getimagesize($jpgPath);
        if ($info) {
            echo "  Dimensions: {$info[0]}x{$info[1]}\n";
            echo "  MIME: {$info['mime']}\n";
        }
    }
    
    // Save as BIN
    echo "\n--- Saving as BIN ---\n";
    $binFile = $compressionService->saveCompressedFile(
        $result['encoded_data'],
        [
            'width' => $result['width'],
            'height' => $result['height'],
            'type' => $result['type'],
            'quality' => $result['quality'],
            'algorithm' => $result['algorithm'],
        ],
        'bin'
    );
    
    echo "✓ Saved as BIN: {$binFile['filename']}\n";
    echo "  Size: " . number_format($binFile['size']) . " bytes\n";
    
    // Verify BIN file
    $binPath = Storage::disk('public')->path('compressed/' . $binFile['filename']);
    if (file_exists($binPath)) {
        $header = file_get_contents($binPath, false, null, 0, 8);
        echo "  Header: $header\n";
        echo "  Valid format: " . ($header === 'JPGCOMP1' ? 'YES ✓' : 'NO ✗') . "\n";
    }
    
    // Test decompression of BIN
    echo "\n--- Testing BIN Decompression ---\n";
    $loadedData = $compressionService->loadCompressedFile('public/compressed/' . $binFile['filename']);
    if ($loadedData) {
        echo "✓ BIN file loaded successfully\n";
        echo "  Width: {$loadedData['metadata']['width']}\n";
        echo "  Height: {$loadedData['metadata']['height']}\n";
        echo "  Data size: " . strlen($loadedData['encoded_data']) . " bytes\n";
        
        // Verify the data is valid JPEG
        $dataHeader = bin2hex(substr($loadedData['encoded_data'], 0, 4));
        echo "  JPEG header: $dataHeader\n";
        echo "  Valid JPEG data: " . (substr($dataHeader, 0, 4) === 'ffd8' ? 'YES ✓' : 'NO ✗') . "\n";
    }
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

// Clean up
unlink($testImage);
echo "\n=== Test Complete ===\n";
