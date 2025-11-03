<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class HuffmanCompressionService
{
    private $huffmanCodes = [];
    private $huffmanTree = null;
    private $frequencyTable = [];

    /**
     * Compress an image using Huffman coding
     */
    public function compress($imagePath)
    {
        // Load image
        $imageData = $this->loadImage($imagePath);
        if (!$imageData) {
            throw new \Exception("Failed to load image");
        }

        // Get pixel data
        $pixels = $this->getPixelData($imageData['resource'], $imageData['width'], $imageData['height']);
        
        // Build frequency table
        $this->frequencyTable = $this->buildFrequencyTable($pixels);
        
        // Build Huffman tree
        $this->huffmanTree = $this->buildHuffmanTree($this->frequencyTable);
        
        // Generate Huffman codes
        $this->huffmanCodes = [];
        $this->generateHuffmanCodes($this->huffmanTree, '');
        
        // Encode pixel data
        $encodedData = $this->encodeData($pixels);
        
        // Pack bits to binary for efficient storage
        $packedResult = $this->packBits($encodedData);
        $packedData = $packedResult['data'];
        $padding = $packedResult['padding'];
        
        // Filter only used huffman codes (symbols that appear in data)
        $usedCodes = array_intersect_key($this->huffmanCodes, $this->frequencyTable);
        
        // Calculate statistics
        $originalSize = strlen($pixels);
        $compressedSize = strlen($packedData); // Now using packed binary size
        $compressionRatio = (1 - ($compressedSize / $originalSize)) * 100;
        $bitsPerPixel = strlen($encodedData) / ($imageData['width'] * $imageData['height']);
        $entropy = $this->calculateEntropy($this->frequencyTable, $originalSize);
        
        return [
            'encoded_data' => $packedData, // Store packed binary
            'padding' => $padding, // Store padding info for unpacking
            'huffman_codes' => $usedCodes, // Only store used codes
            'huffman_tree' => $this->huffmanTree ? $this->huffmanTree->toArray() : null,
            'frequency_table' => $this->frequencyTable,
            'original_size' => $originalSize,
            'compressed_size' => $compressedSize,
            'compression_ratio' => $compressionRatio,
            'bits_per_pixel' => $bitsPerPixel,
            'entropy' => $entropy,
            'width' => $imageData['width'],
            'height' => $imageData['height'],
            'type' => $imageData['type'],
        ];
    }

    /**
     * Decompress data using Huffman tree
     */
    public function decompress($compressedData, $huffmanTree, $width, $height, $imageType = 'png', $padding = 0)
    {
        // Rebuild tree from array
        $tree = $this->rebuildTreeFromArray($huffmanTree);
        
        // Unpack binary data to bit string
        $bitString = $this->unpackBits($compressedData, $padding);
        
        // Decode data
        $decodedPixels = $this->decodeData($bitString, $tree, $width * $height);
        
        // Create image from pixels
        $image = $this->createImageFromPixels($decodedPixels, $width, $height);
        
        // Save image
        $filename = 'decompressed_' . time() . '.' . $imageType;
        $path = 'public/decompressed/' . $filename;
        
        Storage::makeDirectory('public/decompressed');
        
        // Use Storage::path() for proper path handling
        $fullPath = Storage::path($path);
        
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
            'path' => $path,
            'url' => Storage::url($path),
            'filename' => $filename,
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
                
                // Store as single byte (grayscale conversion for simplicity)
                // You can modify this to handle RGB separately
                $gray = (int)(($r + $g + $b) / 3);
                $pixels .= chr($gray);
            }
        }
        
        return $pixels;
    }

    /**
     * Build frequency table
     */
    private function buildFrequencyTable($data)
    {
        $frequencies = [];
        $length = strlen($data);
        
        for ($i = 0; $i < $length; $i++) {
            $byte = ord($data[$i]);
            if (!isset($frequencies[$byte])) {
                $frequencies[$byte] = 0;
            }
            $frequencies[$byte]++;
        }
        
        return $frequencies;
    }

    /**
     * Build Huffman tree
     */
    private function buildHuffmanTree($frequencies)
    {
        $nodes = [];
        
        // Create leaf nodes
        foreach ($frequencies as $symbol => $frequency) {
            $nodes[] = new HuffmanNode($symbol, $frequency);
        }
        
        // Build tree
        while (count($nodes) > 1) {
            // Sort by frequency
            usort($nodes, function($a, $b) {
                return $a->frequency - $b->frequency;
            });
            
            // Take two nodes with lowest frequency
            $left = array_shift($nodes);
            $right = array_shift($nodes);
            
            // Create parent node
            $parent = new HuffmanNode(
                null,
                $left->frequency + $right->frequency,
                $left,
                $right
            );
            
            $nodes[] = $parent;
        }
        
        return $nodes[0] ?? null;
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
     * Encode data using Huffman codes
     */
    private function encodeData($data)
    {
        $encoded = '';
        $length = strlen($data);
        
        for ($i = 0; $i < $length; $i++) {
            $byte = ord($data[$i]);
            $encoded .= $this->huffmanCodes[$byte];
        }
        
        return $encoded;
    }

    /**
     * Convert bit string to packed binary
     */
    private function packBits($bitString)
    {
        $packed = '';
        $length = strlen($bitString);
        
        // Pad to make length multiple of 8
        $padding = (8 - ($length % 8)) % 8;
        $bitString .= str_repeat('0', $padding);
        
        // Pack 8 bits at a time into bytes
        for ($i = 0; $i < strlen($bitString); $i += 8) {
            $byte = substr($bitString, $i, 8);
            $packed .= chr(bindec($byte));
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
     * Decode data using Huffman tree
     */
    private function decodeData($encodedData, $tree, $symbolCount)
    {
        $decoded = '';
        $currentNode = $tree;
        $length = strlen($encodedData);
        
        for ($i = 0; $i < $length && strlen($decoded) < $symbolCount; $i++) {
            $bit = $encodedData[$i];
            
            if ($bit === '0') {
                $currentNode = $currentNode->left;
            } else {
                $currentNode = $currentNode->right;
            }
            
            if ($currentNode->isLeaf()) {
                $decoded .= chr($currentNode->symbol);
                $currentNode = $tree;
            }
        }
        
        return $decoded;
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
     * Save compressed data to binary file
     */
    public function saveCompressedFile($encodedData, $metadata)
    {
        $filename = 'compressed_' . time() . '.bin';
        $path = 'public/compressed/' . $filename;
        
        Storage::makeDirectory('public/compressed');
        
        // Pack Huffman codes to binary format
        $packedCodes = $this->packHuffmanCodes($metadata['huffman_codes']);
        
        // Create ultra-compact binary header
        $header = pack('v3C', 
            $metadata['width'],     // 2 bytes - width (up to 65535)
            $metadata['height'],    // 2 bytes - height (up to 65535)
            $packedCodes['count'],  // 2 bytes - number of codes
            $metadata['padding']    // 1 byte - padding bits
        );
        
        // Add image type (1 byte: 1=jpg, 2=png, 3=bmp)
        $typeMap = ['jpg' => 1, 'jpeg' => 1, 'png' => 2, 'bmp' => 3];
        $header .= pack('C', $typeMap[$metadata['type']] ?? 2);
        
        // Binary format: header (8 bytes) + packed_codes + encoded_data
        $binaryData = $header . $packedCodes['data'] . $encodedData;
        
        Storage::put($path, $binaryData);
        
        return [
            'path' => $path,
            'url' => Storage::url($path),
            'filename' => $filename,
            'size' => strlen($binaryData),
        ];
    }

    /**
     * Load compressed file
     */
    public function loadCompressedFile($path)
    {
        $binaryData = Storage::get($path);
        
        // Read header (8 bytes)
        $header = unpack('vwidth/vheight/vcount/Cpadding/Ctype', substr($binaryData, 0, 8));
        
        $width = $header['width'];
        $height = $header['height'];
        $codesCount = $header['count'];
        $padding = $header['padding'];
        
        // Map type back
        $typeMap = [1 => 'jpg', 2 => 'png', 3 => 'bmp'];
        $type = $typeMap[$header['type']] ?? 'png';
        
        // Unpack Huffman codes
        $offset = 8;
        $codes = $this->unpackHuffmanCodes($binaryData, $codesCount, $offset);
        
        // Read encoded data (rest of file)
        $encodedData = substr($binaryData, $offset);
        
        // Rebuild tree from codes
        $huffmanTree = $this->rebuildTreeFromCodes($codes);
        
        return [
            'metadata' => [
                'width' => $width,
                'height' => $height,
                'type' => $type,
                'padding' => $padding,
                'huffman_tree' => $huffmanTree,
                'huffman_codes' => $codes,
            ],
            'encoded_data' => $encodedData,
        ];
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
