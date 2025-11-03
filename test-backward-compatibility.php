<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\HuffmanCompressionService;
use Illuminate\Support\Facades\Storage;

$compressionService = new HuffmanCompressionService();

echo "Testing decompression with both old (grayscale) and new (RGB) files...\n\n";

// Test specific files
$testFiles = [
    'compressed/compressed_1762182631.txt', // Old grayscale file
    'compressed/compressed_1762183053.txt', // New RGB file
];

foreach ($testFiles as $file) {
    $filename = basename($file);
    echo "Testing: $filename\n";
    
    try {
        $loadedData = $compressionService->loadCompressedFile($file);
        
        if ($loadedData) {
            // Check pixel format
            $pixelData = gzuncompress($loadedData['encoded_data']);
            $totalPixels = $loadedData['metadata']['width'] * $loadedData['metadata']['height'];
            $dataSize = strlen($pixelData);
            
            if ($dataSize == $totalPixels) {
                echo "  📊 GRAYSCALE format (backward compatibility)\n";
            } elseif ($dataSize == $totalPixels * 3) {
                echo "  🌈 RGB format (new format)\n";
            } else {
                echo "  ❓ Unknown format\n";
            }
            
            // Decompress
            $decompressed = $compressionService->decompress(
                $loadedData['encoded_data'],
                $loadedData['metadata']['huffman_tree'],
                $loadedData['metadata']['width'],
                $loadedData['metadata']['height'],
                $loadedData['metadata']['type'],
                $loadedData['metadata']['algorithm']
            );
            
            echo "  ✅ Decompression successful!\n";
            echo "  File: {$decompressed['filename']}\n";
            echo "  URL: {$decompressed['url']}\n";
            
            // Check if file exists
            $decompressedPath = str_replace('public/', '', $decompressed['path']);
            if (Storage::disk('public')->exists($decompressedPath)) {
                $size = Storage::disk('public')->size($decompressedPath);
                echo "  ✅ File exists ($size bytes)\n";
            } else {
                echo "  ❌ File NOT found\n";
            }
        } else {
            echo "  ❌ Failed to load file\n";
        }
        
    } catch (Exception $e) {
        echo "  ❌ Error: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
}

echo "✨ Summary:\n";
echo "- Old compressed files (grayscale) should still decompress correctly\n";
echo "- New compressed files (RGB) should decompress with full colors\n";
echo "- Both formats are now supported with auto-detection!\n";

?>