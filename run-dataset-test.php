<?php
/**
 * Script untuk menguji kompresi gambar pada seluruh dataset
 * dan menghasilkan laporan hasil pengujian
 */

require_once __DIR__ . '/vendor/autoload.php';

// Boot Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\ImageCompressionService;

$service = new ImageCompressionService();

$datasetPath = __DIR__ . '/Dataset';
$categories = [
    'Logo' => 'logo',
    'Manusia' => 'Manusia', 
    'Pemandangan Alam' => 'Pemandangan_alam',
    'Warna Solid' => 'Warna'
];

$results = [];
$totalOriginal = 0;
$totalCompressed = 0;
$successCount = 0;
$failCount = 0;

echo "===========================================\n";
echo "  PENGUJIAN KOMPRESI DATASET KOMPRESIN\n";
echo "  Quality: 60 (Medium)\n";
echo "  Date: " . date('Y-m-d H:i:s') . "\n";
echo "===========================================\n\n";

foreach ($categories as $categoryName => $folder) {
    $categoryPath = $datasetPath . '/' . $folder;
    $files = glob($categoryPath . '/*.*');
    
    echo "📁 Kategori: {$categoryName}\n";
    echo str_repeat('-', 80) . "\n";
    
    $categoryResults = [
        'name' => $categoryName,
        'folder' => $folder,
        'files' => [],
        'total_original' => 0,
        'total_compressed' => 0,
        'success_count' => 0,
        'fail_count' => 0
    ];
    
    foreach ($files as $file) {
        $filename = basename($file);
        $originalSize = filesize($file);
        
        echo "  📄 {$filename}\n";
        echo "     Original: " . formatBytes($originalSize) . "\n";
        
        try {
            // Lakukan kompresi dengan quality 60 (medium)
            $result = $service->compress($file, 60);
            
            $compressedSize = $result['compressed_size'];
            $ratio = $result['compression_ratio'];
            $width = $result['width'];
            $height = $result['height'];
            $bpp = $result['bits_per_pixel'];
            $time = $result['compression_time'] * 1000; // ms
            
            echo "     Compressed: " . formatBytes($compressedSize) . "\n";
            echo "     Dimensions: {$width}x{$height}\n";
            echo "     Ratio: " . number_format($ratio, 2) . "%\n";
            echo "     BPP: " . number_format($bpp, 4) . "\n";
            echo "     Time: " . number_format($time, 2) . " ms\n";
            
            $status = $ratio > 0 ? 'Berkurang' : 'Lebih Besar';
            echo "     Status: {$status}\n";
            
            $categoryResults['files'][] = [
                'filename' => $filename,
                'original_size' => $originalSize,
                'compressed_size' => $compressedSize,
                'width' => $width,
                'height' => $height,
                'ratio' => $ratio,
                'bpp' => $bpp,
                'time' => $time,
                'status' => $status
            ];
            
            $categoryResults['total_original'] += $originalSize;
            $categoryResults['total_compressed'] += $compressedSize;
            
            if ($ratio > 0) {
                $categoryResults['success_count']++;
                $successCount++;
            } else {
                $categoryResults['fail_count']++;
                $failCount++;
            }
            
            $totalOriginal += $originalSize;
            $totalCompressed += $compressedSize;
            
        } catch (Exception $e) {
            echo "     ERROR: " . $e->getMessage() . "\n";
            $categoryResults['fail_count']++;
            $failCount++;
        }
        
        echo "\n";
    }
    
    // Hitung rata-rata kategori
    if (count($categoryResults['files']) > 0) {
        $avgRatio = 0;
        foreach ($categoryResults['files'] as $f) {
            $avgRatio += $f['ratio'];
        }
        $categoryResults['avg_ratio'] = $avgRatio / count($categoryResults['files']);
        $categoryResults['category_ratio'] = (1 - ($categoryResults['total_compressed'] / $categoryResults['total_original'])) * 100;
    }
    
    $results[] = $categoryResults;
    
    echo "  📊 Subtotal {$categoryName}:\n";
    echo "     Original: " . formatBytes($categoryResults['total_original']) . "\n";
    echo "     Compressed: " . formatBytes($categoryResults['total_compressed']) . "\n";
    echo "     Category Ratio: " . number_format($categoryResults['category_ratio'] ?? 0, 2) . "%\n";
    echo "\n";
}

// Summary
echo "===========================================\n";
echo "  RINGKASAN HASIL PENGUJIAN\n";
echo "===========================================\n\n";

$overallRatio = (1 - ($totalCompressed / $totalOriginal)) * 100;
$totalFiles = $successCount + $failCount;

echo "Total Files: {$totalFiles}\n";
echo "Berhasil Dikompres (rasio > 0): {$successCount} (" . number_format(($successCount/$totalFiles)*100, 2) . "%)\n";
echo "Menjadi Lebih Besar (rasio <= 0): {$failCount} (" . number_format(($failCount/$totalFiles)*100, 2) . "%)\n";
echo "\n";
echo "Total Original: " . formatBytes($totalOriginal) . "\n";
echo "Total Compressed: " . formatBytes($totalCompressed) . "\n";
echo "Total Penghematan: " . formatBytes($totalOriginal - $totalCompressed) . "\n";
echo "Rasio Kompresi Keseluruhan: " . number_format($overallRatio, 2) . "%\n";

// Generate LaTeX table data
echo "\n\n===========================================\n";
echo "  DATA UNTUK LAPORAN LATEX\n";
echo "===========================================\n\n";

// Per kategori
echo "% Hasil Per Kategori\n";
foreach ($results as $cat) {
    $catRatio = isset($cat['category_ratio']) ? number_format($cat['category_ratio'], 2) : '0.00';
    echo "% {$cat['name']}: Original=" . formatBytes($cat['total_original']) . ", Compressed=" . formatBytes($cat['total_compressed']) . ", Ratio={$catRatio}%\n";
}

// Save JSON results
$jsonOutput = [
    'test_date' => date('Y-m-d H:i:s'),
    'quality' => 60,
    'categories' => $results,
    'summary' => [
        'total_files' => $totalFiles,
        'success_count' => $successCount,
        'fail_count' => $failCount,
        'total_original' => $totalOriginal,
        'total_compressed' => $totalCompressed,
        'total_savings' => $totalOriginal - $totalCompressed,
        'overall_ratio' => $overallRatio
    ]
];

file_put_contents(__DIR__ . '/dataset-test-results.json', json_encode($jsonOutput, JSON_PRETTY_PRINT));
echo "\n✅ Hasil disimpan ke dataset-test-results.json\n";

function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= pow(1024, $pow);
    return round($bytes, $precision) . ' ' . $units[$pow];
}
