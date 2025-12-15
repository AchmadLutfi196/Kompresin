<?php
/**
 * Decompression Testing Script
 * Tests that compressed images can be decompressed back to valid images
 */

require_once __DIR__ . '/vendor/autoload.php';

use App\Services\ImageCompressionService;
use Illuminate\Support\Facades\Storage;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$compressionService = new ImageCompressionService();

$datasetPath = __DIR__ . '/Dataset';
$outputPath = __DIR__ . '/storage/app/public/decompression_test';

// Create output directory
if (!is_dir($outputPath)) {
    mkdir($outputPath, 0755, true);
}

$categories = ['logo', 'Manusia', 'Pemandangan_alam', 'Warna'];
$results = [];

echo "╔══════════════════════════════════════════════════════════════════════════════════════════╗\n";
echo "║                    DECOMPRESSION TEST - JPEG QUALITY REDUCTION                            ║\n";
echo "╚══════════════════════════════════════════════════════════════════════════════════════════╝\n\n";

$totalTests = 0;
$successCount = 0;
$failCount = 0;

foreach ($categories as $category) {
    $categoryPath = $datasetPath . '/' . $category;
    
    if (!is_dir($categoryPath)) {
        echo "⚠️  Category not found: $category\n";
        continue;
    }
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "📁 CATEGORY: " . strtoupper($category) . "\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    $files = glob($categoryPath . '/*.*');
    
    // Test only first 2 files per category to keep test quick
    $testFiles = array_slice($files, 0, 2);
    
    foreach ($testFiles as $file) {
        $filename = basename($file);
        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        
        // Skip non-image files
        if (!in_array($extension, ['jpg', 'jpeg', 'png', 'bmp'])) {
            continue;
        }
        
        $totalTests++;
        echo "🔄 Testing: $filename\n";
        
        try {
            // Step 1: Compress
            echo "   1️⃣  Compressing...\n";
            $compressResult = $compressionService->compress($file, 'jpg', 75);
            
            $compressedData = $compressResult['encoded_data'];
            $width = $compressResult['width'];
            $height = $compressResult['height'];
            $quality = $compressResult['quality_level'];
            
            echo "      ✓ Compressed: " . formatBytes(strlen($compressedData)) . "\n";
            echo "      ✓ Dimensions: {$width}x{$height}\n";
            
            // Step 2: Save as BIN format (internal format)
            echo "   2️⃣  Saving as BIN format...\n";
            $metadata = [
                'width' => $width,
                'height' => $height,
                'quality' => $quality,
            ];
            $savedResult = $compressionService->saveCompressedFile($compressedData, $metadata, 'bin');
            
            // Get proper path - use Storage relative path
            $binPath = Storage::disk('public')->path('compressed/' . $savedResult['filename']);
            $storagePath = 'compressed/' . $savedResult['filename'];
            
            if (file_exists($binPath)) {
                echo "      ✓ BIN saved: " . formatBytes(filesize($binPath)) . "\n";
            } else {
                throw new Exception("BIN file not created at: $binPath");
            }
            
            // Step 3: Load from BIN format - use relative path for loadCompressedFile
            echo "   3️⃣  Loading from BIN format...\n";
            $loadedData = $compressionService->loadCompressedFile($storagePath);
            
            if (!$loadedData || empty($loadedData['encoded_data'])) {
                throw new Exception("Failed to load BIN file");
            }
            $loadedWidth = $loadedData['metadata']['width'];
            $loadedHeight = $loadedData['metadata']['height'];
            echo "      ✓ Loaded: " . formatBytes(strlen($loadedData['encoded_data'])) . "\n";
            
            // Step 4: Decompress to image - for JPEG, the encoded_data IS the image
            echo "   4️⃣  Decompressing to image...\n";
            $outputImagePath = $outputPath . '/' . pathinfo($filename, PATHINFO_FILENAME) . '_restored.jpg';
            
            // Since JPEG Quality Reduction produces JPEG data directly,
            // we can simply write the encoded data to a file
            file_put_contents($outputImagePath, $loadedData['encoded_data']);
            
            if (file_exists($outputImagePath) && filesize($outputImagePath) > 0) {
                echo "      ✓ Restored: " . formatBytes(filesize($outputImagePath)) . "\n";
                
                // Verify the image is valid
                $imageInfo = @getimagesize($outputImagePath);
                if ($imageInfo) {
                    echo "      ✓ Valid image: {$imageInfo[0]}x{$imageInfo[1]} ({$imageInfo['mime']})\n";
                    echo "   ✅ SUCCESS\n\n";
                    $successCount++;
                } else {
                    throw new Exception("Restored file is not a valid image");
                }
            } else {
                throw new Exception("Restored image not created or empty");
            }
            
            // Cleanup test files
            @unlink($binPath);
            @unlink($outputImagePath);
            
        } catch (\Exception $e) {
            echo "   ❌ FAILED: " . $e->getMessage() . "\n\n";
            $failCount++;
        }
    }
}

// Summary
echo "\n╔══════════════════════════════════════════════════════════════════════════════════════════╗\n";
echo "║                                    TEST SUMMARY                                           ║\n";
echo "╚══════════════════════════════════════════════════════════════════════════════════════════╝\n\n";

echo "📊 Decompression Test Results:\n";
echo "─────────────────────────────────────────────────────\n";
echo "Total tests:    $totalTests\n";
echo "Successful:     $successCount ✅\n";
echo "Failed:         $failCount ❌\n";
echo "Success rate:   " . ($totalTests > 0 ? round(($successCount / $totalTests) * 100, 2) : 0) . "%\n\n";

if ($failCount == 0) {
    echo "🎉 All decompression tests passed!\n";
    echo "   → Compressed files can be successfully restored to valid images.\n";
} else {
    echo "⚠️  Some tests failed. Please check the error messages above.\n";
}

function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= pow(1024, $pow);
    return round($bytes, $precision) . ' ' . $units[$pow];
}
