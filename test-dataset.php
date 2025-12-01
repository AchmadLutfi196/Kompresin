<?php
/**
 * Dataset Compression Testing Script
 * Tests JPEG Quality Reduction compression on various image types
 */

require_once __DIR__ . '/vendor/autoload.php';

use App\Services\ImageCompressionService;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$compressionService = new ImageCompressionService();

$datasetPath = __DIR__ . '/Dataset';
$outputPath = __DIR__ . '/storage/app/public/test_results';

// Create output directory
if (!is_dir($outputPath)) {
    mkdir($outputPath, 0755, true);
}

$categories = ['logo', 'Manusia', 'Pemandangan_alam', 'Warna'];
$results = [];
$totalOriginal = 0;
$totalCompressed = 0;

echo "╔══════════════════════════════════════════════════════════════════════════════════════════╗\n";
echo "║                    DATASET COMPRESSION TEST - JPEG QUALITY REDUCTION                      ║\n";
echo "╚══════════════════════════════════════════════════════════════════════════════════════════╝\n\n";

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
    $categoryResults = [];
    
    foreach ($files as $file) {
        $filename = basename($file);
        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        
        // Skip non-image files
        if (!in_array($extension, ['jpg', 'jpeg', 'png', 'bmp'])) {
            continue;
        }
        
        $originalSize = filesize($file);
        $totalOriginal += $originalSize;
        
        echo "📷 Processing: $filename\n";
        
        try {
            $startTime = microtime(true);
            
            // Compress the image
            $result = $compressionService->compress($file, 'jpg', 75);
            
            $endTime = microtime(true);
            $compressionTime = round(($endTime - $startTime) * 1000, 2);
            
            $compressedSize = $result['compressed_size'];
            $totalCompressed += $compressedSize;
            
            // Calculate metrics
            $ratio = round((1 - ($compressedSize / $originalSize)) * 100, 2);
            $savings = $originalSize - $compressedSize;
            
            // Determine status
            if ($ratio > 0) {
                $status = "✅ REDUCED";
                $statusColor = "\033[32m"; // Green
            } elseif ($ratio == 0) {
                $status = "➖ SAME";
                $statusColor = "\033[33m"; // Yellow
            } else {
                $status = "⚠️  LARGER";
                $statusColor = "\033[31m"; // Red
            }
            
            $categoryResults[] = [
                'filename' => $filename,
                'original_size' => $originalSize,
                'compressed_size' => $compressedSize,
                'ratio' => $ratio,
                'time' => $compressionTime,
                'width' => $result['width'],
                'height' => $result['height'],
                'status' => $status,
            ];
            
            // Format sizes
            $origFormatted = formatBytes($originalSize);
            $compFormatted = formatBytes($compressedSize);
            $savingsFormatted = formatBytes(abs($savings));
            
            echo "   Original:   $origFormatted\n";
            echo "   Compressed: $compFormatted\n";
            echo "   Ratio:      {$ratio}% " . ($ratio > 0 ? "(saved $savingsFormatted)" : ($ratio < 0 ? "(increased $savingsFormatted)" : "")) . "\n";
            echo "   Dimensions: {$result['width']}x{$result['height']}\n";
            echo "   Time:       {$compressionTime}ms\n";
            echo "   Status:     $status\n\n";
            
        } catch (\Exception $e) {
            echo "   ❌ ERROR: " . $e->getMessage() . "\n\n";
            $categoryResults[] = [
                'filename' => $filename,
                'original_size' => $originalSize,
                'compressed_size' => 0,
                'ratio' => 0,
                'time' => 0,
                'width' => 0,
                'height' => 0,
                'status' => '❌ ERROR',
                'error' => $e->getMessage(),
            ];
        }
    }
    
    $results[$category] = $categoryResults;
    
    // Category summary
    if (count($categoryResults) > 0) {
        $avgRatio = round(array_sum(array_column($categoryResults, 'ratio')) / count($categoryResults), 2);
        $catOriginal = array_sum(array_column($categoryResults, 'original_size'));
        $catCompressed = array_sum(array_column($categoryResults, 'compressed_size'));
        $catSavings = $catOriginal - $catCompressed;
        
        echo "   📊 Category Summary:\n";
        echo "   ─────────────────────────────────────────\n";
        echo "   Files processed: " . count($categoryResults) . "\n";
        echo "   Total original:  " . formatBytes($catOriginal) . "\n";
        echo "   Total compressed: " . formatBytes($catCompressed) . "\n";
        echo "   Total savings:   " . formatBytes(abs($catSavings)) . " (" . ($catSavings > 0 ? "reduced" : "increased") . ")\n";
        echo "   Average ratio:   {$avgRatio}%\n\n";
    }
}

// Final Summary
echo "\n╔══════════════════════════════════════════════════════════════════════════════════════════╗\n";
echo "║                                    FINAL SUMMARY                                          ║\n";
echo "╚══════════════════════════════════════════════════════════════════════════════════════════╝\n\n";

$totalFiles = 0;
$totalReduced = 0;
$totalLarger = 0;
$totalSame = 0;

foreach ($results as $category => $categoryResults) {
    foreach ($categoryResults as $r) {
        $totalFiles++;
        if ($r['ratio'] > 0) $totalReduced++;
        elseif ($r['ratio'] < 0) $totalLarger++;
        else $totalSame++;
    }
}

$overallRatio = $totalOriginal > 0 ? round((1 - ($totalCompressed / $totalOriginal)) * 100, 2) : 0;
$overallSavings = $totalOriginal - $totalCompressed;

echo "📈 Overall Statistics:\n";
echo "─────────────────────────────────────────────────────\n";
echo "Total files tested:     $totalFiles\n";
echo "Files reduced:          $totalReduced (✅)\n";
echo "Files larger:           $totalLarger (⚠️)\n";
echo "Files same:             $totalSame (➖)\n";
echo "\n";
echo "Total original size:    " . formatBytes($totalOriginal) . "\n";
echo "Total compressed size:  " . formatBytes($totalCompressed) . "\n";
echo "Total savings:          " . formatBytes(abs($overallSavings)) . " (" . ($overallSavings > 0 ? "reduced" : "increased") . ")\n";
echo "Overall compression:    {$overallRatio}%\n";
echo "\n";

// Per-category table
echo "📊 Per-Category Results:\n";
echo "─────────────────────────────────────────────────────────────────────────────\n";
echo sprintf("%-20s %10s %10s %10s %10s\n", "Category", "Files", "Original", "Compressed", "Ratio");
echo "─────────────────────────────────────────────────────────────────────────────\n";

foreach ($results as $category => $categoryResults) {
    $catOriginal = array_sum(array_column($categoryResults, 'original_size'));
    $catCompressed = array_sum(array_column($categoryResults, 'compressed_size'));
    $catRatio = $catOriginal > 0 ? round((1 - ($catCompressed / $catOriginal)) * 100, 2) : 0;
    
    echo sprintf("%-20s %10d %10s %10s %9s%%\n", 
        $category, 
        count($categoryResults),
        formatBytes($catOriginal),
        formatBytes($catCompressed),
        $catRatio
    );
}

echo "─────────────────────────────────────────────────────────────────────────────\n";
echo sprintf("%-20s %10d %10s %10s %9s%%\n", 
    "TOTAL", 
    $totalFiles,
    formatBytes($totalOriginal),
    formatBytes($totalCompressed),
    $overallRatio
);

echo "\n✅ Testing complete!\n";

function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= pow(1024, $pow);
    return round($bytes, $precision) . ' ' . $units[$pow];
}
