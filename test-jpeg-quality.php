<?php
/**
 * Test JPEG Quality Reduction Compression
 * Run: php test-jpeg-quality.php
 */

require_once __DIR__ . '/vendor/autoload.php';

use App\Services\ImageCompressionService;

echo "=== Testing JPEG Quality Reduction ===\n\n";

$service = new ImageCompressionService();

// Create a test image
$testImage = __DIR__ . '/storage/app/test_image.jpg';
$testDir = __DIR__ . '/storage/app';

if (!is_dir($testDir)) {
    mkdir($testDir, 0755, true);
}

// Create a simple test image
$img = imagecreatetruecolor(200, 200);
$white = imagecolorallocate($img, 255, 255, 255);
$red = imagecolorallocate($img, 255, 0, 0);
$blue = imagecolorallocate($img, 0, 0, 255);

imagefill($img, 0, 0, $white);
imagefilledrectangle($img, 50, 50, 150, 150, $red);
imagefilledellipse($img, 100, 100, 50, 50, $blue);

imagejpeg($img, $testImage, 95);
imagedestroy($img);

echo "Created test image: $testImage\n";
echo "Original size: " . filesize($testImage) . " bytes\n\n";

// Test different quality levels
$qualityLevels = [10, 30, 50, 70, 90];

foreach ($qualityLevels as $quality) {
    echo "--- Testing Quality Level: $quality ---\n";
    
    try {
        $result = $service->compress($testImage, $quality);
        
        echo "Algorithm: {$result['algorithm']}\n";
        echo "Quality Level: {$result['quality_level']}\n";
        echo "Visual Quality: {$result['estimated_visual_quality']}\n";
        echo "Original Size: {$result['original_size']} bytes\n";
        echo "Compressed Size: {$result['compressed_size']} bytes\n";
        echo "Compression Ratio: " . round($result['compression_ratio'], 2) . "%\n";
        echo "Bits Per Pixel: " . round($result['bits_per_pixel'], 4) . "\n";
        echo "Compression Time: " . round($result['compression_time'] * 1000, 2) . "ms\n";
        echo "Description: {$result['description']}\n\n";
        
    } catch (Exception $e) {
        echo "ERROR: " . $e->getMessage() . "\n\n";
    }
}

// Clean up
unlink($testImage);

echo "=== Test Complete ===\n";
