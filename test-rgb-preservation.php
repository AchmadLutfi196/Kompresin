<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\HuffmanCompressionService;
use Illuminate\Support\Facades\Storage;

$compressionService = new HuffmanCompressionService();

$testImage = 'public/colorful-test-image.png';

echo "Testing RGB color preservation...\n\n";
echo "Original image: $testImage\n";
echo "Original size: " . filesize($testImage) . " bytes\n\n";

try {
    // Compress with TXT format
    $compressResult = $compressionService->compress($testImage);
    
    // Save compressed file
    $fileInfo = $compressionService->saveCompressedFile(
        $compressResult['encoded_data'], 
        [
            'width' => $compressResult['width'],
            'height' => $compressResult['height'],
            'type' => $compressResult['type']
        ],
        'txt'
    );
    
    echo "✅ Compression successful!\n";
    echo "  Compressed file: {$fileInfo['filename']}\n";
    echo "  Size: {$fileInfo['size']} bytes\n";
    echo "  Compression ratio: " . round($compressResult['compression_ratio'], 2) . "%\n\n";
    
    // Now decompress
    echo "Testing decompression...\n";
    
    $compressedPath = str_replace('/storage/', '', $fileInfo['url']);
    $loadedData = $compressionService->loadCompressedFile($compressedPath);
    
    if ($loadedData) {
        echo "✅ Compressed file loaded successfully\n";
        
        $decompressed = $compressionService->decompress(
            $loadedData['encoded_data'],
            $loadedData['metadata']['huffman_tree'],
            $loadedData['metadata']['width'],
            $loadedData['metadata']['height'],
            $loadedData['metadata']['type'],
            $loadedData['metadata']['algorithm']
        );
        
        echo "✅ Decompression successful!\n";
        echo "  Decompressed file: {$decompressed['filename']}\n";
        echo "  Path: {$decompressed['path']}\n";
        echo "  URL: {$decompressed['url']}\n";
        echo "  Decompression time: " . round($decompressed['decompression_time'], 4) . "s\n";
        
        // Check if file exists and get size
        $decompressedPath = str_replace('public/', '', $decompressed['path']);
        if (Storage::disk('public')->exists($decompressedPath)) {
            $size = Storage::disk('public')->size($decompressedPath);
            echo "  ✅ Decompressed file exists ($size bytes)\n";
            
            echo "\n🎨 Color Test Results:\n";
            echo "  Original: public/colorful-test-image.png\n";
            echo "  Decompressed: {$decompressed['url']}\n";
            echo "  \n";
            echo "  Open both images to compare colors!\n";
            echo "  If colors match, RGB preservation is working ✅\n";
            echo "  If image is grayscale, there's still an issue ❌\n";
            
        } else {
            echo "  ❌ Decompressed file NOT found in storage\n";
        }
        
    } else {
        echo "❌ Failed to load compressed file\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

?>