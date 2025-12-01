<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class HuffmanCompressionService
{
    private $huffmanCodes = [];
    private $huffmanTree = null;
    private $frequencyTable = [];

    /**
     * Convert RGB pixel data to grayscale 
     */
    private function convertToGrayscale($pixelData, $width, $height)
    {
        $grayscaleData = '';
        $pixelCount = $width * $height;
        
        for ($i = 0; $i < $pixelCount; $i++) {
            $offset = $i * 3; // RGB = 3 bytes per pixel
            if ($offset + 2 < strlen($pixelData)) {
                $r = ord($pixelData[$offset]);
                $g = ord($pixelData[$offset + 1]);
                $b = ord($pixelData[$offset + 2]);
                
                // Convert to grayscale using luminance formula
                $gray = (int)(0.299 * $r + 0.587 * $g + 0.114 * $b);
                $grayscaleData .= chr($gray);
            }
        }
        
        return $grayscaleData;
    }

    /**
     * Compress an image using DEFLATE (LZ77 + Huffman) 
     */
    public function compress($imagePath)
    {
        ini_set('memory_limit', '512M');
        
        // Load image
        $imageData = $this->loadImage($imagePath);
        if (!$imageData) {
            throw new \Exception("Failed to load image");
        }

        // Auto-resize if too large
        $pixels = $imageData['width'] * $imageData['height'];
        $maxPixels = 50000000; // 50 megapixels
        
        if ($pixels > $maxPixels) {
            $ratio = sqrt($maxPixels / $pixels);
            $newWidth = (int)($imageData['width'] * $ratio);
            $newHeight = (int)($imageData['height'] * $ratio);
            
            $resized = imagecreatetruecolor($newWidth, $newHeight);
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

        // Get pixel data
        $pixelData = $this->getPixelData($imageData['resource'], $imageData['width'], $imageData['height']);
        
        // Apply simple grayscale conversion first to reduce data
        $grayscaleData = $this->convertToGrayscale($pixelData, $imageData['width'], $imageData['height']);
        
        // Validate grayscale data before compression
        if (empty($grayscaleData)) {
            throw new \Exception("Grayscale conversion failed - no data to compress");
        }
        
        // Use highest compression level with gzcompress
        $startTime = microtime(true);
        $compressedData = gzcompress($grayscaleData, 9);
        $compressionTime = microtime(true) - $startTime;
        
        // Verify compression was successful
        if ($compressedData === false) {
            throw new \Exception("Compression failed using DEFLATE algorithm");
        }
        
        // Test decompression to ensure data integrity
        $testDecompression = gzuncompress($compressedData);
        if ($testDecompression === false || $testDecompression !== $grayscaleData) {
            throw new \Exception("Compression integrity check failed");
        }
        
        // Calculate statistics
        $originalSize = strlen($grayscaleData); // Use grayscale size as baseline
        $compressedSize = strlen($compressedData);
        $compressionRatio = (1 - ($compressedSize / $originalSize)) * 100;
        
        // Build frequency table for visualization (only for small images to avoid memory issues)
        if ($originalSize < 1000000) { // 1MB limit for visualization
            $this->frequencyTable = $this->buildFrequencyTable($pixelData);
            $this->huffmanTree = $this->buildHuffmanTree($this->frequencyTable);
            $this->huffmanCodes = [];
            $this->generateHuffmanCodes($this->huffmanTree, '');
            $entropy = $this->calculateEntropy($this->frequencyTable, $originalSize);
        } else {
            // Skip visualization for large images
            $this->frequencyTable = [];
            $this->huffmanTree = null;
            $this->huffmanCodes = [];
            $entropy = 0;
        }
        
        // Free memory
        imagedestroy($imageData['resource']);
        unset($pixelData);
        
        return [
            'encoded_data' => $compressedData,
            'huffman_codes' => $this->huffmanCodes,
            'huffman_tree' => $this->huffmanTree ? $this->huffmanTree->toArray() : null,
            'frequency_table' => $this->frequencyTable,
            'original_size' => $originalSize,
            'compressed_size' => $compressedSize,
            'compression_ratio' => $compressionRatio,
            'bits_per_pixel' => ($compressedSize * 8) / ($imageData['width'] * $imageData['height']),
            'entropy' => $entropy,
            'width' => $imageData['width'],
            'height' => $imageData['height'],
            'type' => $imageData['type'],
            'compression_time' => $compressionTime,
            'algorithm' => 'DEFLATE (LZ77 + Huffman)',
        ];
    }

    /**
     * Apply Run-Length Encoding for repeated values (optimized)
     */
    private function applyRLE($data)
    {
        $length = strlen($data);
        
        // Skip RLE for very large data to prevent memory issues
        if ($length > 10000000) { // 10MB threshold
            return ['data' => $data, 'used' => false];
        }
        
        $encoded = '';
        $i = 0;
        $used = false;
        
        // Pre-allocate chunks for better performance
        $chunks = [];
        
        while ($i < $length) {
            $current = $data[$i];
            $count = 1;
            
            // Count consecutive identical bytes (optimized with strspn)
            $currentOrd = ord($current);
            while ($i + $count < $length && ord($data[$i + $count]) === $currentOrd && $count < 255) {
                $count++;
            }
            
            // Use RLE if we have 4+ repeats, otherwise store raw
            if ($count >= 4) {
                // RLE marker: 0xFF + count + value
                $chunks[] = chr(0xFF) . chr($count) . $current;
                $used = true;
            } else {
                // Store raw bytes, but avoid 0xFF marker conflicts
                for ($j = 0; $j < $count; $j++) {
                    if ($currentOrd === 0xFF) {
                        // Escape 0xFF as 0xFF 0x01 0xFF
                        $chunks[] = chr(0xFF) . chr(1) . chr(0xFF);
                        $used = true;
                    } else {
                        $chunks[] = $current;
                    }
                }
            }
            
            $i += $count;
        }
        
        // Join all chunks
        $encoded = implode('', $chunks);
        
        // Only use RLE if it actually reduces size by at least 5%
        if ($used && strlen($encoded) < ($length * 0.95)) {
            return ['data' => $encoded, 'used' => true];
        }
        
        return ['data' => $data, 'used' => false];
    }

    /**
     * Decode RLE data
     */
    private function decodeRLE($data, $rleUsed)
    {
        if (!$rleUsed) {
            return $data;
        }
        
        $decoded = '';
        $length = strlen($data);
        $i = 0;
        
        while ($i < $length) {
            if (ord($data[$i]) === 0xFF && $i + 2 < $length) {
                // RLE sequence
                $count = ord($data[$i + 1]);
                $value = $data[$i + 2];
                $decoded .= str_repeat($value, $count);
                $i += 3;
            } else {
                // Raw byte
                $decoded .= $data[$i];
                $i++;
            }
        }
        
        return $decoded;
    }

    /**
     * Decompress data using DEFLATE
     */
    public function decompress($compressedData, $huffmanTree, $width, $height, $imageType = 'png', $algorithm = 'DEFLATE')
    {
        // Decompress using gzuncompress (DEFLATE)
        $startTime = microtime(true);
        $pixelData = gzuncompress($compressedData);
        $decompressionTime = microtime(true) - $startTime;
        
        if ($pixelData === false) {
            throw new \Exception("Decompression failed");
        }
        
        // Create image from pixels
        $image = $this->createImageFromPixels($pixelData, $width, $height);
        
        // Save image
        $filename = 'decompressed_' . time() . '.' . $imageType;
        $path = 'decompressed/' . $filename;
        
        Storage::disk('public')->makeDirectory('decompressed');
        
        $fullPath = Storage::disk('public')->path($path);
        
        switch ($imageType) {
            case 'jpg':
            case 'jpeg':
                imagejpeg($image, $fullPath, 100);
                break;
            case 'png':
                imagepng($image, $fullPath, 0);
                break;
            case 'bmp':
                imagebmp($image, $fullPath);
                break;
        }
        
        imagedestroy($image);
        
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
            // Ignore PNG iCCP warnings
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
                default:
                    restore_error_handler();
                    return false;
            }
        } finally {
            // Restore previous error handler
            if ($previousErrorHandler !== null) {
                set_error_handler($previousErrorHandler);
            } else {
                restore_error_handler();
            }
        }

        return [
            'resource' => $image,
            'width' => $width,
            'height' => $height,
            'type' => $typeStr,
        ];
    }

    /**
     * Get pixel data as string
     */
    private function getPixelData($image, $width, $height)
    {
        $pixels = '';
        
        for ($y = 0; $y < $height; $y++) {
            for ($x = 0; $x < $width; $x++) {
                $rgb = imagecolorat($image, $x, $y);
                
                // Extract RGB components
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;
                
                // Store RGB values as 3 separate bytes to preserve color
                $pixels .= chr($r) . chr($g) . chr($b);
            }
        }
        
        return $pixels;
    }

    /**
     * Build frequency table (optimized with native count_chars)
     */
    private function buildFrequencyTable($data)
    {
        // Use native count_chars for better performance (10x faster)
        $charCounts = count_chars($data, 1); // mode 1 = only used bytes
        
        // Convert to our format
        $frequencies = [];
        foreach ($charCounts as $byte => $count) {
            $frequencies[$byte] = $count;
        }
        
        return $frequencies;
    }

    /**
     * Build Huffman tree (optimized with SplPriorityQueue)
     */
    private function buildHuffmanTree($frequencies)
    {
        if (empty($frequencies)) {
            return null;
        }
        
        // Use priority queue for better performance (O(log n) vs O(n))
        $queue = new \SplPriorityQueue();
        $queue->setExtractFlags(\SplPriorityQueue::EXTR_BOTH);
        
        // Add all leaf nodes to priority queue
        foreach ($frequencies as $symbol => $frequency) {
            $node = new HuffmanNode($symbol, $frequency);
            // Negative frequency for min-heap behavior
            $queue->insert($node, -$frequency);
        }
        
        // Build tree by combining nodes
        while ($queue->count() > 1) {
            // Extract two nodes with lowest frequency
            $left = $queue->extract()['data'];
            $right = $queue->extract()['data'];
            
            // Create parent node
            $parent = new HuffmanNode(
                null,
                $left->frequency + $right->frequency,
                $left,
                $right
            );
            
            // Insert parent back to queue
            $queue->insert($parent, -$parent->frequency);
        }
        
        return $queue->count() > 0 ? $queue->extract()['data'] : null;
    }

    /**
     * Generate Huffman codes
     */
    private function generateHuffmanCodes($node, $code = '')
    {
        if ($node === null) {
            return;
        }
        
        if ($node->isLeaf()) {
            $this->huffmanCodes[$node->symbol] = $code === '' ? '0' : $code;
            return;
        }
        
        $this->generateHuffmanCodes($node->left, $code . '0');
        $this->generateHuffmanCodes($node->right, $code . '1');
    }

    /**
     * Encode data using Huffman codes (optimized)
     */
    private function encodeData($data)
    {
        $encoded = '';
        $length = strlen($data);
        
        // Pre-allocate array for better performance
        $chunks = [];
        
        // Batch encode in chunks to reduce string concatenation overhead
        $chunkSize = 10000; // Process 10KB at a time
        for ($i = 0; $i < $length; $i += $chunkSize) {
            $chunk = '';
            $end = min($i + $chunkSize, $length);
            
            for ($j = $i; $j < $end; $j++) {
                $byte = ord($data[$j]);
                $chunk .= $this->huffmanCodes[$byte];
            }
            
            $chunks[] = $chunk;
        }
        
        // Join all chunks at once
        return implode('', $chunks);
    }

    /**
     * Convert bit string to packed binary (optimized)
     */
    private function packBits($bitString)
    {
        $length = strlen($bitString);
        
        // Pad to make length multiple of 8
        $padding = (8 - ($length % 8)) % 8;
        $bitString .= str_repeat('0', $padding);
        
        $totalLength = strlen($bitString);
        $packed = '';
        
        // Use str_split and array_map for better performance
        $bytes = str_split($bitString, 8);
        
        // Process in batches
        $batchSize = 1000;
        for ($i = 0; $i < count($bytes); $i += $batchSize) {
            $batch = array_slice($bytes, $i, $batchSize);
            foreach ($batch as $byte) {
                $packed .= chr(bindec($byte));
            }
        }
        
        return ['data' => $packed, 'padding' => $padding];
    }

    /**
     * Unpack binary to bit string
     */
    private function unpackBits($packedData, $padding)
    {
        $bitString = '';
        
        for ($i = 0; $i < strlen($packedData); $i++) {
            $byte = ord($packedData[$i]);
            $bitString .= str_pad(decbin($byte), 8, '0', STR_PAD_LEFT);
        }
        
        // Remove padding
        if ($padding > 0) {
            $bitString = substr($bitString, 0, -$padding);
        }
        
        return $bitString;
    }

    /**
     * Pack Huffman codes to binary format
     * Format: for each code: symbol(1 byte) + code_length(1 byte) + code_bits(packed)
     */
    private function packHuffmanCodes($codes)
    {
        $packed = '';
        $count = 0;
        
        foreach ($codes as $symbol => $code) {
            $count++;
            $symbol = (int)$symbol;
            $codeLength = strlen($code);
            
            // Pack: symbol (1 byte) + code length (1 byte)
            $packed .= pack('CC', $symbol, $codeLength);
            
            // Pack code bits (pad to byte boundary)
            $padding = (8 - ($codeLength % 8)) % 8;
            $paddedCode = $code . str_repeat('0', $padding);
            
            // Convert bit string to bytes
            for ($i = 0; $i < strlen($paddedCode); $i += 8) {
                $byte = substr($paddedCode, $i, 8);
                $packed .= chr(bindec($byte));
            }
        }
        
        return [
            'data' => $packed,
            'count' => $count,
        ];
    }

    /**
     * Unpack Huffman codes from binary format
     */
    private function unpackHuffmanCodes($binaryData, $count, &$offset)
    {
        $codes = [];
        
        for ($i = 0; $i < $count; $i++) {
            // Unpack symbol and code length
            $header = unpack('Csymbol/Clength', substr($binaryData, $offset, 2));
            $offset += 2;
            
            $symbol = $header['symbol'];
            $codeLength = $header['length'];
            
            // Calculate bytes needed for code
            $bytesNeeded = ceil($codeLength / 8);
            
            // Extract and convert bytes to bit string
            $code = '';
            for ($j = 0; $j < $bytesNeeded; $j++) {
                $byte = ord($binaryData[$offset++]);
                $code .= str_pad(decbin($byte), 8, '0', STR_PAD_LEFT);
            }
            
            // Trim to actual code length
            $codes[$symbol] = substr($code, 0, $codeLength);
        }
        
        return $codes;
    }

    /**
     * Decode data using Huffman tree (optimized with lookup table)
     */
    private function decodeData($encodedData, $tree, $symbolCount)
    {
        $decoded = '';
        $currentNode = $tree;
        $length = strlen($encodedData);
        $decodedCount = 0;
        
        // Pre-allocate for better memory efficiency
        $chunks = [];
        $chunkSize = 1000;
        $chunk = '';
        
        for ($i = 0; $i < $length && $decodedCount < $symbolCount; $i++) {
            $bit = $encodedData[$i];
            
            // Traverse tree
            $currentNode = ($bit === '0') ? $currentNode->left : $currentNode->right;
            
            if ($currentNode->isLeaf()) {
                $chunk .= chr($currentNode->symbol);
                $decodedCount++;
                
                // Store chunk when it reaches size limit
                if (strlen($chunk) >= $chunkSize) {
                    $chunks[] = $chunk;
                    $chunk = '';
                }
                
                $currentNode = $tree;
            }
        }
        
        // Add remaining chunk
        if ($chunk !== '') {
            $chunks[] = $chunk;
        }
        
        return implode('', $chunks);
    }

    /**
     * Rebuild Huffman tree from array
     */
    private function rebuildTreeFromArray($array)
    {
        if (!is_array($array)) {
            return null;
        }
        
        $node = new HuffmanNode(
            $array['symbol'] ?? null,
            $array['frequency'] ?? 0
        );
        
        if (isset($array['left'])) {
            $node->left = $this->rebuildTreeFromArray($array['left']);
        }
        
        if (isset($array['right'])) {
            $node->right = $this->rebuildTreeFromArray($array['right']);
        }
        
        return $node;
    }

    /**
     * Create image from pixel data
     */
    private function createImageFromPixels($pixels, $width, $height)
    {
        $image = imagecreatetruecolor($width, $height);
        $totalPixels = $width * $height;
        $dataSize = strlen($pixels);
        
        // Auto-detect format based on data size
        $isRGB = ($dataSize == $totalPixels * 3);
        $isGrayscale = ($dataSize == $totalPixels);
        
        if ($isRGB) {
            // RGB format (3 bytes per pixel)
            $index = 0;
            for ($y = 0; $y < $height; $y++) {
                for ($x = 0; $x < $width; $x++) {
                    if ($index + 2 < strlen($pixels)) {
                        $r = ord($pixels[$index]);
                        $g = ord($pixels[$index + 1]);
                        $b = ord($pixels[$index + 2]);
                        
                        $color = imagecolorallocate($image, $r, $g, $b);
                        imagesetpixel($image, $x, $y, $color);
                        $index += 3;
                    }
                }
            }
        } elseif ($isGrayscale) {
            // Grayscale format (1 byte per pixel) - for backward compatibility
            $index = 0;
            for ($y = 0; $y < $height; $y++) {
                for ($x = 0; $x < $width; $x++) {
                    if ($index < strlen($pixels)) {
                        $gray = ord($pixels[$index]);
                        $color = imagecolorallocate($image, $gray, $gray, $gray);
                        imagesetpixel($image, $x, $y, $color);
                        $index++;
                    }
                }
            }
        } else {
            throw new \Exception("Invalid pixel data size. Expected {$totalPixels} (grayscale) or " . ($totalPixels * 3) . " (RGB) bytes, got {$dataSize} bytes.");
        }
        
        return $image;
    }

    /**
     * Calculate entropy
     */
    private function calculateEntropy($frequencies, $totalSymbols)
    {
        $entropy = 0.0;
        
        foreach ($frequencies as $frequency) {
            $probability = $frequency / $totalSymbols;
            $entropy -= $probability * log($probability, 2);
        }
        
        return $entropy;
    }

    /**
     * Save compressed data with user-selected format
     */
    public function saveCompressedFile($encodedData, $metadata, $format = 'bin')
    {
        $filename = 'compressed_' . time();
        $path = 'public/compressed/';
        
        Storage::makeDirectory('public/compressed');
        
        switch (strtolower($format)) {
            case 'jpg':
            case 'jpeg':
                return $this->saveAsJpeg($encodedData, $metadata, $filename, $path);
            
            case 'bin':
            default:
                // Binary format is most efficient (no base64 overhead)
                return $this->saveAsBinary($encodedData, $metadata, $filename, $path);
        }
    }
    
    /**
     * Save as JPEG format (direct image output)
     */
    private function saveAsJpeg($encodedData, $metadata, $filename, $path)
    {
        // Validate input data
        if (empty($encodedData)) {
            throw new \Exception("Encoded data is empty for JPG output");
        }
        
        if (!isset($metadata['width'], $metadata['height']) || $metadata['width'] <= 0 || $metadata['height'] <= 0) {
            throw new \Exception("Invalid image dimensions for JPG output");
        }
        
        // Decompress grayscale data
        $decompressedData = gzuncompress($encodedData);
        if ($decompressedData === false) {
            throw new \Exception("Failed to decompress data for JPG output - invalid DEFLATE data");
        }
        
        // Validate decompressed data size
        $expectedSize = $metadata['width'] * $metadata['height'];
        $actualSize = strlen($decompressedData);
        
        if ($actualSize !== $expectedSize) {
            throw new \Exception("Decompressed data size mismatch. Expected: {$expectedSize} bytes, Got: {$actualSize} bytes");
        }
        
        // Create new image from decompressed grayscale data
        $image = imagecreatetruecolor($metadata['width'], $metadata['height']);
        if ($image === false) {
            throw new \Exception("Failed to create image resource");
        }
        
        // Enable alpha blending for better image quality
        imagealphablending($image, false);
        imagesavealpha($image, true);
        
        // Fill image with decompressed pixel data
        $pixelIndex = 0;
        for ($y = 0; $y < $metadata['height']; $y++) {
            for ($x = 0; $x < $metadata['width']; $x++) {
                if ($pixelIndex < strlen($decompressedData)) {
                    $gray = ord($decompressedData[$pixelIndex]);
                    // Ensure gray value is within valid range
                    $gray = max(0, min(255, $gray));
                    $color = imagecolorallocate($image, $gray, $gray, $gray);
                    if ($color !== false) {
                        imagesetpixel($image, $x, $y, $color);
                    } else {
                        // Fallback to direct pixel setting
                        $colorIndex = ($gray << 16) | ($gray << 8) | $gray;
                        imagesetpixel($image, $x, $y, $colorIndex);
                    }
                    $pixelIndex++;
                } else {
                    // This should not happen with proper validation above
                    $black = imagecolorallocate($image, 0, 0, 0);
                    imagesetpixel($image, $x, $y, $black);
                }
            }
        }
        
        // Create output filename and path
        $filename .= '.jpg';
        $fullPath = 'compressed/' . $filename;
        
        // Ensure directory exists
        Storage::disk('public')->makeDirectory('compressed');
        $diskPath = Storage::disk('public')->path($fullPath);
        
        // Save as JPEG with good quality
        $success = imagejpeg($image, $diskPath, 90);
        imagedestroy($image);
        
        if (!$success) {
            throw new \Exception("Failed to save JPG file: {$diskPath}");
        }
        
        // Verify file was created and has reasonable size
        if (!file_exists($diskPath)) {
            throw new \Exception("JPG file was not created: {$diskPath}");
        }
        
        $fileSize = filesize($diskPath);
        if ($fileSize === false || $fileSize < 100) {
            unlink($diskPath);
            throw new \Exception("JPG file appears corrupted or too small: {$fileSize} bytes");
        }
        
        return [
            'path' => 'public/' . $fullPath,
            'url' => '/storage/' . $fullPath,
            'filename' => $filename,
            'size' => $fileSize,
            'format' => 'jpg',
        ];
    }
    
    /**
     * Save as JSON format (optimized)
     */
    private function saveAsJson($encodedData, $metadata, $filename, $path)
    {
        $filename .= '.json';
        $fullPath = 'compressed/' . $filename;
        
        // Minimal JSON structure
        $jsonData = [
            'w' => $metadata['width'],
            'h' => $metadata['height'],
            'd' => base64_encode($encodedData), // Still need base64 for JSON
        ];
        
        // Compact JSON (no pretty print)
        $content = json_encode($jsonData);
        Storage::disk('public')->put($fullPath, $content);
        
        return [
            'path' => 'public/' . $fullPath,
            'url' => '/storage/' . $fullPath,
            'filename' => $filename,
            'size' => strlen($content),
            'format' => 'json',
        ];
    }
    
    /**
     * Save as ZIP format
     */
    private function saveAsZip($encodedData, $metadata, $filename, $path)
    {
        $filename .= '.zip';
        $fullPath = 'compressed/' . $filename;
        $diskPath = Storage::disk('public')->path($fullPath);
        
        $zip = new \ZipArchive();
        if ($zip->open($diskPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== TRUE) {
            throw new \Exception("Cannot create ZIP file");
        }
        
        // Add compressed data directly (no additional compression)
        $zip->addFromString('data.bin', $encodedData);
        
        // Minimal metadata
        $metadataJson = json_encode([
            'algorithm' => 'DEFLATE',
            'width' => $metadata['width'],
            'height' => $metadata['height'],
            'type' => $metadata['type'],
            'compressed_at' => date('Y-m-d H:i:s'),
        ], JSON_PRETTY_PRINT);
        
        $zip->addFromString('metadata.json', $metadataJson);
        
        // Add README
        $readme = "Kompresin - Huffman Image Compression\n";
        $readme .= "=====================================\n\n";
        $readme .= "Upload this ZIP to Kompresin to decompress.\n";
        $zip->addFromString('README.txt', $readme);
        
        $zip->close();
        
        return [
            'path' => 'public/' . $fullPath,
            'url' => '/storage/' . $fullPath,
            'filename' => $filename,
            'size' => filesize($diskPath),
            'format' => 'zip',
        ];
    }
    
    /**
     * Save as Binary format (most efficient)
     */
    private function saveAsBinary($encodedData, $metadata, $filename, $path)
    {
        // Validate input data
        if (empty($encodedData)) {
            throw new \Exception("Encoded data is empty");
        }
        
        if (!isset($metadata['width'], $metadata['height'])) {
            throw new \Exception("Invalid metadata: missing width or height");
        }
        
        $filename .= '.bin';
        $fullPath = 'compressed/' . $filename;
        
        // Ensure directory exists first
        Storage::disk('public')->makeDirectory('compressed');
        
        // Create comprehensive header with magic number for validation
        // Header format: magic(8) + version(4) + width(4) + height(4) + data_length(4) + algorithm(4) + checksum(4) + reserved(4)
        $magic = 'KOMPRSN2'; // Updated version
        $version = 2;
        $algorithm = 1; // 1 = DEFLATE
        $dataLength = strlen($encodedData);
        $checksum = crc32($encodedData); // Add checksum for data integrity
        $reserved = 0;
        
        // Pack header with proper byte order
        $header = $magic . pack('V*', 
            $version,
            $metadata['width'],
            $metadata['height'],
            $dataLength,
            $algorithm,
            $checksum,
            $reserved
        );
        
        // Combine header and data
        $binaryData = $header . $encodedData;
        
        // Use file_put_contents with proper flags for binary data
        $diskPath = Storage::disk('public')->path($fullPath);
        $dir = dirname($diskPath);
        
        if (!is_dir($dir)) {
            if (!mkdir($dir, 0755, true)) {
                throw new \Exception("Failed to create directory: {$dir}");
            }
        }
        
        // Write binary data with exclusive lock
        $bytesWritten = file_put_contents($diskPath, $binaryData, LOCK_EX | FILE_BINARY);
        
        if ($bytesWritten === false) {
            throw new \Exception("Failed to write binary file: {$diskPath}");
        }
        
        // Verify file integrity
        $actualSize = filesize($diskPath);
        $expectedSize = strlen($binaryData);
        
        if ($actualSize !== $expectedSize) {
            // Clean up corrupted file
            unlink($diskPath);
            throw new \Exception("File size mismatch. Expected: {$expectedSize} bytes, Got: {$actualSize} bytes");
        }
        
        // Additional verification - read back and verify
        $verifyData = file_get_contents($diskPath);
        if ($verifyData !== $binaryData) {
            unlink($diskPath);
            throw new \Exception("File verification failed - data corruption detected");
        }
        
        return [
            'path' => 'public/' . $fullPath,
            'url' => '/storage/' . $fullPath,
            'filename' => $filename,
            'size' => $actualSize,
            'format' => 'bin',
            'header_size' => strlen($header),
            'data_size' => $dataLength,
            'checksum' => sprintf('%08x', $checksum),
        ];
    }

    /**
     * Load compressed file (supports JPG, ZIP, JSON, and binary formats)
     */
    public function loadCompressedFile($path)
    {
        // Try to load from public disk first, then fallback to default
        if (Storage::disk('public')->exists($path)) {
            $content = Storage::disk('public')->get($path);
        } else {
            $content = Storage::get($path);
        }
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        
        // Handle JPG format (direct image, no decompression needed)
        if ($extension === 'jpg' || $extension === 'jpeg') {
            // For JPG files, we can't decompress back to original algorithm data
            // This is a lossy format, mainly for viewing purposes
            throw new \Exception('JPG format is output-only. Cannot be decompressed back to original data.');
        }
        
        // Try old TXT format for backward compatibility
        if ($extension === 'txt' && strpos($content, 'KOMPRESIN COMPRESSED IMAGE FILE') === 0) {
            // Parse old text format
            $lines = explode("\n", $content);
            $metadata = [];
            $dataStarted = false;
            $base64Data = '';
            
            foreach ($lines as $line) {
                if ($dataStarted) {
                    $base64Data .= trim($line);
                } elseif (strpos($line, 'Width:') === 0) {
                    $metadata['width'] = (int)trim(substr($line, 6));
                } elseif (strpos($line, 'Height:') === 0) {
                    $metadata['height'] = (int)trim(substr($line, 7));
                } elseif (strpos($line, 'Type:') === 0) {
                    $metadata['type'] = trim(substr($line, 5));
                } elseif (strpos($line, 'Algorithm:') === 0) {
                    $metadata['algorithm'] = trim(substr($line, 10));
                } elseif (strpos($line, 'DATA (Base64 Encoded):') === 0) {
                    $dataStarted = true;
                }
            }
            
            $encodedData = base64_decode($base64Data);
            
            return [
                'metadata' => [
                    'width' => $metadata['width'],
                    'height' => $metadata['height'],
                    'type' => $metadata['type'],
                    'algorithm' => $metadata['algorithm'] ?? 'DEFLATE',
                    'huffman_tree' => null,
                ],
                'encoded_data' => $encodedData,
            ];
        }
        
        // Try ZIP format
        if ($extension === 'zip') {
            // Try public disk first, then fallback
            if (Storage::disk('public')->exists($path)) {
                $fullPath = Storage::disk('public')->path($path);
            } else {
                $fullPath = Storage::path($path);
            }
            $zip = new \ZipArchive();
            if ($zip->open($fullPath) === TRUE) {
                $metadataJson = $zip->getFromName('metadata.json');
                if ($metadataJson !== false) {
                    $metadata = json_decode($metadataJson, true);
                    // Try both 'data.bin' (new format) and 'compressed.dat' (old format)
                    $encodedData = $zip->getFromName('data.bin');
                    if ($encodedData === false) {
                        $encodedData = $zip->getFromName('compressed.dat');
                    }
                    $zip->close();
                    
                    if ($encodedData !== false) {
                        return [
                            'metadata' => [
                                'width' => $metadata['width'],
                                'height' => $metadata['height'],
                                'type' => $metadata['type'],
                                'algorithm' => $metadata['algorithm'] ?? 'DEFLATE',
                                'huffman_tree' => null,
                            ],
                            'encoded_data' => $encodedData,
                        ];
                    }
                }
                $zip->close();
            }
        }
        
        // Try JSON format (both old and new compact format)
        $jsonData = json_decode($content, true);
        if ($jsonData) {
            // New compact format
            if (isset($jsonData['w']) && isset($jsonData['h']) && isset($jsonData['d'])) {
                $encodedData = base64_decode($jsonData['d']);
                
                return [
                    'metadata' => [
                        'width' => $jsonData['w'],
                        'height' => $jsonData['h'],
                        'type' => 'unknown',
                        'algorithm' => 'DEFLATE',
                        'huffman_tree' => null,
                    ],
                    'encoded_data' => $encodedData,
                ];
            }
            // Old format with metadata
            elseif (isset($jsonData['data']) && isset($jsonData['metadata'])) {
                $encodedData = base64_decode($jsonData['data']);
                $metadata = $jsonData['metadata'];
                
                return [
                    'metadata' => [
                        'width' => $metadata['width'],
                        'height' => $metadata['height'],
                        'type' => $metadata['type'],
                        'algorithm' => $jsonData['algorithm'] ?? 'DEFLATE',
                        'huffman_tree' => null,
                    ],
                    'encoded_data' => $encodedData,
                ];
            }
        }
        
        // Try new binary format with magic number and checksum (36-byte header)
        if (strlen($content) > 36) {
            $magic = substr($content, 0, 8);
            if ($magic === 'KOMPRSN2') {
                $headerData = unpack('Vversion/Vwidth/Vheight/Vlength/Valgorithm/Vchecksum/Vreserved', substr($content, 8, 28));
                
                if ($headerData && $headerData['length'] == strlen($content) - 36) {
                    $encodedData = substr($content, 36);
                    
                    // Verify data integrity using checksum
                    $calculatedChecksum = crc32($encodedData);
                    if ($calculatedChecksum !== $headerData['checksum']) {
                        throw new \Exception("File corruption detected. Checksum mismatch.");
                    }
                    
                    $algorithmMap = [1 => 'DEFLATE'];
                    $algorithm = $algorithmMap[$headerData['algorithm']] ?? 'Unknown';
                    
                    return [
                        'metadata' => [
                            'width' => $headerData['width'],
                            'height' => $headerData['height'],
                            'type' => 'unknown',
                            'algorithm' => $algorithm,
                            'huffman_tree' => null,
                            'version' => $headerData['version'],
                            'checksum' => sprintf('%08x', $headerData['checksum']),
                        ],
                        'encoded_data' => $encodedData,
                    ];
                }
            }
        }
        
        // Try old binary format with magic number (32-byte header) - backward compatibility
        if (strlen($content) > 32) {
            $magic = substr($content, 0, 8);
            if ($magic === 'KOMPRSN1') {
                $headerData = unpack('Vversion/Vwidth/Vheight/Vlength/Valgorithm/Vreserved', substr($content, 8, 24));
                
                if ($headerData && $headerData['length'] == strlen($content) - 32) {
                    $encodedData = substr($content, 32);
                    
                    $algorithmMap = [1 => 'DEFLATE'];
                    $algorithm = $algorithmMap[$headerData['algorithm']] ?? 'Unknown';
                    
                    return [
                        'metadata' => [
                            'width' => $headerData['width'],
                            'height' => $headerData['height'],
                            'type' => 'unknown',
                            'algorithm' => $algorithm,
                            'huffman_tree' => null,
                            'version' => $headerData['version'],
                        ],
                        'encoded_data' => $encodedData,
                    ];
                }
            }
        }
        
        // Try old binary format (12-byte header) for backward compatibility
        if (strlen($content) > 12) {
            $header = unpack('Vwidth/Vheight/Vlength', substr($content, 0, 12));
            if ($header && $header['length'] == strlen($content) - 12) {
                $encodedData = substr($content, 12);
                
                return [
                    'metadata' => [
                        'width' => $header['width'],
                        'height' => $header['height'],
                        'type' => 'unknown',
                        'algorithm' => 'DEFLATE',
                        'huffman_tree' => null,
                    ],
                    'encoded_data' => $encodedData,
                ];
            }
        }
        
        // Fallback: Old binary format (6-byte header)
        $binaryData = $content;
        if (strlen($binaryData) > 6) {
            $header = unpack('vwidth/vheight/Ctype/Calgorithm', substr($binaryData, 0, 6));
            
            $width = $header['width'];
            $height = $header['height'];
            
            $typeMap = [1 => 'jpg', 2 => 'png', 3 => 'bmp'];
            $type = $typeMap[$header['type']] ?? 'png';
            
            $algorithm = $header['algorithm'] === 1 ? 'DEFLATE' : 'Unknown';
            
            $encodedData = substr($binaryData, 6);
            
            return [
                'metadata' => [
                    'width' => $width,
                    'height' => $height,
                    'type' => $type,
                    'algorithm' => $algorithm,
                    'huffman_tree' => null,
                ],
                'encoded_data' => $encodedData,
            ];
        }
        
        throw new \Exception("Invalid compressed file format");
    }

    /**
     * Rebuild Huffman tree from codes
     */
    private function rebuildTreeFromCodes($codes)
    {
        $root = new HuffmanNode(null, 0);
        
        foreach ($codes as $symbol => $code) {
            $currentNode = $root;
            
            for ($i = 0; $i < strlen($code); $i++) {
                $bit = $code[$i];
                
                if ($bit === '0') {
                    if ($currentNode->left === null) {
                        $currentNode->left = new HuffmanNode(null, 0);
                    }
                    $currentNode = $currentNode->left;
                } else {
                    if ($currentNode->right === null) {
                        $currentNode->right = new HuffmanNode(null, 0);
                    }
                    $currentNode = $currentNode->right;
                }
            }
            
            $currentNode->symbol = (int)$symbol;
        }
        
        return $root->toArray();
    }

    /**
     * Get Huffman codes for visualization
     */
    public function getHuffmanCodesForVisualization()
    {
        $codes = [];
        
        foreach ($this->huffmanCodes as $symbol => $code) {
            $codes[] = [
                'symbol' => $symbol,
                'frequency' => $this->frequencyTable[$symbol] ?? 0,
                'code' => $code,
                'bits' => strlen($code),
            ];
        }
        
        // Sort by frequency descending
        usort($codes, function($a, $b) {
            return $b['frequency'] - $a['frequency'];
        });
        
        return $codes;
    }
}
