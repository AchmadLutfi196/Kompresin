<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\HuffmanCompressionService;
use Illuminate\Support\Facades\Storage;

$compressionService = new HuffmanCompressionService();

echo "Testing backward compatibility with old compressed files...\n\n";

// Get old compressed files
$compressedFiles = Storage::disk('public')->files('compressed');

foreach ($compressedFiles as $file) {
    $filename = basename($file);
    echo "Testing old file: $filename\n";
    
    try {
        $loadedData = $compressionService->loadCompressedFile($file);
        
        if ($loadedData) {
            echo "  ✅ File loaded successfully\n";
            echo "  Metadata: {$loadedData['metadata']['width']}x{$loadedData['metadata']['height']} {$loadedData['metadata']['type']}\n";
            
            // Calculate expected pixel data size
            $expectedSize = $loadedData['metadata']['width'] * $loadedData['metadata']['height'];
            $actualSize = strlen($loadedData['encoded_data']);
            
            // Decompress data to check format
            $pixelData = gzuncompress($loadedData['encoded_data']);
            if ($pixelData !== false) {
                $pixelDataSize = strlen($pixelData);
                echo "  Compressed size: $actualSize bytes\n";
                echo "  Decompressed pixel data: $pixelDataSize bytes\n";
                echo "  Expected for grayscale: {$expectedSize} bytes\n";
                echo "  Expected for RGB: " . ($expectedSize * 3) . " bytes\n";
                
                if ($pixelDataSize == $expectedSize) {
                    echo "  📊 This is a GRAYSCALE file (1 byte per pixel)\n";
                } elseif ($pixelDataSize == $expectedSize * 3) {
                    echo "  🌈 This is a RGB file (3 bytes per pixel)\n";
                } else {
                    echo "  ❓ Unknown pixel format ($pixelDataSize bytes)\n";
                }
            } else {
                echo "  ❌ Failed to decompress pixel data\n";
            }
        } else {
            echo "  ❌ Failed to load file\n";
        }
        
    } catch (Exception $e) {
        echo "  ❌ Error: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
}

?>