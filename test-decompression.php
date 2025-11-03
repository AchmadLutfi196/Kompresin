<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\HuffmanCompressionService;
use Illuminate\Support\Facades\Storage;

$compressionService = new HuffmanCompressionService();

echo "Testing decompression with all formats...\n\n";

// Get list of compressed files
$compressedFiles = Storage::disk('public')->files('compressed');

foreach ($compressedFiles as $file) {
    $filename = basename($file);
    $extension = pathinfo($filename, PATHINFO_EXTENSION);
    
    echo "Testing file: $filename (.$extension)\n";
    
    try {
        // Load compressed file
        $loadedData = $compressionService->loadCompressedFile($file);
        
        if ($loadedData) {
            echo "  ✅ File loaded successfully\n";
            echo "  Metadata: {$loadedData['metadata']['width']}x{$loadedData['metadata']['height']} {$loadedData['metadata']['type']}\n";
            echo "  Algorithm: {$loadedData['metadata']['algorithm']}\n";
            
            // Decompress
            $decompressed = $compressionService->decompress(
                $loadedData['encoded_data'],
                $loadedData['metadata']['huffman_tree'],
                $loadedData['metadata']['width'],
                $loadedData['metadata']['height'],
                $loadedData['metadata']['type'],
                $loadedData['metadata']['algorithm']
            );
            
            echo "  ✅ Decompression successful\n";
            echo "  Decompressed file: {$decompressed['filename']}\n";
            echo "  Path: {$decompressed['path']}\n";
            echo "  URL: {$decompressed['url']}\n";
            echo "  Time: " . round($decompressed['decompression_time'], 4) . "s\n";
            
            // Check if decompressed file exists
            $decompressedPath = str_replace('public/', '', $decompressed['path']);
            if (Storage::disk('public')->exists($decompressedPath)) {
                $size = Storage::disk('public')->size($decompressedPath);
                echo "  ✅ File exists in storage ($size bytes)\n";
            } else {
                echo "  ❌ File NOT found in storage\n";
            }
            
        } else {
            echo "  ❌ Failed to load compressed file\n";
        }
        
    } catch (Exception $e) {
        echo "  ❌ Error: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
}

// Check decompressed files directory
echo "Decompressed files:\n";
$decompressedFiles = Storage::disk('public')->files('decompressed');
if (empty($decompressedFiles)) {
    echo "  No files in decompressed folder\n";
} else {
    foreach ($decompressedFiles as $file) {
        $size = Storage::disk('public')->size($file);
        echo "  - $file ($size bytes)\n";
    }
}

?>