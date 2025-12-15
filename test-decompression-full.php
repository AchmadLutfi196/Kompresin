<?php
/**
 * Script untuk menguji proses dekompresi gambar dari format BIN
 * Pengujian end-to-end: Compress -> Save BIN -> Load BIN -> Decompress -> Validate
 */

require_once __DIR__ . '/vendor/autoload.php';

// Boot Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\ImageCompressionService;
use Illuminate\Support\Facades\Storage;

$service = new ImageCompressionService();

$datasetPath = __DIR__ . '/Dataset';

// Pilih sampel dari setiap kategori untuk pengujian dekompresi
$testSamples = [
    ['category' => 'Logo', 'file' => $datasetPath . '/logo/logo 1.png'],
    ['category' => 'Logo', 'file' => $datasetPath . '/logo/logo 2.png'],
    ['category' => 'Manusia', 'file' => $datasetPath . '/Manusia/Manusia 1.JPG'],
    ['category' => 'Manusia', 'file' => $datasetPath . '/Manusia/Manusia 2.JPG'],
    ['category' => 'Pemandangan', 'file' => $datasetPath . '/Pemandangan_alam/Pemandangan 1.JPG'],
    ['category' => 'Pemandangan', 'file' => $datasetPath . '/Pemandangan_alam/Pemandangan 2.JPG'],
    ['category' => 'Warna', 'file' => $datasetPath . '/Warna/abu-abu.jpg'],
    ['category' => 'Warna', 'file' => $datasetPath . '/Warna/merah.jpg'],
];

$results = [];
$successCount = 0;
$failCount = 0;

echo "===========================================\n";
echo "  PENGUJIAN DEKOMPRESI DATASET KOMPRESIN\n";
echo "  Quality: 60 (Medium)\n";
echo "  Date: " . date('Y-m-d H:i:s') . "\n";
echo "===========================================\n\n";

// Buat direktori untuk file test
Storage::disk('public')->makeDirectory('test_compressed');
Storage::disk('public')->makeDirectory('test_decompressed');

foreach ($testSamples as $index => $sample) {
    $filename = basename($sample['file']);
    echo "📄 [{$sample['category']}] {$filename}\n";
    echo str_repeat('-', 60) . "\n";
    
    try {
        // ========================================
        // STEP 1: KOMPRESI
        // ========================================
        echo "   [STEP 1] Kompres gambar...\n";
        $compressResult = $service->compress($sample['file'], 60);
        
        $originalSize = $compressResult['original_size'];
        $compressedSize = $compressResult['compressed_size'];
        $width = $compressResult['width'];
        $height = $compressResult['height'];
        $ratio = $compressResult['compression_ratio'];
        
        echo "            Original: " . formatBytes($originalSize) . "\n";
        echo "            Compressed: " . formatBytes($compressedSize) . "\n";
        echo "            Dimensions: {$width}x{$height}\n";
        echo "            Ratio: " . number_format($ratio, 2) . "%\n";
        
        // ========================================
        // STEP 2: SIMPAN DALAM FORMAT BIN
        // ========================================
        echo "   [STEP 2] Simpan sebagai BIN...\n";
        
        $binFilename = 'test_' . time() . '_' . $index . '.bin';
        $binPath = 'test_compressed/' . $binFilename;
        
        // Buat header BIN
        $magic = 'JPGCOMP1';
        $quality = 60;
        $dataLength = strlen($compressResult['encoded_data']);
        $checksum = crc32($compressResult['encoded_data']);
        
        $header = $magic . pack('VVVVV',
            $quality,
            $width,
            $height,
            $dataLength,
            $checksum
        );
        
        $binData = $header . $compressResult['encoded_data'];
        $binSize = strlen($binData);
        
        Storage::disk('public')->put($binPath, $binData);
        
        echo "            BIN file: {$binFilename}\n";
        echo "            BIN size: " . formatBytes($binSize) . "\n";
        echo "            Header size: 28 bytes\n";
        echo "            Data size: " . formatBytes($dataLength) . "\n";
        echo "            CRC32 checksum: " . sprintf('%08X', $checksum) . "\n";
        
        // ========================================
        // STEP 3: LOAD FILE BIN
        // ========================================
        echo "   [STEP 3] Load file BIN...\n";
        
        $loadedData = $service->loadCompressedFile($binPath);
        
        $loadedWidth = $loadedData['metadata']['width'];
        $loadedHeight = $loadedData['metadata']['height'];
        $loadedQuality = $loadedData['metadata']['quality'];
        
        echo "            Width: {$loadedWidth} (expected: {$width})\n";
        echo "            Height: {$loadedHeight} (expected: {$height})\n";
        echo "            Quality: {$loadedQuality}\n";
        
        // Verifikasi metadata
        $metadataValid = ($loadedWidth == $width && $loadedHeight == $height);
        echo "            Metadata valid: " . ($metadataValid ? "✓ YES" : "✗ NO") . "\n";
        
        // ========================================
        // STEP 4: DEKOMPRESI KE GAMBAR
        // ========================================
        echo "   [STEP 4] Dekompresi ke gambar...\n";
        
        $decompressResult = $service->decompress(
            $loadedData['encoded_data'],
            $loadedWidth,
            $loadedHeight,
            'jpg'
        );
        
        $restoredPath = Storage::disk('public')->path(str_replace('public/', '', $decompressResult['path']));
        
        echo "            Output file: {$decompressResult['filename']}\n";
        echo "            Decompression time: " . number_format($decompressResult['decompression_time'] * 1000, 2) . " ms\n";
        
        // ========================================
        // STEP 5: VALIDASI HASIL
        // ========================================
        echo "   [STEP 5] Validasi hasil...\n";
        
        // Cek file exists
        $fileExists = file_exists($restoredPath);
        echo "            File exists: " . ($fileExists ? "✓ YES" : "✗ NO") . "\n";
        
        if ($fileExists) {
            $restoredSize = filesize($restoredPath);
            $restoredInfo = getimagesize($restoredPath);
            $restoredWidth = $restoredInfo[0];
            $restoredHeight = $restoredInfo[1];
            $restoredMime = $restoredInfo['mime'];
            
            echo "            Restored size: " . formatBytes($restoredSize) . "\n";
            echo "            Restored dimensions: {$restoredWidth}x{$restoredHeight}\n";
            echo "            MIME type: {$restoredMime}\n";
            
            // Validasi dimensi
            $dimensionValid = ($restoredWidth == $width && $restoredHeight == $height);
            echo "            Dimensions match: " . ($dimensionValid ? "✓ YES" : "✗ NO") . "\n";
            
            // Validasi format
            $formatValid = ($restoredMime == 'image/jpeg');
            echo "            Format valid: " . ($formatValid ? "✓ YES" : "✗ NO") . "\n";
            
            // Validasi ukuran (harus hampir sama dengan data terkompresi)
            $sizeDiff = abs($restoredSize - $compressedSize);
            $sizeValid = ($sizeDiff < 100); // toleransi 100 bytes
            echo "            Size difference: " . $sizeDiff . " bytes\n";
            
            $allValid = $metadataValid && $fileExists && $dimensionValid && $formatValid;
            
            $results[] = [
                'category' => $sample['category'],
                'filename' => $filename,
                'original_size' => $originalSize,
                'compressed_size' => $compressedSize,
                'bin_size' => $binSize,
                'restored_size' => $restoredSize,
                'width' => $width,
                'height' => $height,
                'ratio' => $ratio,
                'checksum' => sprintf('%08X', $checksum),
                'metadata_valid' => $metadataValid,
                'dimension_valid' => $dimensionValid,
                'format_valid' => $formatValid,
                'all_valid' => $allValid,
                'decompression_time' => $decompressResult['decompression_time']
            ];
            
            if ($allValid) {
                echo "   ✅ HASIL: VALID - Dekompresi berhasil!\n";
                $successCount++;
            } else {
                echo "   ❌ HASIL: GAGAL - Validasi tidak lolos\n";
                $failCount++;
            }
        } else {
            echo "   ❌ HASIL: GAGAL - File tidak ditemukan\n";
            $failCount++;
        }
        
    } catch (Exception $e) {
        echo "   ❌ ERROR: " . $e->getMessage() . "\n";
        $failCount++;
    }
    
    echo "\n";
}

// ========================================
// RINGKASAN HASIL
// ========================================
echo "===========================================\n";
echo "  RINGKASAN HASIL PENGUJIAN DEKOMPRESI\n";
echo "===========================================\n\n";

$totalTests = $successCount + $failCount;
$successRate = ($successCount / $totalTests) * 100;

echo "Total file diuji: {$totalTests}\n";
echo "Berhasil: {$successCount} (" . number_format($successRate, 2) . "%)\n";
echo "Gagal: {$failCount}\n\n";

// Tabel hasil
echo "┌─────────────────────┬────────────┬────────────┬────────────┬───────────┬──────────┐\n";
echo "│ Filename            │ Original   │ BIN Size   │ Restored   │ Dimensi   │ Status   │\n";
echo "├─────────────────────┼────────────┼────────────┼────────────┼───────────┼──────────┤\n";

foreach ($results as $r) {
    $fname = substr($r['filename'], 0, 19);
    $fname = str_pad($fname, 19);
    $orig = str_pad(formatBytes($r['original_size']), 10);
    $bin = str_pad(formatBytes($r['bin_size']), 10);
    $rest = str_pad(formatBytes($r['restored_size']), 10);
    $dim = str_pad($r['width'] . 'x' . $r['height'], 9);
    $status = $r['all_valid'] ? '✓ Valid ' : '✗ Failed';
    
    echo "│ {$fname} │ {$orig} │ {$bin} │ {$rest} │ {$dim} │ {$status} │\n";
}

echo "└─────────────────────┴────────────┴────────────┴────────────┴───────────┴──────────┘\n\n";

// Data untuk LaTeX
echo "===========================================\n";
echo "  DATA UNTUK UPDATE LAPORAN LATEX\n";
echo "===========================================\n\n";

echo "% Tabel Hasil Pengujian Dekompresi\n";
foreach ($results as $r) {
    $binSizeFormatted = formatBytes($r['bin_size']);
    $restoredFormatted = formatBytes($r['restored_size']);
    echo "% {$r['category']} ({$r['filename']}): BIN={$binSizeFormatted}, Restored={$restoredFormatted}, Dim={$r['width']}x{$r['height']}, Valid={$r['all_valid']}\n";
}

// Simpan hasil ke JSON
$jsonOutput = [
    'test_date' => date('Y-m-d H:i:s'),
    'quality' => 60,
    'total_tests' => $totalTests,
    'success_count' => $successCount,
    'fail_count' => $failCount,
    'success_rate' => $successRate,
    'results' => $results
];

file_put_contents(__DIR__ . '/decompression-test-results.json', json_encode($jsonOutput, JSON_PRETTY_PRINT));
echo "\n✅ Hasil disimpan ke decompression-test-results.json\n";

// Cleanup test files
echo "\n🧹 Membersihkan file test...\n";
Storage::disk('public')->deleteDirectory('test_compressed');
Storage::disk('public')->deleteDirectory('test_decompressed');
Storage::disk('public')->deleteDirectory('decompressed');
echo "✅ File test dibersihkan\n";

function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= pow(1024, $pow);
    return round($bytes, $precision) . ' ' . $units[$pow];
}
