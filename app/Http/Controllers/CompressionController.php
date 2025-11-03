<?php

namespace App\Http\Controllers;

use App\Models\CompressionHistory;
use App\Services\HuffmanCompressionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CompressionController extends Controller
{
    protected $huffmanService;

    public function __construct(HuffmanCompressionService $huffmanService)
    {
        $this->huffmanService = $huffmanService;
    }

    /**
     * Show compression page
     */
    public function index()
    {
        return Inertia::render('Compression/Index');
    }

    /**
     * Show decompression page
     */
    public function decompressPage()
    {
        return Inertia::render('Decompression/Index');
    }

    /**
     * Show history page
     */
    public function history()
    {
        $histories = CompressionHistory::latest()->paginate(20);
        
        return Inertia::render('History/Index', [
            'histories' => $histories,
        ]);
    }

    /**
     * Compress image
     */
    public function compress(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png,bmp|max:20480', // max 20MB
            'format' => 'nullable|string|in:txt,json,zip,bin', // format pilihan user
        ]);

        try {
            // Store uploaded image
            $image = $request->file('image');
            $originalFilename = $image->getClientOriginalName();
            
            // Check image dimensions before processing
            list($width, $height) = getimagesize($image->getPathname());
            $totalPixels = $width * $height;
            
            if ($totalPixels > 100000000) { // 100 megapixels
                return response()->json([
                    'success' => false,
                    'message' => "Gambar terlalu besar! Maksimum 100 megapixels. Gambar Anda: {$width}x{$height} = " . number_format($totalPixels) . " pixels. Coba resize gambar terlebih dahulu.",
                ], 422);
            }
            
            // Create directory if not exists
            Storage::makeDirectory('public/originals');
            
            $originalPath = $image->storeAs('public/originals', time() . '_' . $originalFilename);
            
            // Verify file exists using Storage facade
            if (!Storage::exists($originalPath)) {
                throw new \Exception('Failed to store uploaded file: ' . $originalPath);
            }
            
            // Get full path using Storage::path() - this returns proper Windows path
            $fullPath = Storage::path($originalPath);
            
            // Verify physical file exists
            if (!file_exists($fullPath)) {
                throw new \Exception('File stored but not found at: ' . $fullPath);
            }

            // Get ACTUAL file size of uploaded JPG/PNG
            $originalFileSize = filesize($fullPath);

            // Compress image
            try {
                $compressionResult = $this->huffmanService->compress($fullPath);
            } catch (\Exception $e) {
                Log::error('Compression service error', [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                ]);
                throw $e;
            }

            // Save compressed file
            $format = $request->input('format', 'txt'); // Default to txt
            $compressedFile = $this->huffmanService->saveCompressedFile(
                $compressionResult['encoded_data'],
                [
                    'huffman_tree' => $compressionResult['huffman_tree'] ?? null,
                    'huffman_codes' => $compressionResult['huffman_codes'] ?? [],
                    'width' => $compressionResult['width'],
                    'height' => $compressionResult['height'],
                    'type' => $compressionResult['type'],
                    'algorithm' => $compressionResult['algorithm'] ?? 'DEFLATE',
                ],
                $format // Pass format parameter
            );

            // Get Huffman codes for visualization
            $huffmanCodesVisualization = $this->huffmanService->getHuffmanCodesForVisualization();

            // Calculate compression metrics
            // Compare with actual file size (JPG/PNG original file)
            $pixelDataSize = $compressionResult['original_size']; // Grayscale pixel data
            $binaryFileSize = $compressedFile['size']; // .bin file with header
            
            // Compression ratio based on pixel data (theoretical)
            $pixelCompressionRatio = (1 - ($binaryFileSize / $pixelDataSize)) * 100;
            
            // Real file comparison (JPG/PNG → .bin)
            $fileCompressionRatio = (1 - ($binaryFileSize / $originalFileSize)) * 100;

            // Save to history
            $history = CompressionHistory::create([
                'type' => 'compress',
                'filename' => $originalFilename,
                'original_path' => $originalPath,
                'compressed_path' => $compressedFile['path'],
                'original_size' => $pixelDataSize, // Pixel data size for algorithm analysis
                'compressed_size' => $binaryFileSize,
                'compression_ratio' => $pixelCompressionRatio, // Theoretical compression
                'bits_per_pixel' => $compressionResult['bits_per_pixel'],
                'entropy' => $compressionResult['entropy'],
                'huffman_table' => $compressionResult['huffman_codes'],
                'image_width' => $compressionResult['width'],
                'image_height' => $compressionResult['height'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Image compressed successfully',
                'data' => [
                    'original_size' => $pixelDataSize,
                    'compressed_size' => $binaryFileSize,
                    'compression_ratio' => round($pixelCompressionRatio, 2),
                    'original_file_size' => $originalFileSize, // Actual JPG/PNG file size
                    'file_compression_ratio' => round($fileCompressionRatio, 2), // Real file comparison
                    'bits_per_pixel' => round($compressionResult['bits_per_pixel'], 4),
                    'entropy' => round($compressionResult['entropy'], 4),
                    'width' => $compressionResult['width'],
                    'height' => $compressionResult['height'],
                    'compressed_file_url' => $compressedFile['url'],
                    'compressed_filename' => $compressedFile['filename'],
                    'algorithm' => $compressionResult['algorithm'] ?? 'DEFLATE (LZ77 + Huffman)',
                    'compression_time' => round($compressionResult['compression_time'] ?? 0, 3),
                    'original_image_url' => Storage::url($originalPath),
                    'huffman_tree' => $compressionResult['huffman_tree'],
                    'huffman_codes' => $huffmanCodesVisualization,
                    'history_id' => $history->id,
                ],
            ]);

        } catch (\Exception $e) {
            // Log error for debugging
            Log::error('Compression error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Compression failed: ' . $e->getMessage(),
                'error' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ] : null,
            ], 500);
        }
    }

    /**
     * Decompress image
     */
    public function decompress(Request $request)
    {
        $request->validate([
            'compressed_file' => 'required|file|max:10240',
        ]);

        try {
            // Store uploaded compressed file
            $file = $request->file('compressed_file');
            $filename = $file->getClientOriginalName();
            $path = $file->storeAs('public/compressed', time() . '_' . $filename);

            // Load compressed data
            $compressedData = $this->huffmanService->loadCompressedFile($path);

            if (!isset($compressedData['metadata']) || !isset($compressedData['encoded_data'])) {
                throw new \Exception('Invalid compressed file format');
            }

            $metadata = $compressedData['metadata'];
            $encodedData = $compressedData['encoded_data'];

            // Decompress
            $decompressedImage = $this->huffmanService->decompress(
                $encodedData,
                $metadata['huffman_tree'],
                $metadata['width'],
                $metadata['height'],
                $metadata['type'],
                $metadata['algorithm'] ?? 'DEFLATE'
            );

            // Calculate file sizes
            // For compressed file, try public disk first
            if (Storage::disk('public')->exists($path)) {
                $compressedSize = Storage::disk('public')->size($path);
            } else {
                $compressedSize = Storage::size($path);
            }
            
            // For decompressed file, extract path from the return value
            $decompressedPath = str_replace('public/', '', $decompressedImage['path']);
            $decompressedSize = Storage::disk('public')->size($decompressedPath);

            // Save to history
            $history = CompressionHistory::create([
                'type' => 'decompress',
                'filename' => $filename,
                'compressed_path' => $path,
                'decompressed_path' => $decompressedImage['path'],
                'original_size' => $decompressedSize,
                'compressed_size' => $compressedSize,
                'compression_ratio' => (1 - ($compressedSize / $decompressedSize)) * 100,
                'image_width' => $metadata['width'],
                'image_height' => $metadata['height'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Image decompressed successfully',
                'data' => [
                    'decompressed_image_url' => $decompressedImage['url'],
                    'decompressed_filename' => $decompressedImage['filename'],
                    'decompression_time' => round($decompressedImage['decompression_time'] ?? 0, 3),
                    'width' => $metadata['width'],
                    'height' => $metadata['height'],
                    'compressed_size' => $compressedSize,
                    'decompressed_size' => $decompressedSize,
                    'history_id' => $history->id,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Decompression failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete history record
     */
    public function deleteHistory($id)
    {
        try {
            $history = CompressionHistory::findOrFail($id);

            // Delete associated files
            if ($history->original_path && Storage::exists($history->original_path)) {
                Storage::delete($history->original_path);
            }
            if ($history->compressed_path && Storage::exists($history->compressed_path)) {
                Storage::delete($history->compressed_path);
            }
            if ($history->decompressed_path && Storage::exists($history->decompressed_path)) {
                Storage::delete($history->decompressed_path);
            }

            $history->delete();

            return response()->json([
                'success' => true,
                'message' => 'History deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete history: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get comparison with standard compression
     */
    public function getComparison(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png|max:10240',
        ]);

        try {
            $image = $request->file('image');
            $originalSize = $image->getSize();

            // Save as JPEG
            $jpegPath = $image->storeAs('public/temp', 'temp_jpeg_' . time() . '.jpg');
            $jpegSize = Storage::size($jpegPath);
            $jpegRatio = (1 - ($jpegSize / $originalSize)) * 100;

            // Save as PNG
            $pngPath = $image->storeAs('public/temp', 'temp_png_' . time() . '.png');
            $pngSize = Storage::size($pngPath);
            $pngRatio = (1 - ($pngSize / $originalSize)) * 100;

            // Clean up temp files
            Storage::delete([$jpegPath, $pngPath]);

            return response()->json([
                'success' => true,
                'data' => [
                    'jpeg' => [
                        'size' => $jpegSize,
                        'ratio' => round($jpegRatio, 2),
                    ],
                    'png' => [
                        'size' => $pngSize,
                        'ratio' => round($pngRatio, 2),
                    ],
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Comparison failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
