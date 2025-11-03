<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\HuffmanCompressionService;
use Illuminate\Support\Facades\Storage;

// Create a simple 2x2 PNG image using GD
$image = imagecreatetruecolor(2, 2);
$red = imagecolorallocate($image, 255, 0, 0);
$green = imagecolorallocate($image, 0, 255, 0);
$blue = imagecolorallocate($image, 0, 0, 255);
$white = imagecolorallocate($image, 255, 255, 255);

imagesetpixel($image, 0, 0, $red);
imagesetpixel($image, 1, 0, $green);
imagesetpixel($image, 0, 1, $blue);
imagesetpixel($image, 1, 1, $white);

$tempFile = tempnam(sys_get_temp_dir(), 'test_image') . '.png';
imagepng($image, $tempFile);
imagedestroy($image);

echo "Created test image: " . basename($tempFile) . "\n";
echo "File size: " . filesize($tempFile) . " bytes\n\n";

$compressionService = new HuffmanCompressionService();

echo "Testing all format options...\n\n";

// Test each format
$formats = ['txt', 'json', 'zip', 'bin'];
foreach ($formats as $format) {
    echo "Testing format: $format\n";
    
    try {
        // First compress to get data and metadata
        $compressResult = $compressionService->compress($tempFile);
        
        // Then save with selected format
        $fileInfo = $compressionService->saveCompressedFile(
            $compressResult['encoded_data'], 
            [
                'width' => $compressResult['width'],
                'height' => $compressResult['height'],
                'type' => $compressResult['type']
            ],
            $format
        );
        
        echo "✅ Success!\n";
        echo "  Path: {$fileInfo['path']}\n";
        echo "  URL: {$fileInfo['url']}\n";
        echo "  Filename: {$fileInfo['filename']}\n";
        echo "  Size: {$fileInfo['size']} bytes\n";
        echo "  Format: {$fileInfo['format']}\n";
        
        // Check if file exists
        $publicPath = str_replace('/storage/', '', $fileInfo['url']);
        if (Storage::disk('public')->exists($publicPath)) {
            echo "  ✅ File exists in storage\n";
            echo "  Storage path: " . Storage::disk('public')->path($publicPath) . "\n";
        } else {
            echo "  ❌ File NOT found in storage\n";
        }
        
    } catch (Exception $e) {
        echo "❌ Error: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
}

// Clean up
unlink($tempFile);

// Check storage contents
echo "Final storage contents:\n";
$files = Storage::disk('public')->files('compressed');
if (empty($files)) {
    echo "  No files in compressed folder\n";
} else {
    foreach ($files as $file) {
        $size = Storage::disk('public')->size($file);
        echo "  - $file ($size bytes)\n";
    }
}

?>