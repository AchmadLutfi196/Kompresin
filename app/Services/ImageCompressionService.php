<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

/**
 * Service untuk kompresi gambar menggunakan metode JPEG Quality Reduction.
 * 
 * Proses utama:
 * 1. Load gambar dari berbagai format (JPEG, PNG, BMP, GIF, WEBP)
 * 2. Resize otomatis jika gambar terlalu besar (>50 megapixel)
 * 3. Kompres menggunakan pengaturan kualitas JPEG (1-100)
 * 4. Simpan hasil dalam format JPG atau BIN (binary dengan header metadata)
 */
class ImageCompressionService
{
    /**
     * Level kualitas preset untuk kompresi.
     * Nilai lebih rendah = kompresi lebih tinggi = ukuran file lebih kecil = kualitas lebih rendah
     */
    private $qualityLevels = [
        'ultra' => 20,      // Kompresi maksimal (kualitas terendah)
        'high' => 40,       // Kompresi tinggi
        'medium' => 60,     // Kompresi sedang (seimbang)
        'low' => 80,        // Kompresi rendah (kualitas bagus)
        'minimal' => 90,    // Kompresi minimal (kualitas terbaik)
    ];

    /**
     * Fungsi utama untuk mengompres gambar.
     * 
     * PROSES:
     * 1. Tingkatkan memory limit untuk menangani gambar besar
     * 2. Load gambar ke memory sebagai resource GD
     * 3. Cek ukuran gambar, resize jika melebihi 50 megapixel
     * 4. Kompres dengan menyimpan sebagai JPEG dengan kualitas tertentu
     * 5. Hitung statistik kompresi (rasio, bits per pixel, dll)
     * 6. Bersihkan memory dan kembalikan hasil
     * 
     * @param string $imagePath Path ke file gambar asli
     * @param int $quality Kualitas JPEG (1-100, lebih rendah = kompresi lebih tinggi)
     * @return array Hasil kompresi dengan statistik
     */
    public function compress($imagePath, $quality = 60)
    {
        // [STEP 1] Tingkatkan memory limit untuk gambar besar
        ini_set('memory_limit', '512M');
        
        // [STEP 2] Load gambar ke memory menggunakan GD Library
        $imageData = $this->loadImage($imagePath);
        if (!$imageData) {
            throw new \Exception("Failed to load image");
        }

        // [STEP 3] Dapatkan ukuran file asli untuk perhitungan rasio kompresi
        $originalFileSize = filesize($imagePath);
        
        // [STEP 4] Auto-resize jika gambar terlalu besar (mencegah out of memory)
        $pixels = $imageData['width'] * $imageData['height'];
        $maxPixels = 50000000; // Batas maksimal 50 megapixels
        
        if ($pixels > $maxPixels) {
            // Hitung rasio pengecilan berdasarkan akar kuadrat
            $ratio = sqrt($maxPixels / $pixels);
            $newWidth = (int)($imageData['width'] * $ratio);
            $newHeight = (int)($imageData['height'] * $ratio);
            
            // Buat canvas baru dengan ukuran yang lebih kecil
            $resized = imagecreatetruecolor($newWidth, $newHeight);
            
            // Pertahankan transparansi untuk gambar PNG
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            
            // Salin dan resize gambar dengan resampling berkualitas tinggi
            imagecopyresampled(
                $resized, $imageData['resource'], 
                0, 0, 0, 0, 
                $newWidth, $newHeight, 
                $imageData['width'], $imageData['height']
            );
            
            // Hapus resource gambar lama untuk menghemat memory
            imagedestroy($imageData['resource']);
            
            // Update data gambar dengan versi yang sudah diresize
            $imageData['resource'] = $resized;
            $imageData['width'] = $newWidth;
            $imageData['height'] = $newHeight;
        }

        // [STEP 5] Mulai proses kompresi
        $startTime = microtime(true);
        
        // Buat file temporary untuk menyimpan hasil kompresi
        $tempFile = tempnam(sys_get_temp_dir(), 'compress_');
        
        // Pastikan kualitas dalam range valid (1-100)
        $quality = max(1, min(100, (int)$quality));
        
        // [STEP 6] Simpan sebagai JPEG dengan kualitas yang ditentukan
        // Ini adalah inti dari kompresi - JPEG menggunakan lossy compression
        $success = imagejpeg($imageData['resource'], $tempFile, $quality);
        
        // Hitung waktu kompresi
        $compressionTime = microtime(true) - $startTime;
        
        if (!$success) {
            imagedestroy($imageData['resource']);
            throw new \Exception("Failed to compress image");
        }
        
        // [STEP 7] Hitung statistik kompresi
        $compressedSize = filesize($tempFile);
        
        // Baca data hasil kompresi
        $compressedData = file_get_contents($tempFile);
        
        // Rasio kompresi = berapa persen ukuran berkurang
        $compressionRatio = (1 - ($compressedSize / $originalFileSize)) * 100;
        
        // Bits per pixel = ukuran file (dalam bit) dibagi jumlah pixel
        $totalPixels = $imageData['width'] * $imageData['height'];
        $bitsPerPixel = ($compressedSize * 8) / $totalPixels;
        
        // Dapatkan metrik kualitas berdasarkan setting
        $qualityMetrics = $this->calculateQualityMetrics($quality);
        
        // [STEP 8] Bersihkan resources
        unlink($tempFile);           // Hapus file temporary
        imagedestroy($imageData['resource']);  // Bebaskan memory GD
        
        // [STEP 9] Kembalikan hasil dengan semua statistik
        return [
            'encoded_data' => $compressedData,           // Data JPEG terkompresi
            'original_size' => $originalFileSize,        // Ukuran asli (bytes)
            'compressed_size' => $compressedSize,        // Ukuran terkompresi (bytes)
            'compression_ratio' => $compressionRatio,    // Persentase pengurangan
            'bits_per_pixel' => $bitsPerPixel,          // Rata-rata bit per pixel
            'quality' => $quality,                       // Setting kualitas yang digunakan
            'quality_level' => $qualityMetrics['level'], // Level kualitas (ultra/high/medium/low/minimal)
            'estimated_visual_quality' => $qualityMetrics['visual_quality'],
            'width' => $imageData['width'],
            'height' => $imageData['height'],
            'type' => $imageData['type'],
            'compression_time' => $compressionTime,
            'algorithm' => 'JPEG Quality Reduction',
            'description' => $qualityMetrics['description'],
        ];
    }

    /**
     * Menentukan level dan deskripsi kualitas berdasarkan nilai quality JPEG.
     * 
     * PROSES:
     * - Mengkategorikan nilai quality (1-100) ke dalam 5 level
     * - Memberikan deskripsi visual quality yang diharapkan
     * 
     * @param int $quality Nilai kualitas JPEG (1-100)
     * @return array Informasi level, visual quality, dan deskripsi
     */
    private function calculateQualityMetrics($quality)
    {
        if ($quality <= 20) {
            return [
                'level' => 'ultra',
                'visual_quality' => 'Low',
                'description' => 'Maximum compression, noticeable artifacts',
            ];
        } elseif ($quality <= 40) {
            return [
                'level' => 'high',
                'visual_quality' => 'Medium-Low',
                'description' => 'High compression, some visible artifacts',
            ];
        } elseif ($quality <= 60) {
            return [
                'level' => 'medium',
                'visual_quality' => 'Medium',
                'description' => 'Balanced compression and quality',
            ];
        } elseif ($quality <= 80) {
            return [
                'level' => 'low',
                'visual_quality' => 'Good',
                'description' => 'Good quality with moderate compression',
            ];
        } else {
            return [
                'level' => 'minimal',
                'visual_quality' => 'Excellent',
                'description' => 'Minimal compression, best visual quality',
            ];
        }
    }

    /**
     * Mengembalikan gambar dari data terkompresi ke file yang bisa digunakan.
     * 
     * PROSES:
     * 1. Untuk output JPG: langsung tulis data (sudah berupa JPEG valid)
     * 2. Untuk format lain: konversi menggunakan GD Library
     * 3. Simpan ke folder storage/decompressed
     * 
     * @param string $compressedData Data JPEG terkompresi
     * @param int $width Lebar gambar
     * @param int $height Tinggi gambar
     * @param string $outputType Format output (jpg/png/bmp)
     * @return array Informasi file hasil dekompresi
     */
    public function decompress($compressedData, $width, $height, $outputType = 'jpg')
    {
        $startTime = microtime(true);
        
        // Data terkompresi sudah berupa JPEG valid, tidak perlu decode khusus
        
        $filename = 'decompressed_' . time() . '.' . $outputType;
        $path = 'decompressed/' . $filename;
        
        // Buat direktori jika belum ada
        Storage::disk('public')->makeDirectory('decompressed');
        $fullPath = Storage::disk('public')->path($path);
        
        if ($outputType === 'jpg' || $outputType === 'jpeg') {
            // Untuk JPEG: langsung tulis karena data sudah berupa JPEG
            file_put_contents($fullPath, $compressedData);
        } else {
            // Untuk format lain: perlu konversi
            // Buat image resource dari data JPEG
            $image = imagecreatefromstring($compressedData);
            if ($image === false) {
                throw new \Exception("Failed to create image from compressed data");
            }
            
            // Simpan dalam format yang diminta
            switch ($outputType) {
                case 'png':
                    imagepng($image, $fullPath, 0); // 0 = tanpa kompresi PNG tambahan
                    break;
                case 'bmp':
                    imagebmp($image, $fullPath);
                    break;
                default:
                    imagejpeg($image, $fullPath, 100); // 100 = kualitas maksimal
            }
            
            imagedestroy($image);
        }
        
        $decompressionTime = microtime(true) - $startTime;
        
        return [
            'path' => 'public/' . $path,
            'url' => '/storage/' . $path,
            'filename' => $filename,
            'decompression_time' => $decompressionTime,
        ];
    }

    /**
     * Load gambar dari berbagai format ke GD resource.
     * 
     * PROSES:
     * 1. Cek keberadaan file
     * 2. Baca informasi gambar (ukuran, tipe)
     * 3. Load ke memory menggunakan fungsi GD yang sesuai dengan tipe
     * 4. Handle error untuk PNG dengan profile ICC yang corrupt
     * 
     * Format yang didukung: JPEG, PNG, BMP, GIF, WEBP
     * 
     * @param string $path Path ke file gambar
     * @return array|false Array berisi resource, width, height, type atau false jika gagal
     */
    private function loadImage($path)
    {
        if (!file_exists($path)) {
            throw new \Exception("Image file not found: {$path}");
        }
        
        // Dapatkan informasi gambar (dimensi dan tipe)
        $imageInfo = getimagesize($path);
        if (!$imageInfo) {
            return false;
        }

        $width = $imageInfo[0];
        $height = $imageInfo[1];
        $type = $imageInfo[2];  // Konstanta IMAGETYPE_*

        // Suppress warning untuk PNG dengan ICC profile yang corrupt
        // (umum terjadi pada PNG dari berbagai software)
        $previousErrorHandler = set_error_handler(function($errno, $errstr) {
            if (strpos($errstr, 'iCCP') !== false || strpos($errstr, 'sRGB') !== false) {
                return true; // Abaikan error ini
            }
            return false;
        });

        try {
            // Load gambar sesuai tipe menggunakan fungsi GD yang tepat
            switch ($type) {
                case IMAGETYPE_JPEG:
                    $image = imagecreatefromjpeg($path);
                    $typeStr = 'jpg';
                    break;
                case IMAGETYPE_PNG:
                    $image = imagecreatefrompng($path);
                    $typeStr = 'png';
                    break;
                case IMAGETYPE_BMP:
                    $image = imagecreatefrombmp($path);
                    $typeStr = 'bmp';
                    break;
                case IMAGETYPE_GIF:
                    $image = imagecreatefromgif($path);
                    $typeStr = 'gif';
                    break;
                case IMAGETYPE_WEBP:
                    $image = imagecreatefromwebp($path);
                    $typeStr = 'webp';
                    break;
                default:
                    restore_error_handler();
                    return false; // Format tidak didukung
            }
        } finally {
            // Kembalikan error handler ke kondisi semula
            if ($previousErrorHandler !== null) {
                set_error_handler($previousErrorHandler);
            } else {
                restore_error_handler();
            }
        }

        if ($image === false) {
            return false;
        }

        return [
            'resource' => $image,  // GD image resource
            'width' => $width,
            'height' => $height,
            'type' => $typeStr,
        ];
    }

    /**
     * Simpan file hasil kompresi dalam format yang dipilih user.
     * 
     * PROSES:
     * - Format 'jpg': Simpan langsung sebagai file JPEG
     * - Format 'bin': Simpan sebagai binary dengan header metadata
     * 
     * @param string $compressedData Data terkompresi
     * @param array $metadata Metadata gambar (width, height, quality, dll)
     * @param string $format Format output ('jpg' atau 'bin')
     * @return array Informasi file yang tersimpan
     */
    public function saveCompressedFile($compressedData, $metadata, $format = 'jpg')
    {
        $filename = 'compressed_' . time();
        
        Storage::disk('public')->makeDirectory('compressed');
        
        switch (strtolower($format)) {
            case 'bin':
                return $this->saveAsBinary($compressedData, $metadata, $filename);
            
            case 'jpg':
            case 'jpeg':
            default:
                return $this->saveAsJpeg($compressedData, $metadata, $filename);
        }
    }
    
    /**
     * Simpan sebagai file JPEG standar.
     * 
     * PROSES:
     * - Langsung tulis data ke file karena sudah berupa JPEG valid
     * - Tidak ada konversi atau processing tambahan
     * 
     * KELEBIHAN format JPG:
     * - Bisa dibuka langsung di semua aplikasi
     * - Ukuran file = ukuran data terkompresi
     */
    private function saveAsJpeg($compressedData, $metadata, $filename)
    {
        $filename .= '.jpg';
        $fullPath = 'compressed/' . $filename;
        
        Storage::disk('public')->makeDirectory('compressed');
        $diskPath = Storage::disk('public')->path($fullPath);
        
        // Write JPEG data directly
        $bytesWritten = file_put_contents($diskPath, $compressedData, LOCK_EX);
        
        if ($bytesWritten === false) {
            throw new \Exception("Failed to save compressed file");
        }
        
        $fileSize = filesize($diskPath);
        
        return [
            'path' => 'public/' . $fullPath,
            'url' => '/storage/' . $fullPath,
            'filename' => $filename,
            'size' => $fileSize,
            'format' => 'jpg',
        ];
    }
    
    /**
     * Simpan sebagai file Binary dengan header metadata.
     * 
     * STRUKTUR FILE BIN:
     * ┌─────────────────────────────────────────┐
     * │ Magic Number: "JPGCOMP1" (8 bytes)      │ <- Identifier format
     * ├─────────────────────────────────────────┤
     * │ Quality (4 bytes, unsigned int)         │ <- Setting kualitas
     * │ Width (4 bytes, unsigned int)           │ <- Lebar gambar
     * │ Height (4 bytes, unsigned int)          │ <- Tinggi gambar
     * │ Data Length (4 bytes, unsigned int)     │ <- Panjang data JPEG
     * │ Checksum CRC32 (4 bytes, unsigned int)  │ <- Untuk verifikasi integritas
     * ├─────────────────────────────────────────┤
     * │ JPEG Data (variable length)             │ <- Data gambar terkompresi
     * └─────────────────────────────────────────┘
     * Total header: 28 bytes
     * 
     * KELEBIHAN format BIN:
     * - Menyimpan metadata tambahan
     * - Ada checksum untuk deteksi kerusakan file
     */
    private function saveAsBinary($compressedData, $metadata, $filename)
    {
        $filename .= '.bin';
        $fullPath = 'compressed/' . $filename;
        
        Storage::disk('public')->makeDirectory('compressed');
        $diskPath = Storage::disk('public')->path($fullPath);
        
        // [STEP 1] Siapkan komponen header
        $magic = 'JPGCOMP1';  // Magic number untuk identifikasi format
        $quality = $metadata['quality'] ?? 60;
        $dataLength = strlen($compressedData);
        $checksum = crc32($compressedData);  // CRC32 untuk verifikasi integritas
        
        // [STEP 2] Pack header dalam format binary
        // V = unsigned long (32-bit, little-endian)
        $header = $magic . pack('VVVVV',
            $quality,
            $metadata['width'],
            $metadata['height'],
            $dataLength,
            $checksum
        );
        
        // [STEP 3] Gabungkan header + data
        $binaryData = $header . $compressedData;
        
        // [STEP 4] Tulis ke file dengan locking untuk mencegah race condition
        $bytesWritten = file_put_contents($diskPath, $binaryData, LOCK_EX);
        
        if ($bytesWritten === false) {
            throw new \Exception("Failed to save binary file");
        }
        
        // [STEP 5] Verifikasi file tersimpan dengan benar
        $actualSize = filesize($diskPath);
        if ($actualSize !== strlen($binaryData)) {
            unlink($diskPath);
            throw new \Exception("File size mismatch");
        }
        
        return [
            'path' => 'public/' . $fullPath,
            'url' => '/storage/' . $fullPath,
            'filename' => $filename,
            'size' => $actualSize,
            'format' => 'bin',
        ];
    }

    /**
     * Load file terkompresi dari storage.
     * 
     * PROSES:
     * 1. Normalisasi path dan cari file di storage
     * 2. Deteksi format berdasarkan ekstensi
     * 3. Untuk JPG: langsung return karena sudah JPEG valid
     * 4. Untuk BIN: parse header, validasi checksum, extract data
     * 
     * @param string $path Path ke file terkompresi
     * @return array Metadata dan data terkompresi
     */
    public function loadCompressedFile($path)
    {
        // [STEP 1] Normalisasi path - handle berbagai format path
        $normalizedPath = $path;
        if (str_starts_with($path, 'public/')) {
            $normalizedPath = substr($path, 7); // Hapus prefix 'public/'
        }
        
        // [STEP 2] Cari dan baca file dari storage
        if (Storage::disk('public')->exists($normalizedPath)) {
            $content = Storage::disk('public')->get($normalizedPath);
        } elseif (Storage::disk('public')->exists($path)) {
            $content = Storage::disk('public')->get($path);
        } elseif (Storage::exists($path)) {
            $content = Storage::get($path);
        } else {
            throw new \Exception("File not found: $path");
        }
        
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        
        // [STEP 3] Handle format JPEG - sudah berupa JPEG valid
        if ($extension === 'jpg' || $extension === 'jpeg') {
            // Baca dimensi dari data JPEG
            $imageInfo = getimagesizefromstring($content);
            
            if ($imageInfo === false) {
                throw new \Exception("Invalid JPEG data");
            }
            
            return [
                'metadata' => [
                    'width' => $imageInfo[0],
                    'height' => $imageInfo[1],
                    'type' => 'jpg',
                    'algorithm' => 'JPEG Quality Reduction',
                ],
                'encoded_data' => $content,
            ];
        }
        
        // [STEP 4] Handle format Binary - perlu parsing header
        if ($extension === 'bin') {
            // Validasi ukuran minimum (header = 28 bytes)
            if (strlen($content) < 28) {
                throw new \Exception("Invalid binary file - too small");
            }
            
            // Baca magic number untuk identifikasi format
            $magic = substr($content, 0, 8);
            
            if ($magic === 'JPGCOMP1') {
                // Parse header: unpack data setelah magic number
                $headerData = unpack('Vquality/Vwidth/Vheight/Vlength/Vchecksum', substr($content, 8, 20));
                
                // Extract data JPEG (setelah header 28 bytes)
                $encodedData = substr($content, 28);
                
                // Verifikasi integritas data dengan checksum
                if (crc32($encodedData) !== $headerData['checksum']) {
                    throw new \Exception("File corruption detected - checksum mismatch");
                }
                
                return [
                    'metadata' => [
                        'width' => $headerData['width'],
                        'height' => $headerData['height'],
                        'quality' => $headerData['quality'],
                        'type' => 'jpg',
                        'algorithm' => 'JPEG Quality Reduction',
                    ],
                    'encoded_data' => $encodedData,
                ];
            }
            
            // Handle format lama (backward compatibility)
            if ($magic === 'KOMPRSN2' || $magic === 'KOMPRSN1') {
                throw new \Exception("File ini menggunakan format kompresi lama. Silakan kompres ulang dengan metode JPEG Quality.");
            }
        }
        
        throw new \Exception("Format file tidak didukung");
    }

    /**
     * Mendapatkan daftar preset kualitas yang tersedia.
     * 
     * Digunakan untuk menampilkan pilihan di UI.
     * 
     * @return array Daftar preset dengan nama, nilai, dan deskripsi
     */
    public function getQualityPresets()
    {
        return [
            [
                'name' => 'Ultra Compression',
                'value' => 20,
                'description' => 'Smallest file size, visible quality loss',
                'icon' => 'compress',
            ],
            [
                'name' => 'High Compression',
                'value' => 40,
                'description' => 'Small file size, some quality loss',
                'icon' => 'compress',
            ],
            [
                'name' => 'Balanced',
                'value' => 60,
                'description' => 'Good balance of size and quality',
                'icon' => 'balance',
            ],
            [
                'name' => 'High Quality',
                'value' => 80,
                'description' => 'Good quality, moderate compression',
                'icon' => 'quality',
            ],
            [
                'name' => 'Best Quality',
                'value' => 90,
                'description' => 'Excellent quality, minimal compression',
                'icon' => 'star',
            ],
        ];
    }
}
