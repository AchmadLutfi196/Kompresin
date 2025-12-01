<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class ImageCompressionService
{
    private $qualityLevels = [
        'ultra' => 20,      // Ultra compression (lowest quality)
        'high' => 40,       // High compression
        'medium' => 60,     // Medium compression (balanced)
        'low' => 80,        // Low compression (good quality)
        'minimal' => 90,    // Minimal compression (best quality)
    ];

    /**
     * Compress an image using JPEG Quality Reduction
     * 
     * @param string $imagePath Path to the original image
     * @param int $quality JPEG quality (1-100, lower = more compression)
     * @return array Compression result with statistics
     */
    public function compress($imagePath, $quality = 60)
    {
        ini_set('memory_limit', '512M');
        
        // Load image
        $imageData = $this->loadImage($imagePath);
        if (!$imageData) {
            throw new \Exception("Failed to load image");
        }

        // Get original file size
        $originalFileSize = filesize($imagePath);
        
        // Auto-resize if too large
        $pixels = $imageData['width'] * $imageData['height'];
        $maxPixels = 50000000; // 50 megapixels
        
        if ($pixels > $maxPixels) {
            $ratio = sqrt($maxPixels / $pixels);
            $newWidth = (int)($imageData['width'] * $ratio);
            $newHeight = (int)($imageData['height'] * $ratio);
            
            $resized = imagecreatetruecolor($newWidth, $newHeight);
            
            // Preserve transparency for PNG
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            
            imagecopyresampled(
                $resized, $imageData['resource'], 
                0, 0, 0, 0, 
                $newWidth, $newHeight, 
                $imageData['width'], $imageData['height']
            );
            
            imagedestroy($imageData['resource']);
            
            $imageData['resource'] = $resized;
            $imageData['width'] = $newWidth;
            $imageData['height'] = $newHeight;
        }

        // Compress using JPEG quality reduction
        $startTime = microtime(true);
        
        // Create temporary file for compressed output
        $tempFile = tempnam(sys_get_temp_dir(), 'compress_');
        
        // Ensure quality is within valid range
        $quality = max(1, min(100, (int)$quality));
        
        // Save as JPEG with specified quality
        $success = imagejpeg($imageData['resource'], $tempFile, $quality);
        
        $compressionTime = microtime(true) - $startTime;
        
        if (!$success) {
            imagedestroy($imageData['resource']);
            throw new \Exception("Failed to compress image");
        }
        
        // Get compressed file size
        $compressedSize = filesize($tempFile);
        
        // Read compressed data
        $compressedData = file_get_contents($tempFile);
        
        // Calculate compression ratio
        $compressionRatio = (1 - ($compressedSize / $originalFileSize)) * 100;
        
        // Calculate bits per pixel
        $totalPixels = $imageData['width'] * $imageData['height'];
        $bitsPerPixel = ($compressedSize * 8) / $totalPixels;
        
        // Calculate quality metrics
        $qualityMetrics = $this->calculateQualityMetrics($quality);
        
        // Clean up temp file
        unlink($tempFile);
        
        // Free memory
        imagedestroy($imageData['resource']);
        
        return [
            'encoded_data' => $compressedData,
            'original_size' => $originalFileSize,
            'compressed_size' => $compressedSize,
            'compression_ratio' => $compressionRatio,
            'bits_per_pixel' => $bitsPerPixel,
            'quality' => $quality,
            'quality_level' => $qualityMetrics['level'],
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
     * Calculate quality metrics based on JPEG quality setting
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
     * Decompress/restore image (for JPEG, we just save the data as-is)
     */
    public function decompress($compressedData, $width, $height, $outputType = 'jpg')
    {
        $startTime = microtime(true);
        
        // For JPEG quality reduction, the compressed data IS a valid JPEG
        // We just need to save it or convert to another format
        
        $filename = 'decompressed_' . time() . '.' . $outputType;
        $path = 'decompressed/' . $filename;
        
        Storage::disk('public')->makeDirectory('decompressed');
        $fullPath = Storage::disk('public')->path($path);
        
        if ($outputType === 'jpg' || $outputType === 'jpeg') {
            // Just write the JPEG data directly
            file_put_contents($fullPath, $compressedData);
        } else {
            // Convert to other formats
            $image = imagecreatefromstring($compressedData);
            if ($image === false) {
                throw new \Exception("Failed to create image from compressed data");
            }
            
            switch ($outputType) {
                case 'png':
                    imagepng($image, $fullPath, 0);
                    break;
                case 'bmp':
                    imagebmp($image, $fullPath);
                    break;
                default:
                    imagejpeg($image, $fullPath, 100);
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
     * Load image and get resource
     */
    private function loadImage($path)
    {
        if (!file_exists($path)) {
            throw new \Exception("Image file not found: {$path}");
        }
        
        $imageInfo = getimagesize($path);
        if (!$imageInfo) {
            return false;
        }

        $width = $imageInfo[0];
        $height = $imageInfo[1];
        $type = $imageInfo[2];

        // Suppress warnings for corrupted PNG profiles
        $previousErrorHandler = set_error_handler(function($errno, $errstr) {
            if (strpos($errstr, 'iCCP') !== false || strpos($errstr, 'sRGB') !== false) {
                return true;
            }
            return false;
        });

        try {
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
                    return false;
            }
        } finally {
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
            'resource' => $image,
            'width' => $width,
            'height' => $height,
            'type' => $typeStr,
        ];
    }

    /**
     * Save compressed file with user-selected format
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
     * Save as JPEG format (direct - no conversion needed)
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
     * Save as Binary format with metadata header
     */
    private function saveAsBinary($compressedData, $metadata, $filename)
    {
        $filename .= '.bin';
        $fullPath = 'compressed/' . $filename;
        
        Storage::disk('public')->makeDirectory('compressed');
        $diskPath = Storage::disk('public')->path($fullPath);
        
        // Create header
        $magic = 'JPGCOMP1'; // 8-byte magic number
        $quality = $metadata['quality'] ?? 60;
        $dataLength = strlen($compressedData);
        $checksum = crc32($compressedData);
        
        // Pack header: magic(8) + quality(4) + width(4) + height(4) + length(4) + checksum(4) = 28 bytes
        $header = $magic . pack('VVVVV',
            $quality,
            $metadata['width'],
            $metadata['height'],
            $dataLength,
            $checksum
        );
        
        $binaryData = $header . $compressedData;
        
        $bytesWritten = file_put_contents($diskPath, $binaryData, LOCK_EX);
        
        if ($bytesWritten === false) {
            throw new \Exception("Failed to save binary file");
        }
        
        // Verify
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
     * Load compressed file
     */
    public function loadCompressedFile($path)
    {
        // Normalize path - remove 'public/' prefix if present for public disk
        $normalizedPath = $path;
        if (str_starts_with($path, 'public/')) {
            $normalizedPath = substr($path, 7); // Remove 'public/' prefix
        }
        
        // Try public disk first
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
        
        // Handle JPG format - it's already a valid JPEG
        if ($extension === 'jpg' || $extension === 'jpeg') {
            // Get image dimensions from JPEG data
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
        
        // Handle BIN format
        if ($extension === 'bin') {
            if (strlen($content) < 28) {
                throw new \Exception("Invalid binary file - too small");
            }
            
            $magic = substr($content, 0, 8);
            
            if ($magic === 'JPGCOMP1') {
                // New JPEG compression format
                $headerData = unpack('Vquality/Vwidth/Vheight/Vlength/Vchecksum', substr($content, 8, 20));
                
                $encodedData = substr($content, 28);
                
                // Verify checksum
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
            
            // Try old format for backward compatibility
            if ($magic === 'KOMPRSN2' || $magic === 'KOMPRSN1') {
                throw new \Exception("File ini menggunakan format kompresi lama. Silakan kompres ulang dengan metode JPEG Quality.");
            }
        }
        
        throw new \Exception("Format file tidak didukung");
    }

    /**
     * Get available quality presets
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
