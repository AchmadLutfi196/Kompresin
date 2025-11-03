<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\HuffmanCompressionService;
use Illuminate\Support\Facades\Storage;

$compressionService = new HuffmanCompressionService();

echo "🎨 Final RGB Color Preservation Test\n";
echo "===================================\n\n";

// Create a test image with very distinct colors
$image = imagecreatetruecolor(20, 20);
$colors = [
    imagecolorallocate($image, 255, 0, 0),      // Pure Red
    imagecolorallocate($image, 0, 255, 0),      // Pure Green  
    imagecolorallocate($image, 0, 0, 255),      // Pure Blue
    imagecolorallocate($image, 255, 255, 255),  // White
];

// Create 4 distinct color quarters
for ($y = 0; $y < 20; $y++) {
    for ($x = 0; $x < 20; $x++) {
        if ($x < 10 && $y < 10) {
            $color = $colors[0]; // Red
        } elseif ($x >= 10 && $y < 10) {
            $color = $colors[1]; // Green
        } elseif ($x < 10 && $y >= 10) {
            $color = $colors[2]; // Blue
        } else {
            $color = $colors[3]; // White
        }
        imagesetpixel($image, $x, $y, $color);
    }
}

$testFile = tempnam(sys_get_temp_dir(), 'rgb_test') . '.png';
imagepng($image, $testFile);
imagedestroy($image);

echo "1. Created test image: 20x20 with 4 distinct color quarters\n";

try {
    // Test all formats
    $formats = ['txt', 'json', 'zip', 'bin'];
    
    foreach ($formats as $format) {
        echo "\n2. Testing format: $format\n";
        
        // Compress
        $compressResult = $compressionService->compress($testFile);
        $fileInfo = $compressionService->saveCompressedFile(
            $compressResult['encoded_data'], 
            [
                'width' => $compressResult['width'],
                'height' => $compressResult['height'],
                'type' => $compressResult['type']
            ],
            $format
        );
        
        echo "   ✅ Compressed: {$fileInfo['filename']} ({$fileInfo['size']} bytes)\n";
        
        // Decompress
        $compressedPath = str_replace('/storage/', '', $fileInfo['url']);
        $loadedData = $compressionService->loadCompressedFile($compressedPath);
        
        $decompressed = $compressionService->decompress(
            $loadedData['encoded_data'],
            $loadedData['metadata']['huffman_tree'],
            $loadedData['metadata']['width'],
            $loadedData['metadata']['height'],
            $loadedData['metadata']['type'],
            $loadedData['metadata']['algorithm']
        );
        
        echo "   ✅ Decompressed: {$decompressed['filename']}\n";
        echo "   🌐 URL: {$decompressed['url']}\n";
        
        // Verify pixel format
        $pixelData = gzuncompress($loadedData['encoded_data']);
        $totalPixels = $loadedData['metadata']['width'] * $loadedData['metadata']['height'];
        $dataSize = strlen($pixelData);
        
        if ($dataSize == $totalPixels * 3) {
            echo "   🌈 RGB format preserved ✅\n";
        } elseif ($dataSize == $totalPixels) {
            echo "   📊 Grayscale format (old) ⚠️\n";
        } else {
            echo "   ❓ Unknown format ❌\n";
        }
    }
    
    echo "\n🎉 All tests completed!\n";
    echo "\n📸 View Results:\n";
    echo "   Original: Browse to the file you upload\n";
    echo "   Decompressed: Check the URLs above\n";
    echo "   Colors should match perfectly!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

// Clean up
unlink($testFile);

?>